// ============================================
// MAP.JS - Leaflet map initialization
// ============================================

        function initMap() {
            map = L.map('map').setView([43.2964, 17.0175], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            map.on('click', function(e) {
                if (document.getElementById('addRestaurantModal').style.display === 'block') {
                    selectedLocation = e.latlng;
                    document.getElementById('lat').value = e.latlng.lat;
                    document.getElementById('lng').value = e.latlng.lng;
                    document.getElementById('location').value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                }
            });

            loadMarkers();
            populateSidebar();
            initAutocomplete();
        }

        // Restaurant autocomplete using OpenStreetMap
        function initAutocomplete() {
            const nameInput = document.getElementById('name');
            const resultsDiv = document.getElementById('autocompleteResults');
            let debounceTimer;
            let selectedRestaurantData = null;

            nameInput.addEventListener('input', function() {
                const query = this.value.trim();
                clearTimeout(debounceTimer);
                
                if (query.length < 3) {
                    resultsDiv.classList.remove('show');
                    return;
                }

                debounceTimer = setTimeout(() => {
                    searchRestaurants(query);
                }, 500);
            });

            nameInput.addEventListener('focus', function() {
                if (resultsDiv.children.length > 0 && this.value.length >= 3) {
                    resultsDiv.classList.add('show');
                }
            });

            document.addEventListener('click', function(e) {
                if (!nameInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                    resultsDiv.classList.remove('show');
                }
            });

            async function searchRestaurants(query) {
                // Don't show loading state to avoid confusion if search fails
                try {
                    // Search for restaurants/cafes/bars in Makarska area
                    const bbox = '17.0,43.2,17.1,43.35'; // Makarska bounding box
                    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}+restaurant+cafe+bar&format=json&limit=8&bounded=1&viewbox=${bbox}&addressdetails=1`;
                    
                    const response = await fetch(url, {
                        headers: {
                            'Accept-Language': 'en'
                        }
                    });
                    
                    if (!response.ok) {
                        resultsDiv.classList.remove('show');
                        return;
                    }
                    
                    const data = await response.json();
                    
                    if (data.length > 0) {
                        displayResults(data.slice(0, 8));
                    } else {
                        resultsDiv.classList.remove('show');
                    }
                } catch (error) {
                    // Silently fail - user can still type manually
                    resultsDiv.classList.remove('show');
                }
            }

            function displayResults(results) {
                if (results.length === 0) {
                    resultsDiv.classList.remove('show');
                    return;
                }

                resultsDiv.innerHTML = results.map(place => {
                    const name = place.name || place.display_name.split(',')[0];
                    const address = place.address ? 
                        [place.address.road, place.address.house_number, place.address.city || place.address.town].filter(Boolean).join(', ') :
                        place.display_name.split(',').slice(1, 3).join(',');
                    const type = place.type || place.class || '';
                    
                    return `
                        <div class="autocomplete-item" data-name="${name}" data-lat="${place.lat}" data-lng="${place.lon}" data-address="${address}">
                            <div class="name">${name}</div>
                            <div class="address">${address}</div>
                            ${type ? `<div class="type">${type}</div>` : ''}
                        </div>
                    `;
                }).join('');

                resultsDiv.classList.add('show');

                // Add click handlers
                resultsDiv.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', function() {
                        nameInput.value = this.dataset.name;
                        document.getElementById('lat').value = this.dataset.lat;
                        document.getElementById('lng').value = this.dataset.lng;
                        document.getElementById('location').value = `${parseFloat(this.dataset.lat).toFixed(5)}, ${parseFloat(this.dataset.lng).toFixed(5)}`;
                        
                        // Update map marker
                        selectedLocation = {lat: parseFloat(this.dataset.lat), lng: parseFloat(this.dataset.lng)};
                        map.setView([this.dataset.lat, this.dataset.lng], 17);
                        
                        resultsDiv.classList.remove('show');
                    });
                });
            }
        }
