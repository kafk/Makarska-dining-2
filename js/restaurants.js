// ============================================
// RESTAURANTS.JS - Restaurant list and rendering
// ============================================

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
