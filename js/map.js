// ============================================
// MAP.JS - Leaflet map initialization and markers
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

        async function geocodeAddress(address, restaurantName) {
            if (!address) return null;
            
            const searchQuery = `${address}, Makarska, Croatia`;
            
            try {
                // Try Google Geocoding API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`
                );
                const data = await response.json();
                
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    console.log(`Geocoded "${restaurantName}": ${location.lat}, ${location.lng}`);
                    return {
                        lat: location.lat,
                        lng: location.lng
                    };
                } else {
                    console.error(`Geocoding failed for ${restaurantName}: ${data.status}`);
                }
            } catch (error) {
                console.error(`Geocoding failed for ${restaurantName}:`, error);
                console.log('Tips: Kör filen lokalt i din webbläsare för att geocoding ska fungera.');
            }
            return null;
        }

        function loadMarkers() {
            // Remove existing cluster group
            if (markerClusterGroup) {
                map.removeLayer(markerClusterGroup);
            }
            markers = [];
            
            // Create new cluster group
            markerClusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function(cluster) {
                    const count = cluster.getChildCount();
                    let size = 40;
                    if (count >= 10) size = 50;
                    if (count >= 50) size = 60;
                    
                    return L.divIcon({
                        html: `<div style="width: ${size}px; height: ${size}px; background: #2d3436; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white;">${count}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: [size, size],
                        iconAnchor: [size/2, size/2]
                    });
                }
            });

            restaurants.forEach(restaurant => {
                const mainCat = restaurant.mainCategory || 'restaurant';
                const icon = mainCategoryIcons[mainCat] || '🍴';
                const iconBg = mainCategoryColors[mainCat] || '#ff6b6b';
                const svg = mainCategorySvg[mainCat] || mainCategorySvg['restaurant'];
                const shortName = restaurant.name.length > 12 ? restaurant.name.substring(0, 11) + '…' : restaurant.name;

                let iconHtml;
                let iconSize;
                let iconAnchor;

                if (currentPinStyle === 'circle-dot') {
                    // Circle + Dot style
                    iconHtml = `<div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 50px; height: 50px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.2); border: 3px solid white;">
                            ${svg}
                        </div>
                        <div style="width: 10px; height: 10px; background: ${iconBg}; border-radius: 50%; margin-top: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
                    </div>`;
                    iconSize = [56, 70];
                    iconAnchor = [28, 66];
                } else {
                    // Float Card style (default)
                    iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                        <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                        <span style="font-size: 12px; font-weight: 700; color: #2d3436;">${shortName}</span>
                    </div>`;
                    iconSize = [140, 44];
                    iconAnchor = [20, 22];
                }

                const emojiIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-emoji-icon',
                    iconSize: iconSize,
                    iconAnchor: iconAnchor
                });

                const marker = L.marker([restaurant.lat, restaurant.lng], { icon: emojiIcon });
                marker.restaurantId = restaurant.id;
                marker.on('click', function() {
                    viewRestaurantWithDishes(restaurant.id);
                });

                markers.push(marker);
                markerClusterGroup.addLayer(marker);
            });
            
            map.addLayer(markerClusterGroup);
        }

        const searchInput = document.getElementById('searchInput');
        const searchDropdown = document.getElementById('searchDropdown');
        let activeDropdownIndex = -1;
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Filter markers on map
            markers.forEach((marker, index) => {
                const restaurant = restaurants[index];
                if (restaurant.name.toLowerCase().includes(searchTerm) || 
                    restaurant.notes.toLowerCase().includes(searchTerm) ||
                    restaurant.cuisine.toLowerCase().includes(searchTerm)) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.3);
                }
            });
            
            // Show dropdown with suggestions
            if (searchTerm.length >= 1) {
                showSearchSuggestions(searchTerm);
            } else {
                hideSearchDropdown();
            }
        });
        
        searchInput.addEventListener('keydown', function(e) {
            const items = searchDropdown.querySelectorAll('.search-dropdown-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeDropdownIndex = Math.min(activeDropdownIndex + 1, items.length - 1);
                updateActiveDropdownItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeDropdownIndex = Math.max(activeDropdownIndex - 1, 0);
                updateActiveDropdownItem(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
                    items[activeDropdownIndex].click();
                }
            } else if (e.key === 'Escape') {
                hideSearchDropdown();
                searchInput.blur();
            }
        });
        
        searchInput.addEventListener('focus', function() {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm.length >= 1) {
                showSearchSuggestions(searchTerm);
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header-search')) {
                hideSearchDropdown();
            }
        });
        

        function openLocationPicker() {
            const modal = document.getElementById('locationPickerModal');
            modal.classList.add('open');
            
            // Initialize map if not already done
            setTimeout(() => {
                if (!locationPickerMap) {
                    locationPickerMap = L.map('locationPickerMap').setView([43.2965, 17.0175], 14);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(locationPickerMap);
                    
                    // Add click handler to map
                    locationPickerMap.on('click', function(e) {
                        placeLocationMarker(e.latlng.lat, e.latlng.lng);
                    });
                } else {
                    locationPickerMap.invalidateSize();
                }
                
                // If we already have a picked location, show it
                if (pickedLocation) {
                    placeLocationMarker(pickedLocation.lat, pickedLocation.lng);
                    locationPickerMap.setView([pickedLocation.lat, pickedLocation.lng], 16);
                }
            }, 100);
        }

        function closeLocationPicker() {
            const modal = document.getElementById('locationPickerModal');
            modal.classList.remove('open');
        }

        function placeLocationMarker(lat, lng) {
            // Remove existing marker
            if (locationPickerMarker) {
                locationPickerMap.removeLayer(locationPickerMarker);
            }
            
            // Create custom pin icon
            const pinIcon = L.divIcon({
                html: '<div style="font-size: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>',
                className: 'custom-pin-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            
            // Add new marker
            locationPickerMarker = L.marker([lat, lng], { 
                icon: pinIcon,
                draggable: true 
            }).addTo(locationPickerMap);
            
            // Update on drag
            locationPickerMarker.on('dragend', function(e) {
                const pos = e.target.getLatLng();
                pickedLocation = { lat: pos.lat, lng: pos.lng };
                reverseGeocode(pos.lat, pos.lng);
            });
            
            pickedLocation = { lat, lng };
            
            // Enable confirm button
            document.getElementById('confirmLocationBtn').disabled = false;
            
            // Get address for this location
            reverseGeocode(lat, lng);
        }

        function reverseGeocode(lat, lng) {
            // Show coordinates as fallback immediately
            const coordsText = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            document.getElementById('locationSearchInput').value = coordsText;
            
            // Try to get address using Nominatim (may fail due to CORS)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                if (data && data.display_name) {
                    // Shorten the address
                    const parts = data.display_name.split(',');
                    const shortAddress = parts.slice(0, 3).join(',').trim();
                    document.getElementById('locationSearchInput').value = shortAddress;
                }
            })
            .catch(() => {
                // Silently fail - coordinates are already shown as fallback
            });
        }

        function confirmLocation() {
            if (!pickedLocation) return;
            
            // Update the form fields
            document.getElementById('lat').value = pickedLocation.lat;
            document.getElementById('lng').value = pickedLocation.lng;
            document.getElementById('location').value = document.getElementById('locationSearchInput').value || `${pickedLocation.lat.toFixed(4)}, ${pickedLocation.lng.toFixed(4)}`;
            
            // Update the button text
            const locationBtn = document.querySelector('.location-picker-btn');
            const locationText = document.getElementById('locationText');
            locationText.textContent = document.getElementById('locationSearchInput').value || 'Location selected ✓';
            locationBtn.classList.add('has-location');
            
            // Also update selectedLocation for compatibility
            selectedLocation = pickedLocation;
            
            closeLocationPicker();
        }

        function resetLocationPicker() {
            pickedLocation = null;
            if (locationPickerMarker && locationPickerMap) {
                locationPickerMap.removeLayer(locationPickerMarker);
                locationPickerMarker = null;
            }
            
            const locationBtn = document.querySelector('.location-picker-btn');
            const locationText = document.getElementById('locationText');
            if (locationBtn) locationBtn.classList.remove('has-location');
            if (locationText) locationText.textContent = 'Tap to select location on map';
            
            const searchInput = document.getElementById('locationSearchInput');
            if (searchInput) searchInput.value = '';
            
            const confirmBtn = document.getElementById('confirmLocationBtn');
            if (confirmBtn) confirmBtn.disabled = true;
        }

        // Location search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('locationSearchInput');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', function(e) {
                    clearTimeout(searchTimeout);
                    const query = e.target.value.trim();
                    
                    if (query.length < 3) return;
                    
                    searchTimeout = setTimeout(() => {
                        // Search using Nominatim
                        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Makarska Croatia')}&limit=1`, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Network error');
                            return response.json();
                        })
                        .then(data => {
                            if (data && data.length > 0) {
                                const result = data[0];
                                const lat = parseFloat(result.lat);
                                const lng = parseFloat(result.lon);
                                
                                locationPickerMap.setView([lat, lng], 17);
                                placeLocationMarker(lat, lng);
                            }
                        })
                        .catch(() => {
                            // Silently fail - user can still tap on map
                        });
                    }, 500);
                });
            }
        });

        // Restaurant photo functions
