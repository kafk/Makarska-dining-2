// ============================================
// SEARCH.JS - Search and autocomplete
// ============================================

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
