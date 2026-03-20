// ============================================
// DISHES.JS - Dishes and food menu logic
// ============================================

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

