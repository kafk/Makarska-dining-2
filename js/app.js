// ============================================
// APP.JS - Application logic and functions
// ============================================


        // === DATA MIGRATION: Add mainCategory to old data ===
        // This fixes restaurants saved before mainCategory was added
        (function migrateMainCategory() {
            let needsSave = false;
            restaurants.forEach(restaurant => {
                if (!restaurant.mainCategory) {
                    // Detect category based on cuisine/name
                    const cuisineLower = (restaurant.cuisine || '').toLowerCase();
                    const nameLower = (restaurant.name || '').toLowerCase();

                    if (cuisineLower.includes('gelato') || cuisineLower.includes('ice') ||
                        nameLower.includes('glass') || nameLower.includes('sladoled') ||
                        nameLower.includes('ice') || nameLower.includes('gelat')) {
                        restaurant.mainCategory = 'icecream';
                    } else if (cuisineLower.includes('dessert') || cuisineLower.includes('cake') ||
                               cuisineLower.includes('pastry') || cuisineLower.includes('bakery')) {
                        restaurant.mainCategory = 'dessert';
                    } else if (cuisineLower.includes('bar') || cuisineLower.includes('pub') ||
                               cuisineLower.includes('cafe') || cuisineLower.includes('coffee')) {
                        restaurant.mainCategory = 'drinks';
                    } else {
                        restaurant.mainCategory = 'restaurant';
                    }
                    needsSave = true;
                    console.log(`Migrated ${restaurant.name} to mainCategory: ${restaurant.mainCategory}`);
                }
            });
            if (needsSave) {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                console.log('Data migration complete: mainCategory added to all restaurants');
            }
        })();

        let currentRestaurantId = null;
        let selectedLocation = null;
        let currentPinStyle = localStorage.getItem('pinStyle') || 'float-card';
        let selectedPinType = currentPinStyle;
        let currentFilter = 'none';

        const pinIcons = {
            classic: '📍',
            food: '🍽️',
            star: '⭐',
            chef: '👨‍🍳',
            pizza: '🍕',
            'fork-knife': '<div style="width: 38px; height: 38px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #f1f3f5; font-size: 20px;">🍴</div>',
            'hexagon-red': null,
            'hexagon-orange': null,
            'hexagon-yellow': null,
            'hexagon-purple': null,
            'hexagon-blue': null,
            'rating-badge': null
        };

        const cuisineColors = {
            'Croatian': '#ff6b6b',
            'Seafood': '#3498db',
            'Italian': '#27ae60',
            'Mediterranean': '#9b59b6',
            'Pizza': '#e67e22',
            'Steakhouse': '#c0392b',
            'Asian': '#f39c12',
            'Mexican': '#d35400',
            'Cafe': '#95a5a6',
            'International': '#16a085',
            'Bakery': '#f783ac',
            'Gelato': '#4dabf7',
            'Bar': '#9775fa'
        };

        // Main category colors for filter
        const mainCategoryColors = {
            'restaurant': '#ff6b6b',
            'dessert': '#f783ac',
            'icecream': '#4dabf7',
            'drinks': '#9775fa'
        };

        // Main category icons (emoji)
        const mainCategoryIcons = {
            'restaurant': '🍴',
            'dessert': '🍰',
            'icecream': '🍦',
            'drinks': '🍹'
        };

        // SVG icons for circle-dot style
        const mainCategorySvg = {
            'restaurant': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
            'dessert': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
            'icecream': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C9.01 2 6.5 4.37 6.5 7.5c0 .88.25 1.71.69 2.41L12 22l4.81-12.09c.44-.7.69-1.53.69-2.41C17.5 4.37 14.99 2 12 2zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 5.5 12 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
            'drinks': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM5.66 5h12.69l-1.78 2H7.43l-1.77-2z"/></svg>'
        };

        const priceColors = {
            1: '#27ae60',
            2: '#f39c12',
            3: '#e74c3c',
            4: '#9b59b6'
        };

        const ratingColors = {
            5: '#27ae60',
            4: '#2ecc71',
            3: '#f39c12',
            2: '#e67e22',
            1: '#e74c3c'
        };

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

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        }

        function switchTab(tab) {
            const menuTab = document.getElementById('menuTab');
            const restaurantTab = document.getElementById('restaurantTab');
            const menuSection = document.getElementById('menuReviewsSection');
            const restaurantSection = document.getElementById('restaurantReviewsSection');

            if (tab === 'menu') {
                menuTab.classList.add('active');
                restaurantTab.classList.remove('active');
                menuSection.style.display = 'block';
                restaurantSection.style.display = 'none';
                populateMenuReviews();
            } else {
                menuTab.classList.remove('active');
                restaurantTab.classList.add('active');
                menuSection.style.display = 'none';
                restaurantSection.style.display = 'block';
            }
        }

        function switchBottomNav(view) {
            const homeBtn = document.getElementById('bottomNavHome');
            const restaurantsBtn = document.getElementById('bottomNavRestaurants');
            const foodBtn = document.getElementById('bottomNavFood');
            const settingsBtn = document.getElementById('bottomNavSettings');
            const sidebar = document.getElementById('sidebar');
            const restaurantsSidebarView = document.getElementById('restaurantsSidebarView');
            const topDishesView = document.getElementById('topDishesView');
            const mapEl = document.getElementById('map');
            const restaurantsListView = document.getElementById('restaurantsListView');
            const settingsView = document.getElementById('settingsView');
            const floatingHeader = document.querySelector('.header');
            const floatingAddBtn = document.getElementById('floatingAddBtn');
            const demoPinBtn = document.getElementById('demoPinBtn');

            // Reset all buttons
            homeBtn.classList.remove('active');
            restaurantsBtn.classList.remove('active');
            foodBtn.classList.remove('active');
            if (settingsBtn) settingsBtn.classList.remove('active');

            // Hide all views
            sidebar.classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('open');
            mapEl.style.display = 'none';
            restaurantsListView.style.display = 'none';
            topDishesView.style.display = 'none';
            if (settingsView) settingsView.style.display = 'none';
            
            // Also hide settings sub-pages
            hideAllSettingsSubPages();

            if (view === 'home') {
                homeBtn.classList.add('active');
                mapEl.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'block';
                if (floatingAddBtn) floatingAddBtn.classList.add('show');
                if (demoPinBtn) demoPinBtn.style.display = 'block';
                const headerIcon = document.querySelector('.header h1 .header-icon');
                if (headerIcon) headerIcon.textContent = '🍽️';
                
            } else if (view === 'restaurants') {
                restaurantsBtn.classList.add('active');
                restaurantsListView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
                populateRestaurantsList();
                
            } else if (view === 'food') {
                foodBtn.classList.add('active');
                topDishesView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
                populateTopDishes();
                
            } else if (view === 'settings') {
                settingsBtn.classList.add('active');
                settingsView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
            }
        }

        // Settings sub-page navigation
        function hideAllSettingsSubPages() {
            const categoriesView = document.getElementById('settingsCategoriesView');
            const subcategoriesView = document.getElementById('settingsSubcategoriesView');
            const priceRangesView = document.getElementById('settingsPriceRangesView');
            const groupMembersView = document.getElementById('settingsGroupMembersView');
            const inviteMembersView = document.getElementById('settingsInviteMembersView');
            if (categoriesView) categoriesView.style.display = 'none';
            if (subcategoriesView) subcategoriesView.style.display = 'none';
            if (priceRangesView) priceRangesView.style.display = 'none';
            if (groupMembersView) groupMembersView.style.display = 'none';
            if (inviteMembersView) inviteMembersView.style.display = 'none';
        }

        function showSettingsPage(page) {
            const settingsView = document.getElementById('settingsView');
            settingsView.style.display = 'none';
            hideAllSettingsSubPages();

            if (page === 'categories') {
                document.getElementById('settingsCategoriesView').style.display = 'block';
                populateCategoriesList();
            } else if (page === 'subcategories') {
                document.getElementById('settingsSubcategoriesView').style.display = 'block';
                populateSubcategoriesList();
            } else if (page === 'priceranges') {
                document.getElementById('settingsPriceRangesView').style.display = 'block';
                populatePriceRangesList();
            } else if (page === 'groupmembers') {
                document.getElementById('settingsGroupMembersView').style.display = 'block';
                populateGroupMembersList();
            } else if (page === 'invitemembers') {
                document.getElementById('settingsInviteMembersView').style.display = 'block';
                displayCurrentGroupInviteCode();
            }
        }

        function hideSettingsPage(page) {
            hideAllSettingsSubPages();
            document.getElementById('settingsView').style.display = 'block';
        }

        // Group Members functions
        function populateGroupMembersList() {
            const container = document.getElementById('groupMembersList');
            const groupNameEl = document.getElementById('currentGroupName');
            const groupMetaEl = document.getElementById('currentGroupMeta');
            
            // Find current group
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            
            if (!currentGroup) {
                container.innerHTML = '<div class="settings-empty">No group selected</div>';
                return;
            }

            // Update header
            groupNameEl.textContent = currentGroup.name;
            groupMetaEl.textContent = (currentGroup.members || 1) + ' member' + ((currentGroup.members || 1) > 1 ? 's' : '');

            // Members for Darko & Jessica group
            let members;
            if (currentGroup.id === 'group_darko_jessica') {
                members = [
                    { name: 'Darko (You)', role: 'Admin • Created group', ratings: Math.floor(currentGroup.ratings / 2), color: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)', initial: 'D' },
                    { name: 'Jessica', role: 'Member', ratings: Math.ceil(currentGroup.ratings / 2), color: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', initial: 'J' }
                ];
            } else {
                // Default members for other groups
                members = [
                    { name: 'Darko (You)', role: 'Admin • Created group', ratings: 0, color: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)', initial: 'D' }
                ];
            }

            container.innerHTML = members.map(member => `
                <div class="member-card">
                    <div class="member-avatar" style="background: ${member.color};">${member.initial}</div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-role">${member.role}</div>
                    </div>
                    <div class="member-stats">
                        <div class="member-stat-value">${member.ratings}</div>
                        <div class="member-stat-label">ratings</div>
                    </div>
                </div>
            `).join('');
        }

        function displayCurrentGroupInviteCode() {
            const codeDisplay = document.getElementById('inviteCodeDisplay');
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            
            if (currentGroup && currentGroup.inviteCode) {
                codeDisplay.textContent = currentGroup.inviteCode;
            } else {
                codeDisplay.textContent = '------';
            }
        }

        function copyCurrentGroupCode() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup && currentGroup.inviteCode) {
                navigator.clipboard.writeText(currentGroup.inviteCode).then(() => {
                    alert('Invite code copied: ' + currentGroup.inviteCode);
                });
            }
        }

        function shareViaWhatsApp() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const text = `Join my group "${currentGroup.name}" on Makarska Dining! Use code: ${currentGroup.inviteCode}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }
        }

        function shareViaEmail() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const subject = `Join ${currentGroup.name} on Makarska Dining`;
                const body = `Join my group "${currentGroup.name}" on Makarska Dining!\n\nUse invite code: ${currentGroup.inviteCode}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
            }
        }

        function shareViaLink() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const link = `https://makarska-dining.app/join/${currentGroup.inviteCode}`;
                navigator.clipboard.writeText(link).then(() => {
                    alert('Link copied: ' + link);
                });
            }
        }

        function populateRestaurantsList() {
            const container = document.getElementById('restaurantsListContainer');
            if (!container) return;

            let filteredRestaurants = restaurants;
            
            // Filter by main category
            if (currentRestaurantCategory !== 'all') {
                filteredRestaurants = restaurants.filter(r => r.mainCategory === currentRestaurantCategory);
            }

            // Filter by search query
            const searchInput = document.getElementById('restaurantsSearchInput');
            if (searchInput && searchInput.value.trim()) {
                const query = searchInput.value.trim().toLowerCase();
                filteredRestaurants = filteredRestaurants.filter(r => 
                    r.name.toLowerCase().includes(query) || 
                    r.cuisine.toLowerCase().includes(query)
                );
            }

            const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
                const avgA = (a.foodRating + a.serviceRating) / 2;
                const avgB = (b.foodRating + b.serviceRating) / 2;
                return avgB - avgA;
            });

            container.innerHTML = '';

            sortedRestaurants.forEach(restaurant => {
                const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
                const stars = '★'.repeat(Math.round(avgRating));
                const priceSymbol = '€'.repeat(restaurant.price);
                
                const cuisineEmoji = {
                    'Croatian': '🇭🇷',
                    'Seafood': '🐟',
                    'Italian': '🍝',
                    'Mediterranean': '🌊',
                    'Pizza': '🍕',
                    'Steakhouse': '🥩',
                    'Asian': '🥢',
                    'Mexican': '🌮',
                    'Cafe': '☕',
                    'International': '🌍'
                }[restaurant.cuisine] || '🍽️';

                // Check if restaurant has a cover photo
                const hasCoverPhoto = restaurant.coverPhoto;

                const card = document.createElement('div');
                card.className = 'restaurant-card';
                card.onclick = () => viewRestaurantWithDishes(restaurant.id);
                card.innerHTML = `
                    <div class="restaurant-image-wrapper ${hasCoverPhoto ? 'has-photo' : ''}">
                        ${hasCoverPhoto 
                            ? `<img src="${restaurant.coverPhoto}" alt="${restaurant.name}" class="restaurant-cover-img">`
                            : cuisineEmoji
                        }
                    </div>
                    <div class="restaurant-card-info">
                        <div class="restaurant-card-name">${restaurant.name}</div>
                        <div class="restaurant-card-cuisine">${restaurant.cuisine} • ${priceSymbol}</div>
                        <div class="restaurant-card-rating">
                            <span style="color: #ffd700;">${stars}</span>
                            <span style="font-weight: 700;">${avgRating}/5</span>
                        </div>
                        <div class="restaurant-card-footer">
                            <span style="font-size: 12px; color: #636e72;">Last visit: ${new Date(restaurant.visitDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function viewRestaurantWithDishes(id) {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant) return;
            
            currentRestaurantId = id;
            
            const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
            const priceSymbol = '€'.repeat(restaurant.price);
            
            // Get actual dishes added for this restaurant
            const restaurantDishes = restaurant.foodItems || [];
            // Get photos for this restaurant (food photos only, not cover)
            const restaurantPhotos = restaurant.photos || [];
            
            // Get cuisine emoji for fallback
            const cuisineEmoji = {
                'Croatian': '🇭🇷',
                'Seafood': '🐟',
                'Italian': '🍝',
                'Mediterranean': '🌊',
                'Pizza': '🍕',
                'Steakhouse': '🥩',
                'Asian': '🥢',
                'Mexican': '🌮',
                'Cafe': '☕',
                'International': '🌍'
            }[restaurant.cuisine] || '🍽️';

            // Set hero image
            const heroEl = document.getElementById('restaurantHero');
            if (restaurant.coverPhoto) {
                heroEl.innerHTML = `
                    <img src="${restaurant.coverPhoto}" alt="${restaurant.name}">
                    <div class="restaurant-detail-hero-overlay"></div>
                    <div class="restaurant-detail-hero-name">${restaurant.name}</div>
                    <div class="hero-photo-buttons">
                        <button class="hero-photo-btn" onclick="event.stopPropagation(); changeCoverPhotoCamera(${id})">📷</button>
                        <button class="hero-photo-btn gallery" onclick="event.stopPropagation(); changeCoverPhotoGallery(${id})">🖼️</button>
                    </div>
                    <input type="file" id="coverPhotoCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleCoverPhotoChange(event, ${id})">
                    <input type="file" id="coverPhotoGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleCoverPhotoChange(event, ${id})">
                `;
            } else {
                heroEl.innerHTML = `
                    <span class="restaurant-detail-hero-emoji">${cuisineEmoji}</span>
                    <div class="restaurant-detail-hero-overlay"></div>
                    <div class="restaurant-detail-hero-name">${restaurant.name}</div>
                    <div class="hero-photo-buttons">
                        <button class="hero-photo-btn add" onclick="event.stopPropagation(); changeCoverPhotoCamera(${id})">📷</button>
                        <button class="hero-photo-btn add" onclick="event.stopPropagation(); changeCoverPhotoGallery(${id})">🖼️</button>
                    </div>
                    <input type="file" id="coverPhotoCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleCoverPhotoChange(event, ${id})">
                    <input type="file" id="coverPhotoGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleCoverPhotoChange(event, ${id})">
                `;
            }

            let dishesHtml = '';
            if (restaurantDishes.length > 0) {
                dishesHtml = `
                    <div class="restaurant-dishes-section">
                        <h4 class="restaurant-dishes-title">Added Dishes (${restaurantDishes.length})</h4>
                        ${restaurantDishes.map(dish => {
                            // Determine price category
                            let priceCategory = '';
                            if (dish.price) {
                                const priceNum = parseFloat(dish.price.replace(/[^0-9.,]/g, '').replace(',', '.'));
                                if (!isNaN(priceNum)) {
                                    if (priceNum <= 10) priceCategory = '(Budget)';
                                    else if (priceNum <= 20) priceCategory = '(Mid-range)';
                                    else if (priceNum <= 35) priceCategory = '(Expensive)';
                                    else priceCategory = '(Premium)';
                                }
                            }
                            return `
                            <div class="dish-card">
                                <div class="dish-image-wrapper">
                                    ${dish.photo 
                                        ? `<img src="${dish.photo}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                                        : `<div class="dish-image">${getCategoryEmoji(dish.category || 'food')}</div>`
                                    }
                                </div>
                                <div class="dish-info">
                                    <div class="dish-name">${dish.name}</div>
                                    <div class="dish-meta">
                                        ${dish.category ? `<div class="dish-meta-item">${getCategoryEmoji(dish.category)} ${dish.category}</div>` : ''}
                                        ${dish.subcategory ? `<div class="dish-meta-item">› ${dish.subcategory}</div>` : ''}
                                    </div>
                                    <div class="dish-description">${dish.notes || 'No notes'}</div>
                                    <div class="dish-footer">
                                        <div class="dish-price-info">
                                            <span class="dish-price-label">Price:</span>
                                            <span class="dish-price-value">${dish.price ? dish.price + (dish.price.includes('€') ? '' : ' €') : '-'}</span>
                                            ${priceCategory ? `<span class="dish-price-category">${priceCategory}</span>` : ''}
                                        </div>
                                        <div class="dish-rating">
                                            <span class="dish-rating-label">Rating:</span>
                                            <span class="dish-rating-emoji">⭐</span>
                                            <span>${dish.foodRating || 0}/5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;
            } else {
                dishesHtml = `
                    <div class="restaurant-dishes-section">
                        <h4 class="restaurant-dishes-title">Added Dishes</h4>
                        <p style="color: #999; font-size: 14px; text-align: center; padding: 16px 0;">No dishes added yet. Use the Food Items tab to add dishes!</p>
                    </div>
                `;
            }

            // Photo gallery section
            let photosHtml = `
                <div class="restaurant-photos-section">
                    <div class="restaurant-photos-header">
                        <h4 class="restaurant-photos-title">📸 Food Photos (${restaurantPhotos.length})</h4>
                        <div class="photo-buttons">
                            <button class="add-photo-btn" onclick="triggerCameraCapture(${id})">
                                <span>📷</span> Camera
                            </button>
                            <button class="add-photo-btn gallery-btn" onclick="triggerGalleryUpload(${id})">
                                <span>🖼️</span> Gallery
                            </button>
                        </div>
                        <input type="file" id="cameraCapture-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handlePhotoCapture(event, ${id})">
                        <input type="file" id="galleryUpload-${id}" class="photo-upload-input" accept="image/*" onchange="handlePhotoCapture(event, ${id})">
                    </div>
                    <div class="photo-gallery">
                        ${restaurantPhotos.length > 0 ? 
                            restaurantPhotos.map((photo, index) => `
                                <div class="photo-item" onclick="openPhotoModalByIndex(${id}, ${index})">
                                    <div class="photo-item-image">
                                        <img src="${typeof photo === 'object' ? photo.url : photo}" alt="Food photo ${index + 1}">
                                    </div>
                                    <div class="photo-item-info">
                                        ${typeof photo === 'object' && photo.dishName ? `<div class="photo-item-name">${photo.dishName}</div>` : ''}
                                        <div class="photo-item-rating">
                                            <span class="stars">${'★'.repeat(typeof photo === 'object' ? photo.rating || 0 : 0)}${'☆'.repeat(5 - (typeof photo === 'object' ? photo.rating || 0 : 0))}</span>
                                            <span class="rating-text">${typeof photo === 'object' && photo.rating ? photo.rating + '/5' : 'Not rated'}</span>
                                        </div>
                                        ${typeof photo === 'object' && photo.price ? `<div class="photo-item-price">${photo.price}</div>` : ''}
                                        <div class="photo-item-date">${typeof photo === 'object' && photo.date ? new Date(photo.date).toLocaleDateString() : ''}</div>
                                    </div>
                                    <button class="photo-item-delete" onclick="event.stopPropagation(); deletePhoto(${id}, ${index})">×</button>
                                </div>
                            `).join('') 
                            : `<div class="photo-empty">
                                <div class="photo-empty-icon">📷</div>
                                <div>No photos yet</div>
                                <div style="margin-top: 8px; font-size: 12px;">Take a photo of your food or choose from gallery!</div>
                            </div>`
                        }
                    </div>
                </div>
            `;
            
            document.getElementById('restaurantDetails').innerHTML = `
                <div class="restaurant-info">
                    <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                        <span class="info-label">📍 Adress</span>
                        <input type="text" id="addressInput-${id}" value="${restaurant.address || ''}" 
                            placeholder="Ange adress..." 
                            style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            onchange="updateAddress(${id}, this.value)">
                        <div style="display: flex; width: 100%; gap: 8px; flex-wrap: wrap;">
                            <button onclick="geocodeRestaurant(${id})" 
                                id="geocodeBtn-${id}"
                                style="flex: 1; min-width: 80px; padding: 10px 12px; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;"
                                title="Hitta på kartan från adress">
                                🔍 Sök
                            </button>
                            <button onclick="editLocation(${id})" 
                                style="flex: 1; min-width: 100px; padding: 10px 12px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                📍 Flytta pin
                            </button>
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cuisine</span>
                        <span class="info-value">${restaurant.cuisine}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Price Range</span>
                        <span class="info-value" style="color: #27ae60; font-weight: 700;">${priceSymbol}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Overall Rating</span>
                        <span class="info-value rating-stars">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))} ${avgRating}/5</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Food Quality</span>
                        <span class="info-value rating-stars">${'★'.repeat(restaurant.foodRating)}${'☆'.repeat(5 - restaurant.foodRating)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Service</span>
                        <span class="info-value rating-stars">${'★'.repeat(restaurant.serviceRating)}${'☆'.repeat(5 - restaurant.serviceRating)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Last Visit</span>
                        <span class="info-value">${new Date(restaurant.visitDate).toLocaleDateString()}</span>
                    </div>
                </div>
                ${dishesHtml}
                ${photosHtml}
                ${restaurant.notes ? `
                    <div class="notes-section">
                        <h4>Notes</h4>
                        <p>${restaurant.notes}</p>
                    </div>
                ` : ''}
                <button class="delete-btn" onclick="event.stopPropagation(); deleteRestaurant(${id})">Delete Restaurant</button>
            `;
            
            document.getElementById('viewModal').classList.add('open');
        }

        // Category and subcategory definitions
        const categorySubcategories = {
            'restaurant': [
                { id: 'all', label: '🍽️ All', emoji: '🍽️' },
                { id: 'seafood', label: '🐟 Seafood', emoji: '🐟' },
                { id: 'meat', label: '🥩 Meat', emoji: '🥩' },
                { id: 'pasta', label: '🍝 Pasta', emoji: '🍝' },
                { id: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
                { id: 'salad', label: '🥗 Salad', emoji: '🥗' }
            ],
            'dessert': [
                { id: 'all', label: '🍰 All', emoji: '🍰' },
                { id: 'cake', label: '🎂 Cake', emoji: '🎂' },
                { id: 'pastry', label: '🥐 Pastry', emoji: '🥐' },
                { id: 'chocolate', label: '🍫 Chocolate', emoji: '🍫' },
                { id: 'fruit', label: '🍓 Fruit', emoji: '🍓' }
            ],
            'icecream': [
                { id: 'all', label: '🍦 All', emoji: '🍦' },
                { id: 'gelato', label: '🍨 Gelato', emoji: '🍨' },
                { id: 'sorbet', label: '🧊 Sorbet', emoji: '🧊' },
                { id: 'sundae', label: '🍧 Sundae', emoji: '🍧' },
                { id: 'cone', label: '🍦 Cone', emoji: '🍦' }
            ],
            'drinks': [
                { id: 'all', label: '🍹 All', emoji: '🍹' },
                { id: 'coffee', label: '☕ Coffee', emoji: '☕' },
                { id: 'cocktail', label: '🍸 Cocktails', emoji: '🍸' },
                { id: 'wine', label: '🍷 Wine', emoji: '🍷' },
                { id: 'beer', label: '🍺 Beer', emoji: '🍺' },
                { id: 'juice', label: '🧃 Juice', emoji: '🧃' }
            ]
        };

        let currentMainCategory = 'all';
        let currentSubcategory = 'all';

        function selectMainCategory(category) {
            currentMainCategory = category;
            currentSubcategory = 'all';

            // Update main category buttons
            const mainButtons = document.querySelectorAll('#mainCategoryFilters .dish-filter-btn');
            mainButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Show/hide subcategories
            const subcategoryContainer = document.getElementById('subcategoryFilters');
            if (category === 'all') {
                subcategoryContainer.style.display = 'none';
            } else {
                subcategoryContainer.style.display = 'flex';
                populateSubcategories(category);
            }

            // Refresh dishes list
            populateTopDishes();
        }

        // Restaurant category filter
        let currentRestaurantCategory = 'all';
        
        function selectRestaurantCategory(category) {
            currentRestaurantCategory = category;

            // Update category buttons
            const buttons = document.querySelectorAll('#restaurantCategoryFilters .dish-filter-btn');
            buttons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Refresh restaurants list
            populateRestaurantsList();
        }

        function populateSubcategories(category) {
            const container = document.getElementById('subcategoryFilters');
            const subcategories = categorySubcategories[category] || [];

            container.innerHTML = subcategories.map(sub => `
                <button class="subcategory-btn ${sub.id === 'all' ? 'active' : ''}" 
                        data-subcategory="${sub.id}"
                        onclick="selectSubcategory('${sub.id}')">
                    ${sub.label}
                </button>
            `).join('');
        }

        function selectSubcategory(subcategory) {
            currentSubcategory = subcategory;

            // Update subcategory buttons
            const subButtons = document.querySelectorAll('#subcategoryFilters .subcategory-btn');
            subButtons.forEach(btn => {
                if (btn.dataset.subcategory === subcategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Refresh dishes list
            populateTopDishes();
        }

        function filterRestaurantsList() {
            populateRestaurantsList();
        }

        function filterFoodList() {
            populateTopDishes();
        }

        function populateTopDishes() {
            const dishesList = document.getElementById('dishesList');
            if (!dishesList) return;
            
            // Collect all user-added food items from restaurants
            let allDishes = [];
            
            // Get photos from all restaurants
            restaurants.forEach(restaurant => {
                if (restaurant.photos && restaurant.photos.length > 0) {
                    restaurant.photos.forEach(photo => {
                        if (typeof photo === 'object' && photo.dishName) {
                            allDishes.push({
                                name: photo.dishName,
                                description: photo.caption || '',
                                restaurant: restaurant.name,
                                restaurantId: restaurant.id,
                                mainCategory: photo.category || 'restaurant',
                                category: photo.subcategory || 'all',
                                rating: photo.rating ? photo.rating * 2 : 0, // Convert 5-scale to 10-scale for display
                                price: photo.price || '',
                                emoji: getCategoryEmoji(photo.category),
                                imageUrl: photo.url,
                                date: photo.date,
                                isUserAdded: true
                            });
                        }
                    });
                }
                
                // Also include food items if any
                if (restaurant.foodItems && restaurant.foodItems.length > 0) {
                    restaurant.foodItems.forEach(item => {
                        allDishes.push({
                            name: item.name,
                            description: item.notes || '',
                            restaurant: restaurant.name,
                            restaurantId: restaurant.id,
                            mainCategory: item.category || 'restaurant',
                            category: item.subcategory || 'all',
                            rating: item.foodRating ? item.foodRating * 2 : 0,
                            price: item.price || '',
                            emoji: getCategoryEmoji(item.category),
                            date: item.visitDate,
                            isUserAdded: true
                        });
                    });
                }
            });
            
            // No demo data - only show user's real dishes

            // Filter dishes based on current selections
            let filteredDishes = allDishes;
            
            // Filter by search query
            const searchInput = document.getElementById('foodSearchInput');
            if (searchInput && searchInput.value.trim()) {
                const query = searchInput.value.trim().toLowerCase();
                filteredDishes = filteredDishes.filter(dish => 
                    dish.name.toLowerCase().includes(query) || 
                    dish.restaurant.toLowerCase().includes(query) ||
                    (dish.description && dish.description.toLowerCase().includes(query))
                );
            }
            
            if (currentMainCategory !== 'all') {
                filteredDishes = filteredDishes.filter(dish => dish.mainCategory === currentMainCategory);
                
                if (currentSubcategory !== 'all') {
                    filteredDishes = filteredDishes.filter(dish => dish.category === currentSubcategory);
                }
            }

            // Sort by rating
            filteredDishes.sort((a, b) => b.rating - a.rating);

            dishesList.innerHTML = '';
            
            if (filteredDishes.length === 0) {
                dishesList.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📷</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No items yet</div>
                        <div style="font-size: 14px;">Add photos with ratings from your restaurant visits!</div>
                    </div>
                `;
                return;
            }
            
            try {
                filteredDishes.forEach((dish, index) => {
                    const card = document.createElement('div');
                    card.className = 'dish-card';
                    card.onclick = () => viewDishDetail(dish);
                    
                    // Use image if available, otherwise emoji
                    const imageContent = dish.imageUrl 
                        ? `<img src="${dish.imageUrl}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                        : `<div class="dish-image">${dish.emoji}</div>`;
                    
                    card.innerHTML = `
                        <div class="dish-image-wrapper">
                            ${imageContent}
                        </div>
                        <div class="dish-info">
                            <div class="dish-name">${dish.name}</div>
                            <div class="dish-description">${dish.description || 'No notes'}</div>
                            <div class="dish-meta">
                                <div class="dish-meta-item">📍 ${dish.restaurant}</div>
                                <div class="dish-meta-item">🍽️ ${dish.category || dish.mainCategory}</div>
                            </div>
                            <div class="dish-footer">
                                <div class="dish-price">${dish.price || '-'}</div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="dish-rating">
                                        <span class="dish-rating-emoji">😋</span>
                                        <span>${dish.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    dishesList.appendChild(card);
                });
            } catch (error) {
                console.error('Error populating dishes:', error);
            }
        }
        
        function getCategoryEmoji(category) {
            const emojis = {
                'restaurant': '🍽️',
                'dessert': '🍰',
                'icecream': '🍨',
                'drinks': '🍹',
                'seafood': '🐟',
                'meat': '🥩',
                'pasta': '🍝',
                'pizza': '🍕',
                'coffee': '☕',
                'beer': '🍺',
                'wine': '🍷',
                'cocktail': '🍸'
            };
            return emojis[category] || '🍽️';
        }

        function viewDishDetail(dish) {
            try {
                const modal = document.getElementById('dishDetailModal');
                const imageHeader = document.getElementById('dishDetailImage');
                const body = document.getElementById('dishDetailBody');

                if (!modal || !imageHeader || !body) {
                    console.error('Modal elements not found');
                    return;
                }

                // Set image
                imageHeader.textContent = dish.emoji;

                // Calculate ratings - ensure valid values
                const overallRating = dish.rating;
                const overallStars = Math.max(0, Math.min(5, Math.round(overallRating / 2))); // Convert 10-scale to 5-scale
                const foodRating = Math.max(0, Math.min(5, Math.round(overallRating / 2)));
                const serviceRating = Math.max(0, Math.min(5, Math.round((overallRating / 2) - 0.5)));

                // Build detail view
                body.innerHTML = `
                    <h2 class="dish-detail-title">${dish.name}</h2>
                    <div class="dish-detail-restaurant">📍 at ${dish.restaurant}</div>

                    <div class="dish-info-grid">
                        <div class="dish-info-row">
                            <span class="dish-info-label">Category</span>
                            <span class="dish-info-value">${dish.category}</span>
                        </div>
                        <div class="dish-info-row">
                            <span class="dish-info-label">Price</span>
                            <span class="dish-info-value" style="color: #27ae60; font-weight: 700;">${dish.price}</span>
                        </div>
                        <div class="dish-info-row">
                            <span class="dish-info-label">Overall Rating</span>
                            <span class="dish-info-value"><span style="color: #ffd700;">${'★'.repeat(overallStars)}${'☆'.repeat(5 - overallStars)}</span> ${overallRating}/10</span>
                        </div>
                        <div class="dish-info-row">
                            <span class="dish-info-label">Taste</span>
                            <span class="dish-info-value" style="color: #ffd700;">${'★'.repeat(foodRating)}${'☆'.repeat(5 - foodRating)}</span>
                        </div>
                        <div class="dish-info-row">
                            <span class="dish-info-label">Presentation</span>
                            <span class="dish-info-value" style="color: #ffd700;">${'★'.repeat(serviceRating)}${'☆'.repeat(5 - serviceRating)}</span>
                        </div>
                    </div>

                    <div class="dish-notes-section">
                        <h4>Description</h4>
                        <p>${dish.description}</p>
                    </div>
                `;

                modal.style.display = 'block';
            } catch (error) {
                console.error('Error displaying dish detail:', error);
            }
        }

        function closeDishDetail() {
            document.getElementById('dishDetailModal').style.display = 'none';
        }

        function populateMenuReviews() {
            const menuReviewCards = document.getElementById('menuReviewCards');
            
            // Sample menu items from visited restaurants
            const menuItems = [
                {
                    name: "Grilled Sea Bass",
                    restaurant: "Ivo",
                    rating: 5,
                    price: "€24.99",
                    image: "🐟",
                    notes: "Perfectly cooked, fresh from the Adriatic"
                },
                {
                    name: "Black Risotto",
                    restaurant: "Ante",
                    rating: 5,
                    price: "€18.50",
                    image: "🍚",
                    notes: "Rich squid ink flavor, al dente"
                },
                {
                    name: "Margherita Pizza",
                    restaurant: "Pizzeria Mamma Mia",
                    rating: 4,
                    price: "€9.99",
                    image: "🍕",
                    notes: "Simple but delicious wood-fired"
                },
                {
                    name: "Pašticada",
                    restaurant: "Konoba Kalalarga",
                    rating: 3,
                    price: "€22.00",
                    image: "🍖",
                    notes: "Traditional Croatian beef stew"
                },
                {
                    name: "Lobster Thermidor",
                    restaurant: "Ribar",
                    rating: 5,
                    price: "€45.00",
                    image: "🦞",
                    notes: "Outstanding! Worth every kuna"
                },
                {
                    name: "Tuna Tartare",
                    restaurant: "Bistro Marinero",
                    rating: 5,
                    price: "€16.50",
                    image: "🍣",
                    notes: "Fresh, creative presentation"
                }
            ];

            menuReviewCards.innerHTML = '';
            
            menuItems.forEach(item => {
                const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
                
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `
                    <div class="review-card-image" style="display: flex; align-items: center; justify-content: center; font-size: 60px;">
                        ${item.image}
                    </div>
                    <div class="review-card-content">
                        <div class="review-card-title">${item.name}</div>
                        <div class="review-card-subtitle">at ${item.restaurant}</div>
                        <div class="review-card-footer">
                            <span class="review-card-rating">${stars}</span>
                            <span class="review-card-price">${item.price}</span>
                        </div>
                    </div>
                `;
                
                menuReviewCards.appendChild(card);
            });
        }

        function populateSidebar() {
            // Update restaurant count
            document.getElementById('restaurantCount').textContent = restaurants.length;

            // Populate restaurants list
            const restaurantList = document.getElementById('restaurantList');
            restaurantList.innerHTML = '';
            
            const sortedRestaurants = [...restaurants].sort((a, b) => a.name.localeCompare(b.name));
            
            sortedRestaurants.forEach(restaurant => {
                const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
                const priceSymbol = '€'.repeat(restaurant.price);
                const stars = '★'.repeat(Math.round(avgRating));
                
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                li.onclick = () => {
                    viewRestaurant(restaurant.id);
                    toggleSidebar();
                    map.setView([restaurant.lat, restaurant.lng], 16);
                };
                
                li.innerHTML = `
                    <div class="sidebar-item-name">${restaurant.name}</div>
                    <div class="sidebar-item-meta">
                        <span class="cuisine-badge" style="border-color: ${cuisineColors[restaurant.cuisine]}20; color: ${cuisineColors[restaurant.cuisine]};">${restaurant.cuisine}</span>
                        <span style="color: #27ae60; font-weight: 700;">${priceSymbol}</span>
                        <span style="color: #ffd700;">${stars}</span>
                        <span>${avgRating}</span>
                    </div>
                `;
                
                restaurantList.appendChild(li);
            });

            // Populate cuisines list
            const cuisineList = document.getElementById('cuisineList');
            cuisineList.innerHTML = '';
            
            const cuisineCounts = {};
            restaurants.forEach(restaurant => {
                cuisineCounts[restaurant.cuisine] = (cuisineCounts[restaurant.cuisine] || 0) + 1;
            });

            Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]).forEach(([cuisine, count]) => {
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                li.onclick = () => {
                    document.getElementById('filterSelect').value = 'cuisine';
                    currentFilter = 'cuisine';
                    loadMarkers();
                    toggleSidebar();
                    
                    // Filter search to show only this cuisine
                    document.getElementById('searchInput').value = cuisine;
                    const searchEvent = new Event('input', { bubbles: true });
                    document.getElementById('searchInput').dispatchEvent(searchEvent);
                };
                
                li.innerHTML = `
                    <div class="sidebar-item-name" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <span style="width: 12px; height: 12px; background: ${cuisineColors[cuisine]}; border-radius: 50%; display: inline-block;"></span>
                            ${cuisine}
                        </span>
                        <span style="background: ${cuisineColors[cuisine]}20; color: ${cuisineColors[cuisine]}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">${count}</span>
                    </div>
                `;
                
                cuisineList.appendChild(li);
            });
        }

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('star')) {
                const ratingType = e.target.dataset.rating;
                const value = e.target.dataset.value;
                const stars = document.querySelectorAll(`[data-rating="${ratingType}"]`);
                
                stars.forEach((star, index) => {
                    if (index < value) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
                
                document.getElementById(`${ratingType}Rating`).value = value;
            }
        });

        // Geocode using Google Maps API (works when running locally)
        const GOOGLE_API_KEY = 'AIzaSyDlyFKGOFUYSdFChTse3dZvFnOWU2E94JM';
        
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
        
        function showSearchSuggestions(searchTerm) {
            const matchingRestaurants = restaurants.filter(r => 
                r.name.toLowerCase().includes(searchTerm) ||
                r.cuisine.toLowerCase().includes(searchTerm) ||
                r.notes.toLowerCase().includes(searchTerm)
            ).slice(0, 5);
            
            // Get matching cuisines
            const allCuisines = [...new Set(restaurants.map(r => r.cuisine))];
            const matchingCuisines = allCuisines.filter(c => 
                c.toLowerCase().includes(searchTerm)
            ).slice(0, 3);
            
            // Get matching food items from photos
            let matchingDishes = [];
            restaurants.forEach(r => {
                if (r.photos) {
                    r.photos.forEach(photo => {
                        if (typeof photo === 'object' && photo.dishName && 
                            photo.dishName.toLowerCase().includes(searchTerm)) {
                            matchingDishes.push({
                                ...photo,
                                restaurantName: r.name,
                                restaurantId: r.id
                            });
                        }
                    });
                }
            });
            matchingDishes = matchingDishes.slice(0, 3);
            
            if (matchingRestaurants.length === 0 && matchingCuisines.length === 0 && matchingDishes.length === 0) {
                hideSearchDropdown();
                return;
            }
            
            let html = '';
            
            // Restaurants section
            if (matchingRestaurants.length > 0) {
                html += '<div class="search-dropdown-section">Restaurants</div>';
                matchingRestaurants.forEach(r => {
                    const cuisineEmoji = getCuisineEmoji(r.cuisine);
                    const imageContent = r.coverPhoto 
                        ? `<img src="${r.coverPhoto}" alt="${r.name}">`
                        : cuisineEmoji;
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchRestaurant(${r.id})">
                            <div class="search-dropdown-item-icon">${imageContent}</div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(r.name, searchTerm)}</div>
                                <div class="search-dropdown-item-meta">
                                    <span>${r.cuisine}</span>
                                    <span>⭐ ${((r.foodRating + r.serviceRating) / 2).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Cuisines section
            if (matchingCuisines.length > 0) {
                html += '<div class="search-dropdown-section">Cuisines</div>';
                matchingCuisines.forEach(c => {
                    const count = restaurants.filter(r => r.cuisine === c).length;
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchCuisine('${c}')">
                            <div class="search-dropdown-item-icon">${getCuisineEmoji(c)}</div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(c, searchTerm)}</div>
                                <div class="search-dropdown-item-meta">
                                    <span>${count} restaurant${count !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Dishes section
            if (matchingDishes.length > 0) {
                html += '<div class="search-dropdown-section">Food Items</div>';
                matchingDishes.forEach(d => {
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchDish(${d.restaurantId})">
                            <div class="search-dropdown-item-icon"><img src="${d.url}" alt="${d.dishName}"></div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(d.dishName, searchTerm)}</div>
                                <div class="search-dropdown-item-meta">
                                    <span>📍 ${d.restaurantName}</span>
                                    <span>⭐ ${d.rating}/5</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            searchDropdown.innerHTML = html;
            searchDropdown.classList.add('show');
            activeDropdownIndex = -1;
        }
        
        function hideSearchDropdown() {
            searchDropdown.classList.remove('show');
            activeDropdownIndex = -1;
        }
        
        function updateActiveDropdownItem(items) {
            items.forEach((item, i) => {
                item.classList.toggle('active', i === activeDropdownIndex);
            });
            if (items[activeDropdownIndex]) {
                items[activeDropdownIndex].scrollIntoView({ block: 'nearest' });
            }
        }
        
        function highlightMatch(text, searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<strong style="color: #ff6b6b;">$1</strong>');
        }
        
        function getCuisineEmoji(cuisine) {
            const emojis = {
                'Croatian': '🇭🇷',
                'Seafood': '🐟',
                'Italian': '🍝',
                'Mediterranean': '🌊',
                'Pizza': '🍕',
                'Steakhouse': '🥩',
                'Asian': '🥢',
                'Mexican': '🌮',
                'Cafe': '☕',
                'International': '🌍'
            };
            return emojis[cuisine] || '🍽️';
        }
        
        function selectSearchRestaurant(id) {
            hideSearchDropdown();
            searchInput.value = '';
            // Reset marker opacity
            markers.forEach(m => m.setOpacity(1));
            // Find and open the restaurant
            const restaurant = restaurants.find(r => r.id === id);
            if (restaurant) {
                const markerIndex = restaurants.indexOf(restaurant);
                if (markers[markerIndex]) {
                    map.setView([restaurant.lat, restaurant.lng], 17);
                    markers[markerIndex].openPopup();
                }
            }
        }
        
        function selectSearchCuisine(cuisine) {
            hideSearchDropdown();
            searchInput.value = cuisine;
            // Filter markers
            markers.forEach((marker, index) => {
                const restaurant = restaurants[index];
                marker.setOpacity(restaurant.cuisine === cuisine ? 1 : 0.3);
            });
        }
        
        function selectSearchDish(restaurantId) {
            hideSearchDropdown();
            searchInput.value = '';
            markers.forEach(m => m.setOpacity(1));
            viewRestaurantWithDishes(restaurantId);
        }

        function openAddModal() {
            document.getElementById('addChoiceModal').style.display = 'block';
        }

        function closeAddChoiceModal() {
            document.getElementById('addChoiceModal').style.display = 'none';
        }

        function openAddRestaurantModal() {
            closeAddChoiceModal();
            document.getElementById('addRestaurantModal').style.display = 'block';
            document.getElementById('restaurantForm').reset();
            selectedLocation = null;
            
            // Reset photo section
            resetRestaurantPhotoForm();
            
            // Reset location picker
            resetLocationPicker();
        }

        function closeAddRestaurantModal() {
            document.getElementById('addRestaurantModal').style.display = 'none';
            resetRestaurantPhotoForm();
            resetLocationPicker();
        }

        // Location Picker functions
        let locationPickerMap = null;
        let locationPickerMarker = null;
        let pickedLocation = null;

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
        function triggerRestaurantCamera() {
            document.getElementById('restaurantCameraInput').click();
        }

        function triggerRestaurantGallery() {
            document.getElementById('restaurantGalleryInput').click();
        }

        function handleRestaurantPhotoSelect(event) {
            try {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    event.target.value = '';
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo is too large. Please select an image under 5MB.');
                    event.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                
                reader.onerror = function() {
                    alert('Error reading photo. Please try again.');
                    event.target.value = '';
                };
                
                reader.onload = function(e) {
                    try {
                        // Compress and show preview
                        compressImage(e.target.result, 800, 0.8, function(compressedImage) {
                            showRestaurantPhotoPreview(compressedImage);
                        });
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
                
                // Reset the input
                event.target.value = '';
            } catch (err) {
                alert('Error with photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        function showRestaurantPhotoPreview(imageData) {
            const previewContainer = document.getElementById('restaurantPhotoPreview');
            const photoDataInput = document.getElementById('restaurantPhotoData');
            const removeBtn = document.getElementById('removeRestaurantPhotoBtn');

            previewContainer.innerHTML = `<img src="${imageData}" alt="Restaurant photo preview">`;
            photoDataInput.value = imageData;
            removeBtn.style.display = 'flex';
        }

        function removeRestaurantPhoto() {
            const previewContainer = document.getElementById('restaurantPhotoPreview');
            const photoDataInput = document.getElementById('restaurantPhotoData');
            const removeBtn = document.getElementById('removeRestaurantPhotoBtn');

            previewContainer.innerHTML = `
                <div class="food-photo-empty">
                    <span>🏪</span>
                    <span>No photo added</span>
                </div>
            `;
            photoDataInput.value = '';
            removeBtn.style.display = 'none';
        }

        function resetRestaurantPhotoForm() {
            removeRestaurantPhoto();
            const cameraInput = document.getElementById('restaurantCameraInput');
            const galleryInput = document.getElementById('restaurantGalleryInput');
            if (cameraInput) cameraInput.value = '';
            if (galleryInput) galleryInput.value = '';
        }

        function openAddFoodModal() {
            closeAddChoiceModal();
            document.getElementById('addFoodModal').style.display = 'block';
            document.getElementById('foodForm').reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            document.getElementById('visitDate').valueAsDate = new Date();
            
            // Reset photo section
            resetFoodPhotoForm();
            
            // Populate restaurant dropdown
            const select = document.getElementById('foodRestaurant');
            select.innerHTML = '<option value="">Choose a restaurant...</option>';
            restaurants.forEach(r => {
                select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
            });
            
            // Populate category dropdown
            const catSelect = document.getElementById('foodCategory');
            catSelect.innerHTML = '<option value="">Choose category...</option>';
            const categories = JSON.parse(localStorage.getItem('customCategories')) || [
                { id: 'food', name: 'Food', emoji: '🍽️' },
                { id: 'drinks', name: 'Drinks', emoji: '🍺' },
                { id: 'ice-cream', name: 'Ice Cream', emoji: '🍦' }
            ];
            categories.forEach(cat => {
                catSelect.innerHTML += `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`;
            });
            
            // Hide subcategory initially
            document.getElementById('foodSubcategoryGroup').style.display = 'none';
        }
        
        function populateFoodSubcategories() {
            const category = document.getElementById('foodCategory').value;
            const subGroup = document.getElementById('foodSubcategoryGroup');
            const subSelect = document.getElementById('foodSubcategory');
            
            const subcategories = JSON.parse(localStorage.getItem('customSubcategories')) || [
                { id: 'pasta', name: 'Pasta', parentId: 'food' },
                { id: 'pizza', name: 'Pizza', parentId: 'food' },
                { id: 'seafood', name: 'Seafood', parentId: 'food' },
                { id: 'meat', name: 'Meat', parentId: 'food' },
                { id: 'salad', name: 'Salad', parentId: 'food' },
                { id: 'dessert', name: 'Dessert', parentId: 'food' },
                { id: 'beer', name: 'Beer', parentId: 'drinks' },
                { id: 'wine', name: 'Wine', parentId: 'drinks' },
                { id: 'cocktail', name: 'Cocktail', parentId: 'drinks' },
                { id: 'coffee', name: 'Coffee', parentId: 'drinks' },
                { id: 'gelato', name: 'Gelato', parentId: 'ice-cream' },
                { id: 'sorbet', name: 'Sorbet', parentId: 'ice-cream' }
            ];
            
            const filtered = subcategories.filter(s => s.parentId === category);
            
            if (filtered.length > 0) {
                subSelect.innerHTML = '<option value="">Choose subcategory...</option>';
                filtered.forEach(sub => {
                    subSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
                });
                subGroup.style.display = 'block';
            } else {
                subGroup.style.display = 'none';
            }
        }

        function closeAddFoodModal() {
            document.getElementById('addFoodModal').style.display = 'none';
            resetFoodPhotoForm();
        }

        function closeAddModal() {
            closeAddChoiceModal();
            closeAddRestaurantModal();
            closeAddFoodModal();
        }

        function closeViewModal() {
            document.getElementById('viewModal').classList.remove('open');
        }

        // Update address for a restaurant
        async function updateAddress(id, newAddress) {
            const restaurant = restaurants.find(r => r.id === id);
            if (restaurant) {
                restaurant.address = newAddress;
                saveRestaurants();
                
                // Auto-geocode if address is long enough
                if (newAddress && newAddress.length > 5) {
                    await geocodeRestaurant(id);
                }
            }
        }
        
        async function geocodeRestaurant(id) {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant || !restaurant.address) {
                alert('Ange en adress först');
                return;
            }
            
            const btn = document.getElementById(`geocodeBtn-${id}`);
            const input = document.getElementById(`addressInput-${id}`);
            
            // Show loading state
            if (btn) {
                btn.textContent = '⏳';
                btn.disabled = true;
            }
            if (input) {
                input.style.background = '#fffbea';
            }
            
            const coords = await geocodeAddress(restaurant.address, restaurant.name);
            
            if (coords) {
                restaurant.lat = coords.lat;
                restaurant.lng = coords.lng;
                saveRestaurants();
                loadMarkers();
                
                // Success feedback
                if (btn) {
                    btn.textContent = '✅';
                    setTimeout(() => { btn.textContent = '🔍'; btn.disabled = false; }, 1500);
                }
                if (input) {
                    input.style.background = '#e8f5e9';
                    setTimeout(() => { input.style.background = ''; }, 2000);
                }
                
                alert(`✅ "${restaurant.name}" placerad på kartan!\n\nAdress: ${restaurant.address}`);
            } else {
                // Error feedback
                if (btn) {
                    btn.textContent = '❌';
                    setTimeout(() => { btn.textContent = '🔍'; btn.disabled = false; }, 1500);
                }
                if (input) {
                    input.style.background = '#ffebee';
                    setTimeout(() => { input.style.background = ''; }, 2000);
                }
                
                alert(`❌ Kunde inte hitta "${restaurant.address}" på kartan.\n\nTips: Lägg till "Makarska" i adressen eller använd "Flytta pin" för att placera manuellt.`);
            }
        }

        // Edit location - allow user to click on map to set new coordinates
        let editingLocationId = null;
        
        function editLocation(id) {
            editingLocationId = id;
            const restaurant = restaurants.find(r => r.id === id);
            
            closeViewModal();
            switchTab('map');
            
            const overlay = document.createElement('div');
            overlay.id = 'locationEditOverlay';
            overlay.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 16px 20px; z-index: 10000; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">📍 Flytta pin för "${restaurant.name}"</div>
                    <div style="font-size: 13px; opacity: 0.9;">Klicka på kartan där restaurangen ligger</div>
                    <button onclick="cancelLocationEdit()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; cursor: pointer;">✕ Avbryt</button>
                </div>
            `;
            document.body.appendChild(overlay);
            
            if (restaurant.lat && restaurant.lng) {
                map.setView([restaurant.lat, restaurant.lng], 17);
            }
            
            map.once('click', function(e) {
                if (editingLocationId) {
                    const r = restaurants.find(r => r.id === editingLocationId);
                    if (r) {
                        r.lat = e.latlng.lat;
                        r.lng = e.latlng.lng;
                        saveRestaurants();
                        loadMarkers();
                        alert(`✅ Pin för "${r.name}" har flyttats!\n\nAdress: ${r.address || 'Ej angiven'}`);
                    }
                    cancelLocationEdit();
                }
            });
        }
        
        function cancelLocationEdit() {
            editingLocationId = null;
            const overlay = document.getElementById('locationEditOverlay');
            if (overlay) overlay.remove();
        }

        function openDemoMenu() {
            document.getElementById('demoModal').style.display = 'block';
            selectedPinType = currentPinStyle;
            
            document.querySelectorAll('.pin-option').forEach(option => {
                if (option.dataset.pinType === currentPinStyle) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        function closeDemoMenu() {
            document.getElementById('demoModal').style.display = 'none';
        }

        function selectPin(type) {
            selectedPinType = type;
            currentPinStyle = type;
            localStorage.setItem('pinStyle', currentPinStyle);
            
            document.querySelectorAll('.pin-option').forEach(option => {
                if (option.dataset.pinType === type) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
            
            // Apply immediately
            loadMarkers();
        }

        function applyPinStyle() {
            currentPinStyle = selectedPinType;
            localStorage.setItem('pinStyle', currentPinStyle);
            loadMarkers();
            closeDemoMenu();
        }

        function applyFilter() {
            currentFilter = document.getElementById('filterSelect').value;
            loadMarkers();
        }


        // Helper function to save restaurants to localStorage AND Firestore
        function saveRestaurants() {
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            // Sync all to Firestore
            if (typeof saveRestaurantsToFirestore === 'function') {
                saveRestaurantsToFirestore(restaurants);
            }
        }

        function saveRestaurant(e) {
            if (e) e.preventDefault();
            
            const nameValue = document.getElementById('name').value;
            const cuisineValue = document.getElementById('cuisine').value;
            const priceValue = document.getElementById('price').value;
            
            if (!nameValue || !nameValue.trim()) {
                alert('Please enter a restaurant name');
                return;
            }
            
            try {
                const restaurantPhotoData = document.getElementById('restaurantPhotoData').value;
                
                const restaurant = {
                    id: Date.now(),
                    name: nameValue.trim(),
                    cuisine: cuisineValue,
                    price: parseInt(priceValue),
                    lat: parseFloat(document.getElementById('lat').value) || 43.2964,
                    lng: parseFloat(document.getElementById('lng').value) || 17.0175,
                    foodRating: 0,
                    serviceRating: 0,
                    visitDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    foodItems: [],
                    photos: [],
                    coverPhoto: restaurantPhotoData || null
                };
                
                restaurants.push(restaurant);

                try {
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    // Sync to Firestore
                    saveRestaurantToFirestore(restaurant);
                } catch (storageError) {
                    alert('Storage is full! Try deleting some old restaurants or photos first.');
                    restaurants.pop();
                    return;
                }

                loadMarkers();
                populateSidebar();
                closeAddRestaurantModal();
                resetRestaurantPhotoForm();
                
            } catch (error) {
                alert('Error saving restaurant: ' + error.message);
            }
        }

        document.getElementById('restaurantForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveRestaurant(e);
        });

        function saveFoodItem(e) {
            if (e) e.preventDefault();
            
            const restaurantId = parseInt(document.getElementById('foodRestaurant').value);
            const category = document.getElementById('foodCategory').value;
            const subcategory = document.getElementById('foodSubcategory').value;
            const dishName = document.getElementById('dishName').value.trim();
            const foodRating = parseInt(document.getElementById('foodRating').value) || 0;
            const visitDate = document.getElementById('visitDate').value;
            
            // Validation
            if (!restaurantId) {
                alert('Please select a restaurant');
                return;
            }
            if (!category) {
                alert('Please select a category');
                return;
            }
            if (!dishName) {
                alert('Please enter a dish name');
                return;
            }
            if (foodRating === 0) {
                alert('Please give a food rating');
                return;
            }
            if (!visitDate) {
                alert('Please select a visit date');
                return;
            }
            
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant) {
                alert('Restaurant not found');
                return;
            }
            
            try {
                const foodPhotoData = document.getElementById('foodPhotoData').value;
                
                const foodItem = {
                    id: Date.now(),
                    name: dishName,
                    category: category,
                    subcategory: subcategory,
                    price: document.getElementById('dishPrice').value,
                    foodRating: foodRating,
                    serviceRating: parseInt(document.getElementById('serviceRating').value) || 0,
                    visitDate: visitDate,
                    notes: document.getElementById('foodNotes').value,
                    photo: foodPhotoData || null
                };
                
                if (!restaurant.foodItems) {
                    restaurant.foodItems = [];
                }
                restaurant.foodItems.push(foodItem);
                
                if (foodPhotoData) {
                    if (!restaurant.photos) {
                        restaurant.photos = [];
                    }
                    restaurant.photos.push({
                        url: foodPhotoData,
                        rating: foodItem.foodRating,
                        category: category,
                        subcategory: subcategory,
                        dishName: foodItem.name,
                        caption: foodItem.notes,
                        date: foodItem.visitDate
                    });
                }
                
                const allRatings = restaurant.foodItems.filter(f => f.foodRating > 0);
                if (allRatings.length > 0) {
                    restaurant.foodRating = Math.round(allRatings.reduce((sum, f) => sum + f.foodRating, 0) / allRatings.length);
                    restaurant.serviceRating = Math.round(allRatings.reduce((sum, f) => sum + f.serviceRating, 0) / allRatings.length);
                }
                restaurant.visitDate = foodItem.visitDate;
                
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                
                loadMarkers();
                populateSidebar();
                closeAddFoodModal();
                
            } catch (error) {
                alert('Error saving food item: ' + error.message);
            }
        }

        document.getElementById('foodForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveFoodItem(e);
        });

        // Food item photo functions
        function triggerFoodCamera() {
            document.getElementById('foodCameraInput').click();
        }

        function triggerFoodGallery() {
            document.getElementById('foodGalleryInput').click();
        }

        function handleFoodPhotoSelect(event) {
            try {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    event.target.value = '';
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo is too large. Please select an image under 5MB.');
                    event.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                
                reader.onerror = function() {
                    alert('Error reading photo. Please try again.');
                    event.target.value = '';
                };
                
                reader.onload = function(e) {
                    try {
                        // Compress and show preview
                        compressImage(e.target.result, 800, 0.8, function(compressedImage) {
                            showFoodPhotoPreview(compressedImage);
                        });
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
                
                // Reset the input
                event.target.value = '';
            } catch (err) {
                alert('Error with photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        function showFoodPhotoPreview(imageData) {
            const previewContainer = document.getElementById('foodPhotoPreview');
            const photoDataInput = document.getElementById('foodPhotoData');
            const removeBtn = document.getElementById('removeFoodPhotoBtn');

            previewContainer.innerHTML = `<img src="${imageData}" alt="Food photo preview">`;
            photoDataInput.value = imageData;
            removeBtn.style.display = 'flex';
        }

        function removeFoodPhoto() {
            const previewContainer = document.getElementById('foodPhotoPreview');
            const photoDataInput = document.getElementById('foodPhotoData');
            const removeBtn = document.getElementById('removeFoodPhotoBtn');

            previewContainer.innerHTML = `
                <div class="food-photo-empty">
                    <span>📷</span>
                    <span>No photo added</span>
                </div>
            `;
            photoDataInput.value = '';
            removeBtn.style.display = 'none';
        }

        function resetFoodPhotoForm() {
            removeFoodPhoto();
            document.getElementById('foodCameraInput').value = '';
            document.getElementById('foodGalleryInput').value = '';
        }

        function viewRestaurant(id) {
            // Use the same view that includes dishes and photos
            viewRestaurantWithDishes(id);
        }

        function deleteRestaurant(id) {
            // Create custom confirm dialog
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            
            const dialog = document.createElement('div');
            dialog.style.cssText = 'background:white;padding:24px;border-radius:16px;max-width:300px;text-align:center;';
            dialog.innerHTML = `
                <h3 style="margin-bottom:16px;color:#2d3436;">Delete Restaurant?</h3>
                <p style="margin-bottom:20px;color:#636e72;">This action cannot be undone.</p>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button id="cancelDeleteBtn" style="padding:10px 24px;border:2px solid #e9ecef;background:white;border-radius:8px;font-weight:600;cursor:pointer;">Cancel</button>
                    <button id="confirmDeleteBtn" style="padding:10px 24px;border:none;background:#ff6b6b;color:white;border-radius:8px;font-weight:600;cursor:pointer;">Delete</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            document.getElementById('cancelDeleteBtn').onclick = function() {
                document.body.removeChild(overlay);
            };
            
            document.getElementById('confirmDeleteBtn').onclick = async function() {
                try {
                    restaurants = restaurants.filter(r => r.id !== id);
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    // Delete from Firestore
                    deleteRestaurantFromFirestore(id);
                    document.body.removeChild(overlay);
                    closeViewModal();
                    loadMarkers();
                    populateSidebar();
                } catch (error) {
                    alert('Error deleting restaurant');
                    document.body.removeChild(overlay);
                }
            };
            
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };
        }

        // Photo handling functions
        // Photo handling variables
        let pendingPhotoData = null;
        let pendingPhotoRestaurantId = null;
        let currentPhotoRating = 0;

        // Cover photo change functions
        function changeCoverPhotoCamera(restaurantId) {
            const input = document.getElementById(`coverPhotoCameraInput-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function changeCoverPhotoGallery(restaurantId) {
            const input = document.getElementById(`coverPhotoGalleryInput-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function handleCoverPhotoChange(event, restaurantId) {
            try {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    event.target.value = '';
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo is too large. Please select an image under 5MB.');
                    event.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                
                reader.onerror = function() {
                    alert('Error reading photo. Please try again.');
                    event.target.value = '';
                };
                
                reader.onload = function(e) {
                    try {
                        // Compress and save
                        compressImage(e.target.result, 800, 0.8, function(compressedImage) {
                            const restaurant = restaurants.find(r => r.id === restaurantId);
                            if (!restaurant) return;

                            // Update cover photo
                            restaurant.coverPhoto = compressedImage;
                            localStorage.setItem('restaurants', JSON.stringify(restaurants));

                            // Refresh the view
                            viewRestaurantWithDishes(restaurantId);
                            
                            // Also update markers to show new photo in list
                            loadMarkers();
                            populateSidebar();
                        });
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);

                // Reset the input
                event.target.value = '';
            } catch (err) {
                alert('Error with photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        function triggerCameraCapture(restaurantId) {
            const input = document.getElementById(`cameraCapture-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function triggerGalleryUpload(restaurantId) {
            const input = document.getElementById(`galleryUpload-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function handlePhotoCapture(event, restaurantId) {
            try {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    event.target.value = '';
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo is too large. Please select an image under 5MB.');
                    event.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                
                reader.onerror = function() {
                    alert('Error reading photo. Please try again.');
                    event.target.value = '';
                };
                
                reader.onload = function(e) {
                    try {
                        // Show crop modal first before compression
                        showPhotoCropModal(e.target.result, restaurantId);
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
                
                // Reset the input so the same file can be selected again
                event.target.value = '';
            } catch (err) {
                alert('Error capturing photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        // Photo crop modal state
        let cropImageScale = 1;
        let cropImageX = 0;
        let cropImageY = 0;
        let cropStartX = 0;
        let cropStartY = 0;
        let cropIsDragging = false;
        let cropOriginalImage = null;
        let cropRestaurantId = null;

        function showPhotoCropModal(imageUrl, restaurantId) {
            // Debug: confirm function is called
            console.log('showPhotoCropModal called', restaurantId);
            
            cropOriginalImage = imageUrl;
            cropRestaurantId = restaurantId;
            cropImageScale = 1;
            cropImageX = 0;
            cropImageY = 0;

            // Create modal if it doesn't exist
            let modal = document.getElementById('photoCropModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoCropModal';
                modal.className = 'photo-crop-modal';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="photo-crop-header">
                    <span class="photo-crop-title">Adjust Photo</span>
                    <button class="photo-crop-close" onclick="closePhotoCropModal()">×</button>
                </div>
                
                <div class="photo-crop-container" id="cropContainer"
                     ontouchstart="handleCropTouchStart(event)"
                     ontouchmove="handleCropTouchMove(event)"
                     ontouchend="handleCropTouchEnd(event)"
                     onmousedown="handleCropMouseDown(event)"
                     onmousemove="handleCropMouseMove(event)"
                     onmouseup="handleCropMouseUp(event)"
                     onmouseleave="handleCropMouseUp(event)">
                    <img class="photo-crop-image" id="cropImage" src="${imageUrl}" alt="Crop preview" draggable="false">
                    <div class="photo-crop-frame">
                        <div class="photo-crop-grid-v1"></div>
                        <div class="photo-crop-grid-v2"></div>
                    </div>
                </div>
                
                <div class="photo-crop-hint">Drag to position • Pinch or use buttons to zoom</div>
                
                <div class="photo-crop-controls">
                    <div class="photo-crop-zoom">
                        <button class="photo-crop-zoom-btn" onclick="cropZoom(-0.2)">−</button>
                        <span class="photo-crop-zoom-label" id="cropZoomLabel">100%</span>
                        <button class="photo-crop-zoom-btn" onclick="cropZoom(0.2)">+</button>
                    </div>
                </div>
                
                <div class="photo-crop-footer">
                    <button class="photo-crop-btn cancel" onclick="closePhotoCropModal()">Cancel</button>
                    <button class="photo-crop-btn confirm" onclick="confirmPhotoCrop()">Use Photo</button>
                </div>
            `;

            modal.classList.add('open');
            
            // Initialize transform
            setTimeout(updateCropTransform, 50);
        }

        // Touch handlers
        let lastTouchDist = 0;
        let pinchStartScale = 1;

        function handleCropTouchStart(e) {
            e.preventDefault();
            if (e.touches.length === 1) {
                cropIsDragging = true;
                cropStartX = e.touches[0].clientX - cropImageX;
                cropStartY = e.touches[0].clientY - cropImageY;
            } else if (e.touches.length === 2) {
                cropIsDragging = false;
                lastTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                pinchStartScale = cropImageScale;
            }
        }

        function handleCropTouchMove(e) {
            e.preventDefault();
            if (e.touches.length === 1 && cropIsDragging) {
                cropImageX = e.touches[0].clientX - cropStartX;
                cropImageY = e.touches[0].clientY - cropStartY;
                updateCropTransform();
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                cropImageScale = Math.max(0.5, Math.min(3, pinchStartScale * (dist / lastTouchDist)));
                document.getElementById('cropZoomLabel').textContent = Math.round(cropImageScale * 100) + '%';
                updateCropTransform();
            }
        }

        function handleCropTouchEnd(e) {
            cropIsDragging = false;
        }

        // Mouse handlers
        function handleCropMouseDown(e) {
            e.preventDefault();
            cropIsDragging = true;
            cropStartX = e.clientX - cropImageX;
            cropStartY = e.clientY - cropImageY;
        }

        function handleCropMouseMove(e) {
            if (!cropIsDragging) return;
            e.preventDefault();
            cropImageX = e.clientX - cropStartX;
            cropImageY = e.clientY - cropStartY;
            updateCropTransform();
        }

        function handleCropMouseUp(e) {
            cropIsDragging = false;
        }

        function setupCropEvents() {
            // Now using inline handlers
        }

        function cropZoom(delta) {
            cropImageScale = Math.max(0.5, Math.min(3, cropImageScale + delta));
            document.getElementById('cropZoomLabel').textContent = Math.round(cropImageScale * 100) + '%';
            updateCropTransform();
        }

        function updateCropTransform() {
            const img = document.getElementById('cropImage');
            if (img) {
                img.style.transform = `translate(${cropImageX}px, ${cropImageY}px) scale(${cropImageScale})`;
            }
        }

        function closePhotoCropModal() {
            const modal = document.getElementById('photoCropModal');
            if (modal) {
                modal.classList.remove('open');
            }
            cropOriginalImage = null;
            cropRestaurantId = null;
        }

        function confirmPhotoCrop() {
            // Create cropped image from canvas
            const img = document.getElementById('cropImage');
            const frame = document.querySelector('.photo-crop-frame');
            const container = document.getElementById('cropContainer');
            
            if (!img || !frame || !container) {
                closePhotoCropModal();
                return;
            }

            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Get frame dimensions and position
                const frameRect = frame.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                
                // Calculate what part of the image is in the frame
                const scaleX = img.naturalWidth / imgRect.width;
                const scaleY = img.naturalHeight / imgRect.height;
                
                const cropX = (frameRect.left - imgRect.left) * scaleX;
                const cropY = (frameRect.top - imgRect.top) * scaleY;
                const cropWidth = frameRect.width * scaleX;
                const cropHeight = frameRect.height * scaleY;
                
                // Set canvas size (square output)
                canvas.width = 800;
                canvas.height = 800;
                
                // Draw cropped portion
                ctx.drawImage(
                    img,
                    Math.max(0, cropX),
                    Math.max(0, cropY),
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    800,
                    800
                );
                
                const croppedImage = canvas.toDataURL('image/jpeg', 0.85);
                
                // Close crop modal and show rating modal
                closePhotoCropModal();
                
                pendingPhotoData = croppedImage;
                pendingPhotoRestaurantId = cropRestaurantId;
                currentPhotoRating = 0;
                showPhotoRatingModal(croppedImage);
                
            } catch (err) {
                // If cropping fails, use original image
                closePhotoCropModal();
                compressImage(cropOriginalImage, 800, 0.8, function(compressedImage) {
                    pendingPhotoData = compressedImage;
                    pendingPhotoRestaurantId = cropRestaurantId;
                    currentPhotoRating = 0;
                    showPhotoRatingModal(compressedImage);
                });
            }
        }

        function showPhotoRatingModal(imageUrl) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('photoRateModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoRateModal';
                modal.className = 'photo-rate-modal';
                document.body.appendChild(modal);
            }
            
            // Build category options
            const categories = getAllCategories();
            const categoryOptions = categories.map(cat => 
                `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`
            ).join('');
            
            modal.innerHTML = `
                <div class="photo-rate-content">
                    <img class="photo-rate-preview" id="photoRatePreview" src="${imageUrl}" alt="Preview">
                    <div class="photo-rate-body">
                        <h3 class="photo-rate-title">Rate this item</h3>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">What is this? 📂</label>
                            <select class="photo-rate-input" id="photoCategory" onchange="updatePhotoSubcategories()">
                                <option value="">Select category...</option>
                                ${categoryOptions}
                            </select>
                        </div>
                        
                        <div class="photo-rate-field" id="photoSubcategoryField" style="display: none;">
                            <label class="photo-rate-label">Type 📁</label>
                            <select class="photo-rate-input" id="photoSubcategory">
                                <option value="">Select type...</option>
                            </select>
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">How was it? ⭐</label>
                            <div class="photo-rate-stars" id="photoRateStars">
                                <span class="photo-rate-star" data-rating="1" onclick="setPhotoRating(1)">☆</span>
                                <span class="photo-rate-star" data-rating="2" onclick="setPhotoRating(2)">☆</span>
                                <span class="photo-rate-star" data-rating="3" onclick="setPhotoRating(3)">☆</span>
                                <span class="photo-rate-star" data-rating="4" onclick="setPhotoRating(4)">☆</span>
                                <span class="photo-rate-star" data-rating="5" onclick="setPhotoRating(5)">☆</span>
                            </div>
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Name</label>
                            <input type="text" class="photo-rate-input" id="photoDishName" placeholder="e.g. Grilled Sea Bass, Mojito...">
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Price (optional)</label>
                            <input type="text" class="photo-rate-input" id="photoPrice" placeholder="e.g. €15">
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Notes (optional)</label>
                            <input type="text" class="photo-rate-input" id="photoCaption" placeholder="e.g. Best fish I've ever had!">
                        </div>
                        
                        <div class="photo-rate-buttons">
                            <button class="photo-rate-btn cancel" onclick="closePhotoRatingModal()">Cancel</button>
                            <button class="photo-rate-btn save" onclick="savePhotoWithRating()">Save</button>
                        </div>
                    </div>
                </div>
            `;

            currentPhotoRating = 0;
            modal.classList.add('open');
        }
        
        function updatePhotoSubcategories() {
            const categoryId = document.getElementById('photoCategory').value;
            const subcategoryField = document.getElementById('photoSubcategoryField');
            const subcategorySelect = document.getElementById('photoSubcategory');
            
            if (!categoryId) {
                subcategoryField.style.display = 'none';
                return;
            }
            
            // Get subcategories for this category
            const subs = filterSubcategories[categoryId] || [];
            const customSubs = customSubcategories.filter(s => s.categoryId === categoryId);
            const allSubs = [...subs.filter(s => s.id !== 'all'), ...customSubs];
            
            if (allSubs.length === 0) {
                subcategoryField.style.display = 'none';
                return;
            }
            
            subcategorySelect.innerHTML = '<option value="">Select type...</option>' +
                allSubs.map(sub => `<option value="${sub.id}">${sub.label}</option>`).join('');
            subcategoryField.style.display = 'block';
        }

        function setPhotoRating(rating) {
            currentPhotoRating = rating;
            updateStarDisplay();
        }

        function updateStarDisplay() {
            const stars = document.querySelectorAll('#photoRateStars .photo-rate-star');
            stars.forEach((star, index) => {
                if (index < currentPhotoRating) {
                    star.textContent = '★';
                    star.classList.add('active');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('active');
                }
            });
        }

        function closePhotoRatingModal() {
            const modal = document.getElementById('photoRateModal');
            if (modal) {
                modal.classList.remove('open');
            }
            pendingPhotoData = null;
            pendingPhotoRestaurantId = null;
            currentPhotoRating = 0;
        }

        function savePhotoWithRating() {
            const categoryId = document.getElementById('photoCategory').value;
            const dishName = document.getElementById('photoDishName').value.trim();
            
            if (!categoryId) {
                alert('Please select a category');
                return;
            }
            if (!dishName) {
                alert('Please enter a name');
                return;
            }
            if (currentPhotoRating === 0) {
                alert('Please give a rating');
                return;
            }
            
            if (!pendingPhotoData || !pendingPhotoRestaurantId) {
                alert('Error: No photo data');
                return;
            }

            const restaurant = restaurants.find(r => r.id === pendingPhotoRestaurantId);
            if (!restaurant) {
                alert('Error: Restaurant not found');
                return;
            }

            // Initialize photos array if not exists
            if (!restaurant.photos) {
                restaurant.photos = [];
            }

            // Create photo object with metadata
            const photoObject = {
                url: pendingPhotoData,
                rating: currentPhotoRating,
                category: categoryId,
                subcategory: document.getElementById('photoSubcategory')?.value || '',
                dishName: dishName,
                price: document.getElementById('photoPrice').value.trim(),
                caption: document.getElementById('photoCaption').value.trim(),
                date: new Date().toISOString()
            };

            restaurant.photos.push(photoObject);

            try {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                // Sync to Firestore
                saveRestaurantToFirestore(restaurant);
            } catch (e) {
                alert('Storage full! Try deleting some photos first.');
                restaurant.photos.pop();
                return;
            }

            // Close modal and refresh view
            closePhotoRatingModal();
            viewRestaurantWithDishes(pendingPhotoRestaurantId);
        }

        function compressImage(dataUrl, maxWidth, quality, callback) {
            // Target max size: 500KB (safe for Firestore 1MB limit with other data)
            const MAX_SIZE_BYTES = 500 * 1024;

            try {
                const img = new Image();

                img.onerror = function() {
                    callback(dataUrl);
                };

                img.onload = function() {
                    try {
                        let currentMaxWidth = maxWidth;
                        let currentQuality = quality;

                        function tryCompress() {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Calculate new dimensions
                            if (width > currentMaxWidth) {
                                height = Math.round((height * currentMaxWidth) / width);
                                width = currentMaxWidth;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            // Convert to compressed JPEG
                            const compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

                            // Check size
                            const sizeBytes = Math.round((compressedDataUrl.length * 3) / 4);

                            if (sizeBytes > MAX_SIZE_BYTES && currentQuality > 0.3) {
                                // Still too big - reduce quality and try again
                                currentQuality -= 0.1;
                                currentMaxWidth = Math.round(currentMaxWidth * 0.8);
                                console.log(`Photo too large (${Math.round(sizeBytes/1024)}KB), reducing to ${currentMaxWidth}px @ ${Math.round(currentQuality*100)}%`);
                                tryCompress();
                            } else {
                                console.log(`Photo compressed to ${Math.round(sizeBytes/1024)}KB`);
                                callback(compressedDataUrl);
                            }
                        }

                        tryCompress();
                    } catch (err) {
                        callback(dataUrl);
                    }
                };
                img.src = dataUrl;
            } catch (err) {
                callback(dataUrl);
            }
        }

        function deletePhoto(restaurantId, photoIndex) {
            if (!confirm('Delete this photo?')) return;

            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos) return;

            restaurant.photos.splice(photoIndex, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            // Sync to Firestore
            saveRestaurantToFirestore(restaurant);

            // Refresh the view
            viewRestaurantWithDishes(restaurantId);
        }

        function openPhotoModalByIndex(restaurantId, photoIndex) {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos || !restaurant.photos[photoIndex]) return;
            
            const photo = restaurant.photos[photoIndex];
            const photoUrl = typeof photo === 'object' ? photo.url : photo;
            
            // If it's just a URL string, use simple modal
            if (typeof photo !== 'object') {
                openPhotoModal(photoUrl);
                return;
            }
            
            // Show detailed dish modal
            openDishDetailModal(photo, restaurant, photoIndex);
        }
        
        function openDishDetailModal(photo, restaurant, photoIndex) {
            let modal = document.getElementById('dishInfoModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dishInfoModal';
                modal.className = 'photo-modal';
                document.body.appendChild(modal);
            }
            
            const stars = '★'.repeat(photo.rating || 0) + '☆'.repeat(5 - (photo.rating || 0));
            const category = getAllCategories().find(c => c.id === photo.category);
            const categoryLabel = category ? `${category.emoji} ${category.name}` : '';
            
            modal.innerHTML = `
                <div class="dish-info-modal-content">
                    <button class="photo-modal-close" onclick="closeDishInfoModal()">×</button>
                    <img class="dish-info-image" src="${photo.url}" alt="${photo.dishName || 'Dish'}">
                    <div class="dish-info-body">
                        <h2 class="dish-info-name">${photo.dishName || 'Unnamed'}</h2>
                        <div class="dish-info-rating">
                            <span class="dish-info-stars">${stars}</span>
                            <span class="dish-info-rating-num">${photo.rating || 0}/5</span>
                        </div>
                        ${categoryLabel ? `<div class="dish-info-category">${categoryLabel}${photo.subcategory ? ' • ' + photo.subcategory : ''}</div>` : ''}
                        ${photo.price ? `<div class="dish-info-price">${photo.price}</div>` : ''}
                        <div class="dish-info-restaurant">📍 ${restaurant.name}</div>
                        ${photo.caption ? `<div class="dish-info-notes">"${photo.caption}"</div>` : ''}
                        ${photo.date ? `<div class="dish-info-date">📅 ${new Date(photo.date).toLocaleDateString()}</div>` : ''}
                        <button class="dish-info-delete-btn" onclick="deletePhotoFromModal(${restaurant.id}, ${photoIndex})">🗑️ Delete</button>
                    </div>
                </div>
            `;
            
            modal.classList.add('open');
        }
        
        function closeDishInfoModal() {
            const modal = document.getElementById('dishInfoModal');
            if (modal) {
                modal.classList.remove('open');
            }
        }
        
        function deletePhotoFromModal(restaurantId, photoIndex) {
            if (!confirm('Delete this item?')) return;

            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos) return;

            restaurant.photos.splice(photoIndex, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            // Sync to Firestore
            saveRestaurantToFirestore(restaurant);

            closeDishInfoModal();
            viewRestaurantWithDishes(restaurantId);
        }

        function openPhotoModal(photoUrl) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('photoViewModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoViewModal';
                modal.className = 'photo-modal';
                modal.innerHTML = `
                    <button class="photo-modal-close" onclick="closePhotoModal()">×</button>
                    <img class="photo-modal-content" id="photoModalImage" src="" alt="Food photo">
                `;
                document.body.appendChild(modal);
            }

            document.getElementById('photoModalImage').src = photoUrl;
            modal.classList.add('open');
        }

        function closePhotoModal() {
            const modal = document.getElementById('photoViewModal');
            if (modal) {
                modal.classList.remove('open');
            }
        }

        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
            if (event.target.id === 'dishDetailModal') {
                event.target.style.display = 'none';
            }
            if (event.target.id === 'photoViewModal') {
                closePhotoModal();
            }
            if (event.target.id === 'photoRateModal') {
                closePhotoRatingModal();
            }
            if (event.target.id === 'dishInfoModal') {
                closeDishInfoModal();
            }
        }

        // Settings data - stored in localStorage
        let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
        let customSubcategories = JSON.parse(localStorage.getItem('customSubcategories')) || [];
        let customPriceRanges = JSON.parse(localStorage.getItem('customPriceRanges')) || [];

        // Default categories for reference
        const defaultCategories = [
            { id: 'restaurant', name: 'Restaurant', emoji: '🍴' },
            { id: 'dessert', name: 'Dessert', emoji: '🍰' },
            { id: 'icecream', name: 'Ice Cream', emoji: '🍦' },
            { id: 'drinks', name: 'Drinks', emoji: '🍹' }
        ];

        function getAllCategories() {
            return [...defaultCategories, ...customCategories];
        }

        function populateSettingsLists() {
            populateCategoriesList();
            populateSubcategoriesList();
            populatePriceRangesList();
        }

        function populateCategoriesList() {
            const container = document.getElementById('categoriesList');
            if (!container) return;
            
            const allCategories = getAllCategories();
            
            if (allCategories.length === 0) {
                container.innerHTML = '<div class="settings-empty">No categories added</div>';
                return;
            }
            
            container.innerHTML = allCategories.map((cat, index) => {
                const isDefault = defaultCategories.some(d => d.id === cat.id);
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${cat.emoji}</span>
                            <div>
                                <div class="settings-item-name">${cat.name}</div>
                                <div class="settings-item-meta">${isDefault ? 'Default' : 'Custom'}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deleteCategory('${cat.id}', ${isDefault})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function populateSubcategoriesList() {
            const container = document.getElementById('subcategoriesList');
            
            // Get all subcategories from filterSubcategories and custom
            let allSubs = [];
            Object.keys(filterSubcategories).forEach(catId => {
                filterSubcategories[catId].forEach(sub => {
                    if (sub.id !== 'all') {
                        allSubs.push({ ...sub, categoryId: catId, isDefault: true });
                    }
                });
            });
            customSubcategories.forEach(sub => {
                allSubs.push({ ...sub, isDefault: false });
            });
            
            if (allSubs.length === 0) {
                container.innerHTML = '<div class="settings-empty">No subcategories added</div>';
                return;
            }
            
            container.innerHTML = allSubs.map(sub => {
                const category = getAllCategories().find(c => c.id === sub.categoryId);
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${sub.label.split(' ')[0]}</span>
                            <div>
                                <div class="settings-item-name">${sub.label.split(' ').slice(1).join(' ') || sub.id}</div>
                                <div class="settings-item-meta">${category ? category.name : sub.categoryId} • ${sub.isDefault ? 'Default' : 'Custom'}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deleteSubcategory('${sub.id}', '${sub.categoryId}', ${sub.isDefault})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function populatePriceRangesList() {
            const container = document.getElementById('priceRangesList');
            
            if (customPriceRanges.length === 0) {
                container.innerHTML = '<div class="settings-empty">No custom price ranges added. Using defaults.</div>';
                return;
            }
            
            container.innerHTML = customPriceRanges.map((pr, index) => {
                const targetName = pr.subcategoryId || pr.categoryId;
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${pr.label}</span>
                            <div>
                                <div class="settings-item-name">${pr.desc}</div>
                                <div class="settings-item-meta">Level ${pr.level} • ${targetName}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deletePriceRange(${index})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Modal functions
        function selectEmoji(inputId, emoji) {
            document.getElementById(inputId).value = emoji;
            
            // Highlight selected emoji
            const picker = document.getElementById(inputId + 'Picker') || 
                           document.getElementById(inputId.replace('Emoji', '') + 'EmojiPicker');
            if (picker) {
                picker.querySelectorAll('span').forEach(span => {
                    span.classList.remove('selected');
                    if (span.textContent === emoji) {
                        span.classList.add('selected');
                    }
                });
            }
        }

        function openAddCategoryModal() {
            document.getElementById('addCategoryModal').style.display = 'block';
            document.getElementById('categoryForm').reset();
            // Clear emoji selection
            document.querySelectorAll('#categoryEmojiPicker span').forEach(s => s.classList.remove('selected'));
        }

        function closeAddCategoryModal() {
            document.getElementById('addCategoryModal').style.display = 'none';
        }

        function openAddSubcategoryModal() {
            document.getElementById('addSubcategoryModal').style.display = 'block';
            document.getElementById('subcategoryForm').reset();
            // Clear emoji selection
            document.querySelectorAll('#subcategoryEmojiPicker span').forEach(s => s.classList.remove('selected'));
            
            // Populate parent category dropdown
            const select = document.getElementById('parentCategory');
            select.innerHTML = '<option value="">Select category...</option>' + 
                getAllCategories().map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`).join('');
        }

        function closeAddSubcategoryModal() {
            document.getElementById('addSubcategoryModal').style.display = 'none';
        }

        function openAddPriceRangeModal() {
            document.getElementById('addPriceRangeModal').style.display = 'block';
            document.getElementById('priceRangeForm').reset();
            document.getElementById('priceRangeCategoryGroup').style.display = 'none';
            document.getElementById('priceRangeSubcategoryGroup').style.display = 'none';
            
            // Populate category dropdown
            const catSelect = document.getElementById('priceRangeCategory');
            catSelect.innerHTML = '<option value="">Select category...</option>' + 
                getAllCategories().map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`).join('');
        }

        function closeAddPriceRangeModal() {
            document.getElementById('addPriceRangeModal').style.display = 'none';
        }

        function updatePriceRangeTargetOptions() {
            const target = document.getElementById('priceRangeTarget').value;
            document.getElementById('priceRangeCategoryGroup').style.display = target ? 'block' : 'none';
            document.getElementById('priceRangeSubcategoryGroup').style.display = target === 'subcategory' ? 'block' : 'none';
            
            if (target === 'subcategory') {
                // Populate subcategory dropdown when category changes
                document.getElementById('priceRangeCategory').onchange = function() {
                    const catId = this.value;
                    const subSelect = document.getElementById('priceRangeSubcategory');
                    const subs = filterSubcategories[catId] || [];
                    const customSubs = customSubcategories.filter(s => s.categoryId === catId);
                    const allSubs = [...subs.filter(s => s.id !== 'all'), ...customSubs];
                    
                    subSelect.innerHTML = '<option value="">Select subcategory...</option>' + 
                        allSubs.map(sub => `<option value="${sub.id}">${sub.label}</option>`).join('');
                };
            }
        }

        // Save functions
        function saveCategory() {
            const name = document.getElementById('categoryName').value.trim();
            const emoji = document.getElementById('categoryEmoji').value.trim();
            
            if (!name || !emoji) {
                alert('Please fill in all fields');
                return;
            }
            
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            // Check if already exists
            if (getAllCategories().some(c => c.id === id)) {
                alert('Category already exists');
                return;
            }
            
            customCategories.push({ id, name, emoji });
            localStorage.setItem('customCategories', JSON.stringify(customCategories));
            
            closeAddCategoryModal();
            populateCategoriesList();
        }

        function saveSubcategory() {
            const categoryId = document.getElementById('parentCategory').value;
            const name = document.getElementById('subcategoryName').value.trim();
            const emoji = document.getElementById('subcategoryEmoji').value.trim();
            
            if (!categoryId || !name || !emoji) {
                alert('Please fill in all fields');
                return;
            }
            
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            customSubcategories.push({ 
                id, 
                label: `${emoji} ${name}`,
                categoryId 
            });
            localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
            
            // Add to filterSubcategories for immediate use
            if (!filterSubcategories[categoryId]) {
                filterSubcategories[categoryId] = [{ id: 'all', label: '🍽️ All' }];
            }
            filterSubcategories[categoryId].push({ id, label: `${emoji} ${name}` });
            
            closeAddSubcategoryModal();
            populateSubcategoriesList();
        }

        function savePriceRange(e) {
            e.preventDefault();
            
            const target = document.getElementById('priceRangeTarget').value;
            const categoryId = document.getElementById('priceRangeCategory').value;
            const subcategoryId = target === 'subcategory' ? document.getElementById('priceRangeSubcategory').value : null;
            const level = parseInt(document.getElementById('priceRangeLevel').value);
            const label = document.getElementById('priceRangeLabel').value.trim();
            const desc = document.getElementById('priceRangeDesc').value.trim();
            
            if (!categoryId || !label || !desc) {
                alert('Please fill in all fields');
                return;
            }
            
            customPriceRanges.push({
                categoryId,
                subcategoryId,
                level,
                label,
                desc
            });
            localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));
            
            closeAddPriceRangeModal();
            populateSettingsLists();
        }

        // Delete functions
        function deleteCategory(id, isDefault) {
            if (!confirm('Delete this category?')) return;
            
            if (isDefault) {
                // Remove from defaultCategories array
                const idx = defaultCategories.findIndex(c => c.id === id);
                if (idx !== -1) {
                    defaultCategories.splice(idx, 1);
                }
            } else {
                customCategories = customCategories.filter(c => c.id !== id);
                localStorage.setItem('customCategories', JSON.stringify(customCategories));
            }
            populateCategoriesList();
        }

        function deleteSubcategory(id, categoryId, isDefault) {
            if (!confirm('Delete this subcategory?')) return;
            
            if (isDefault) {
                // Remove from filterSubcategories
                if (filterSubcategories[categoryId]) {
                    filterSubcategories[categoryId] = filterSubcategories[categoryId].filter(s => s.id !== id);
                }
            } else {
                customSubcategories = customSubcategories.filter(s => !(s.id === id && s.categoryId === categoryId));
                localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
                
                // Remove from filterSubcategories
                if (filterSubcategories[categoryId]) {
                    filterSubcategories[categoryId] = filterSubcategories[categoryId].filter(s => s.id !== id);
                }
            }
            
            populateSubcategoriesList();
        }

        function deletePriceRange(index) {
            if (!confirm('Delete this price range?')) return;
            
            customPriceRanges.splice(index, 1);
            localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));
            populateSettingsLists();
        }

        window.addEventListener('load', function() {
            // Migration: Remove cover photos from photos array (one-time cleanup)
            let needsSave = false;
            restaurants.forEach(restaurant => {
                if (restaurant.coverPhoto && restaurant.photos && restaurant.photos.length > 0) {
                    // Filter out any photo that matches the cover photo
                    const originalLength = restaurant.photos.length;
                    restaurant.photos = restaurant.photos.filter(photo => {
                        const photoUrl = typeof photo === 'object' ? photo.url : photo;
                        return photoUrl !== restaurant.coverPhoto;
                    });
                    if (restaurant.photos.length !== originalLength) {
                        needsSave = true;
                    }
                }
            });
            if (needsSave) {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
            }
            
            setTimeout(initMap, 100);
            // Show floating add button on home page by default
            const floatingAddBtn = document.getElementById('floatingAddBtn');
            if (floatingAddBtn) floatingAddBtn.classList.add('show');
        });

        // ==================== AUTH & GROUPS FUNCTIONS ====================
        
        // Default group with all restaurant data
        const defaultGroup = {
            id: 'group_darko_jessica',
            name: 'Darko & Jessica',
            description: 'Our Makarska dining adventures',
            photo: null,
            inviteCode: 'DJ2025',
            members: 2,
            places: 0, // Will be calculated
            ratings: 0, // Will be calculated
            createdAt: '2024-01-01T00:00:00.000Z'
        };

        // Initialize groups - only Darko & Jessica group
        function initializeGroups() {
            // Calculate places and ratings from restaurants
            const restaurantCount = restaurants.length;
            let totalRatings = 0;
            restaurants.forEach(r => {
                if (r.foodItems && r.foodItems.length > 0) {
                    totalRatings += r.foodItems.length;
                }
                if (r.foodRating) totalRatings++;
            });
            
            defaultGroup.places = restaurantCount;
            defaultGroup.ratings = totalRatings;
            
            // Only keep Darko & Jessica group - clear any others
            const groups = [defaultGroup];
            localStorage.setItem('userGroups', JSON.stringify(groups));
            
            return groups;
        }

        // Groups data stored in localStorage
        let userGroups = initializeGroups();
        let selectedGroupPhoto = null;
        let currentGroupId = 'group_darko_jessica'; // Default to Darko & Jessica group

        // Handle login - check if user has groups
        function handleLogin() {
            // Reload groups from localStorage
            userGroups = initializeGroups();
            
            if (userGroups.length > 0) {
                // User has groups, go directly to Groups List
                currentGroupId = userGroups[0].id; // Set first group as current
                showGroupsList();
            } else {
                // No groups, show Empty State
                showEmptyState();
            }
        }

        function saveGroups() {
            localStorage.setItem('userGroups', JSON.stringify(userGroups));
            // Sync to Firestore
            if (typeof saveGroupsToFirestore === 'function') {
                saveGroupsToFirestore(userGroups);
            }
        }

        function generateGroupId() {
            return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function generateInviteCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        function hideAllAuthScreens() {
            const loginScreen = document.getElementById('loginScreen');
            loginScreen.classList.add('hidden');
            loginScreen.classList.remove('visible');
            document.getElementById('emptyStateScreen').classList.add('hidden');
            document.getElementById('createGroupScreen').classList.remove('visible');
            document.getElementById('joinGroupScreen').classList.remove('visible');
            document.getElementById('groupsListScreen').classList.remove('visible');
            document.getElementById('mainApp').classList.remove('visible');
        }

        function showEmptyState() {
            hideAllAuthScreens();
            document.getElementById('emptyStateScreen').classList.remove('hidden');
        }

        function showCreateGroup() {
            hideAllAuthScreens();
            // Reset form
            document.getElementById('groupNameInput').value = '';
            document.getElementById('groupDescInput').value = '';
            removePhoto();
            document.getElementById('createGroupScreen').classList.add('visible');
        }

        function showJoinGroup() {
            hideAllAuthScreens();
            document.getElementById('inviteCodeInput').value = '';
            document.getElementById('joinGroupScreen').classList.add('visible');
        }

        function showGroupsList() {
            hideAllAuthScreens();
            renderGroupsList();
            document.getElementById('groupsListScreen').classList.add('visible');
        }

        function showMainApp() {
            hideAllAuthScreens();
            document.getElementById('mainApp').classList.add('visible');
            // Reinitialize map and sync with Firestore
            setTimeout(async () => {
                if (!map) {
                    initMap();
                } else {
                    map.invalidateSize();
                }
                // Sync with Firestore
                await initFirestoreSync();
                loadMarkers();
            }, 100);
        }

        function showLoginScreen() {
            hideAllAuthScreens();
            const loginScreen = document.getElementById('loginScreen');
            loginScreen.classList.remove('hidden');
            loginScreen.classList.add('visible');
            // Reset to login form
            showLoginForm();
        }

        // Go back from Create Group - check if we have groups
        function goBackFromCreate() {
            if (userGroups.length > 0) {
                showGroupsList();
            } else {
                showEmptyState();
            }
        }

        // Go back from Join Group - check if we have groups
        function goBackFromJoin() {
            if (userGroups.length > 0) {
                showGroupsList();
            } else {
                showEmptyState();
            }
        }

        // Photo picker functions
        function pickPhoto() {
            document.getElementById('photoInput').click();
        }

        function takePhoto() {
            document.getElementById('cameraInput').click();
        }

        function handlePhotoSelect(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedGroupPhoto = e.target.result;
                    document.getElementById('photoPreview').src = selectedGroupPhoto;
                    document.getElementById('photoPreviewContainer').style.display = 'block';
                    document.getElementById('photoPicker').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }

        function removePhoto() {
            selectedGroupPhoto = null;
            document.getElementById('photoPreviewContainer').style.display = 'none';
            document.getElementById('photoPicker').style.display = 'flex';
            document.getElementById('photoInput').value = '';
            document.getElementById('cameraInput').value = '';
        }

        // Create group function
        function createGroup() {
            const groupName = document.getElementById('groupNameInput').value.trim();
            if (!groupName) {
                alert('Please enter a group name');
                return;
            }

            const newGroup = {
                id: generateGroupId(),
                name: groupName,
                description: document.getElementById('groupDescInput').value.trim(),
                photo: selectedGroupPhoto,
                inviteCode: generateInviteCode(),
                members: 1,
                places: 0,
                ratings: 0,
                createdAt: new Date().toISOString()
            };

            userGroups.push(newGroup);
            saveGroups();
            
            // Enter the new group
            currentGroupId = newGroup.id;
            showGroupsList();
        }

        // Join group function
        function joinGroup() {
            const inviteCode = document.getElementById('inviteCodeInput').value.trim().toUpperCase();
            if (!inviteCode || inviteCode.length < 6) {
                alert('Please enter a valid 6-digit invite code');
                return;
            }

            // Check if code matches any existing group (for demo, create a placeholder)
            // In real app, this would query Firebase
            const existingGroup = userGroups.find(g => g.inviteCode === inviteCode);
            
            if (existingGroup) {
                alert('You are already a member of this group!');
                showGroupsList();
                return;
            }

            // For demo, create a joined group with this code
            const joinedGroup = {
                id: generateGroupId(),
                name: 'Joined Group',
                description: 'Joined with code ' + inviteCode,
                photo: null,
                inviteCode: inviteCode,
                members: 2,
                places: 0,
                ratings: 0,
                createdAt: new Date().toISOString(),
                joined: true
            };

            userGroups.push(joinedGroup);
            saveGroups();
            showGroupsList();
        }

        // Render groups list
        function renderGroupsList() {
            const container = document.getElementById('groupsListContent');
            const subtitle = document.getElementById('groupsSubtitle');
            
            if (userGroups.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 24px;">
                        <div style="font-size: 64px; margin-bottom: 16px;">👥</div>
                        <div style="font-size: 18px; font-weight: 600; color: #2d3436; margin-bottom: 8px;">No groups yet</div>
                        <div style="font-size: 14px; color: #636e72;">Create your first group to get started</div>
                    </div>
                `;
                subtitle.textContent = 'No groups yet';
                return;
            }

            subtitle.textContent = userGroups.length + ' group' + (userGroups.length > 1 ? 's' : '');

            const gradients = [
                'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                'linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%)',
                'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
            ];

            container.innerHTML = userGroups.map((group, index) => {
                const avatarStyle = group.photo 
                    ? `background-image: url('${group.photo}'); background-size: cover; background-position: center;`
                    : `background: ${gradients[index % gradients.length]};`;
                
                const avatarContent = group.photo ? '' : '🍽️';
                
                return `
                    <div class="group-card" onclick="enterGroup('${group.id}')">
                        <div class="group-card-header">
                            <div class="group-avatar" style="${avatarStyle}">${avatarContent}</div>
                            <div class="group-info">
                                <div class="group-name">${group.name}</div>
                                <div class="group-meta">${group.members} member${group.members > 1 ? 's' : ''}</div>
                            </div>
                            <div class="group-arrow">›</div>
                        </div>
                        <div class="group-stats">
                            <div class="group-stat"><span class="group-stat-value">${group.places}</span> places</div>
                            <div class="group-stat"><span class="group-stat-value">${group.ratings}</span> ratings</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Enter a specific group
        function enterGroup(groupId) {
            currentGroupId = groupId;
            const group = userGroups.find(g => g.id === groupId);
            showMainApp();
        }

        // Check if user is already logged in (for demo, always show login)
        // In real app, check Firebase Auth state here

        function resetToDemo() {
            if (confirm('Vill du ladda demo-data med alla restauranger och maträtter?')) {
                localStorage.removeItem('restaurants');
                alert('Data återställd! Sidan laddas om...');
                window.location.reload(true);
            }
        }

        // Show login screen if not logged in
        setTimeout(function() {
            if (!currentUser) {
                const loginScreen = document.getElementById('loginScreen');
                if (loginScreen) {
                    loginScreen.classList.add('visible');
                }
            }
        }, 100);
