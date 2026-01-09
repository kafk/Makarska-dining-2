// ============================================
// PHOTOS.JS - Photo upload, crop, and management
// ============================================

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


                    // === FLOAT CARD STYLE (default) - Light theme, no border ===
                    if (!showRating && !showPrice) {
                        // Default: Icon + name (white background)
                        const shortName = restaurant.name.length > 10 ? restaurant.name.substring(0, 9) + '…' : restaurant.name;
                        iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                            <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                            <span style="font-size: 12px; font-weight: 700; color: #2d3436;">${shortName}</span>
                        </div>`;
                    } else if (showRating && !showPrice) {
                        // Rating filter active: Light theme + icon + rating stars
                        iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                            <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                            <span style="color: #f59e0b; font-size: 13px; font-weight: 700;">${ratingStars}</span>
                        </div>`;
                    } else if (!showRating && showPrice) {
                        // Price filter active: Light theme + icon + price
                        iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                            <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                            <span style="color: ${priceColor}; font-size: 13px; font-weight: 700;">${priceSymbol}</span>
                        </div>`;
                    } else {
                        // Both filters active: Light theme + icon + rating + price stacked
                        iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                            <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 1px;">
                                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">${ratingStars}</span>
                                <span style="color: ${priceColor}; font-size: 11px; font-weight: 700;">${priceSymbol}</span>
                            </div>
                        </div>`;
                    }
                    iconSize = [160, 50];
                    iconAnchor = [25, 25];
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

            // Update count display
            const countEl = document.getElementById('filterResultCount');
            if (countEl) {
                if (filtered.length === restaurants.length) {
                    countEl.innerHTML = `<span style="color: #27ae60;">Showing all ${filtered.length}</span>`;
                } else if (filtered.length === 0) {
                    countEl.innerHTML = `<span style="color: #ff6b6b;">No matches</span>`;
                } else {
                    countEl.innerHTML = `<span style="color: #ff6b6b; font-weight: 600;">${filtered.length}</span> of ${restaurants.length}`;
                }
            }

            console.log('Filter applied:', { filterMainCategory, selectedRatings, selectedPrices, showRating, showPrice, showing: filtered.length });
        }

        // Filter subcategory state
        let filterSubcategory = 'all';

        // Filter subcategories (same as top dishes)
        const filterSubcategories = {
            'restaurant': [
                { id: 'all', label: '🍽️ All' },
                { id: 'seafood', label: '🐟 Seafood' },
                { id: 'meat', label: '🥩 Meat' },
                { id: 'pasta', label: '🍝 Pasta' },
                { id: 'pizza', label: '🍕 Pizza' },
                { id: 'salad', label: '🥗 Salad' }
            ],
            'dessert': [
                { id: 'all', label: '🍰 All' },
                { id: 'cake', label: '🎂 Cake' },
                { id: 'pastry', label: '🥐 Pastry' },
                { id: 'chocolate', label: '🍫 Chocolate' },
                { id: 'fruit', label: '🍓 Fruit' }
            ],
            'icecream': [
                { id: 'all', label: '🍦 All' },
                { id: 'gelato', label: '🍨 Gelato' },
                { id: 'sorbet', label: '🧊 Sorbet' },
                { id: 'sundae', label: '🍧 Sundae' },
                { id: 'cone', label: '🍦 Cone' }
            ],
            'drinks': [
                { id: 'all', label: '🍹 All' },
                { id: 'coffee', label: '☕ Coffee' },
                { id: 'cocktail', label: '🍸 Cocktails' },
                { id: 'wine', label: '🍷 Wine' },
                { id: 'beer', label: '🍺 Beer' },
                { id: 'juice', label: '🧃 Juice' }
            ]
        };

        function openFilterModal() {
            document.getElementById('filterModal').classList.add('open');
            updateFilterPreview(); // Show current filter count
        }

        function closeFilterModal() {
            document.getElementById('filterModal').classList.remove('open');
        }

        function selectFilterMainCategory(category) {
            filterMainCategory = category;
            filterSubcategory = 'all';

            // Update main category buttons
            const mainButtons = document.querySelectorAll('#filterMainCategories .filter-category-btn');
            mainButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Show/hide subcategories
            const subcategorySection = document.getElementById('filterSubcategorySection');
            if (category === 'all') {
                subcategorySection.style.display = 'none';
            } else {
                subcategorySection.style.display = 'block';
                populateFilterSubcategories(category);
            }

            // Update price filters based on category
            updatePriceFilters(category);

            // INSTANT FILTER - Apply immediately!
            applyFilterAndUpdateMap();
        }
        
        function updatePriceFilters(category, subcategory = null) {
            const priceContainer = document.getElementById('filterPriceChips');
            const priceTitle = document.getElementById('filterPriceTitle');
            
            let priceOptions = [];
            
            if (category === 'icecream') {
                priceTitle.textContent = 'Price (Ice Cream)';
                priceOptions = [
                    { value: 1, label: '€', desc: 'Under €3' },
                    { value: 2, label: '€€', desc: '€3-5' },
                    { value: 3, label: '€€€', desc: '€5-8' },
                    { value: 4, label: '€€€€', desc: '€8+' }
                ];
            } else if (category === 'dessert') {
                priceTitle.textContent = 'Price (Dessert)';
                priceOptions = [
                    { value: 1, label: '€', desc: 'Under €5' },
                    { value: 2, label: '€€', desc: '€5-10' },
                    { value: 3, label: '€€€', desc: '€10-15' },
                    { value: 4, label: '€€€€', desc: '€15+' }
                ];
            } else if (category === 'drinks') {
                priceTitle.textContent = 'Price (Drinks)';
                if (subcategory === 'wine') {
                    priceOptions = [
                        { value: 1, label: '🍷', desc: 'Under €5/glass' },
                        { value: 2, label: '🍷🍷', desc: '€5-10/glass' },
                        { value: 3, label: '🍷🍷🍷', desc: '€10-20/glass' },
                        { value: 4, label: '🍷🍷🍷🍷', desc: '€20+/bottle' }
                    ];
                } else if (subcategory === 'beer') {
                    priceOptions = [
                        { value: 1, label: '🍺', desc: 'Under €3' },
                        { value: 2, label: '🍺🍺', desc: '€3-5' },
                        { value: 3, label: '🍺🍺🍺', desc: '€5-8' },
                        { value: 4, label: '🍺🍺🍺🍺', desc: '€8+' }
                    ];
                } else if (subcategory === 'cocktail' || subcategory === 'cocktails') {
                    priceOptions = [
                        { value: 1, label: '🍹', desc: 'Under €8' },
                        { value: 2, label: '🍹🍹', desc: '€8-12' },
                        { value: 3, label: '🍹🍹🍹', desc: '€12-18' },
                        { value: 4, label: '🍹🍹🍹🍹', desc: '€18+' }
                    ];
                } else if (subcategory === 'coffee') {
                    priceOptions = [
                        { value: 1, label: '☕', desc: 'Under €2' },
                        { value: 2, label: '☕☕', desc: '€2-4' },
                        { value: 3, label: '☕☕☕', desc: '€4-6' },
                        { value: 4, label: '☕☕☕☕', desc: '€6+' }
                    ];
                } else {
                    priceOptions = [
                        { value: 1, label: '€', desc: 'Under €4' },
                        { value: 2, label: '€€', desc: '€4-8' },
                        { value: 3, label: '€€€', desc: '€8-15' },
                        { value: 4, label: '€€€€', desc: '€15+' }
                    ];
                }
            } else {
                // Restaurant / All
                priceTitle.textContent = 'Price (Food)';
                priceOptions = [
                    { value: 1, label: '€', desc: 'Under €15' },
                    { value: 2, label: '€€', desc: '€15-30' },
                    { value: 3, label: '€€€', desc: '€30-60' },
                    { value: 4, label: '€€€€', desc: '€60+' }
                ];
            }
            
            priceContainer.innerHTML = priceOptions.map(opt => `
                <button class="price-chip" onclick="togglePrice(this, ${opt.value})">
                    ${opt.label} <small>${opt.desc}</small>
                </button>
            `).join('');
        }

        function populateFilterSubcategories(category) {
            const container = document.getElementById('filterSubcategories');
            const subcategories = filterSubcategories[category] || [];

            container.innerHTML = subcategories.map(sub => `
                <button class="filter-subcategory-btn ${sub.id === 'all' ? 'active' : ''}" 
                        data-subcategory="${sub.id}"
                        onclick="selectFilterSubcategory('${sub.id}')">
                    ${sub.label}
                </button>
            `).join('');
        }

        function selectFilterSubcategory(subcategory) {
            filterSubcategory = subcategory;

            // Update subcategory buttons
            const subButtons = document.querySelectorAll('#filterSubcategories .filter-subcategory-btn');
            subButtons.forEach(btn => {
                if (btn.dataset.subcategory === subcategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update price filters for drinks subcategories
            const activeMainCategory = document.querySelector('#filterMainCategories .filter-category-btn.active');
            if (activeMainCategory && activeMainCategory.dataset.category === 'drinks') {
                updatePriceFilters('drinks', subcategory);
            }

            // Real-time preview
            updateFilterPreview();
        }

        function toggleRating(chipElement, rating) {
            chipElement.classList.toggle('active');
            const index = selectedRatings.indexOf(rating);
            if (index > -1) {
                selectedRatings.splice(index, 1);
            } else {
                selectedRatings.push(rating);
            }
            // INSTANT FILTER - Apply immediately!
            applyFilterAndUpdateMap();
        }

        function togglePrice(chipElement, price) {
            chipElement.classList.toggle('active');
            const index = selectedPrices.indexOf(price);
            if (index > -1) {
                selectedPrices.splice(index, 1);
            } else {
                selectedPrices.push(price);
            }
            // INSTANT FILTER - Apply immediately!
            applyFilterAndUpdateMap();
        }

        // Real-time filter preview - shows count without applying
        function updateFilterPreview() {
            const count = restaurants.filter(restaurant => {
                // Default to 'restaurant' if mainCategory is missing (for old data)
                const restaurantCategory = restaurant.mainCategory || 'restaurant';
                const categoryMatch = filterMainCategory === 'all' || restaurantCategory === filterMainCategory;

                let subcategoryMatch = true;
                if (filterSubcategory !== 'all' && filterMainCategory !== 'all') {
                    if (restaurant.foodItems && restaurant.foodItems.length > 0) {
                        subcategoryMatch = restaurant.foodItems.some(item => item.subcategory === filterSubcategory);
                    } else {
                        subcategoryMatch = false;
                    }
                }

                let ratingMatch = true;
                if (selectedRatings.length > 0) {
                    const avgRating = Math.round((restaurant.foodRating + restaurant.serviceRating) / 2);
                    ratingMatch = selectedRatings.includes(avgRating);
                }

                let priceMatch = true;
                if (selectedPrices.length > 0) {
                    priceMatch = selectedPrices.includes(restaurant.price);
                }

                return categoryMatch && subcategoryMatch && ratingMatch && priceMatch;
            }).length;

            const countEl = document.getElementById('filterResultCount');
            if (countEl) {
                if (count === restaurants.length) {
                    countEl.innerHTML = `<span style="color: #27ae60;">Showing all ${count} restaurants</span>`;
                } else if (count === 0) {
                    countEl.innerHTML = `<span style="color: #ff6b6b;">No restaurants match</span>`;
                } else {
                    countEl.innerHTML = `<span style="color: #ff6b6b; font-weight: 600;">${count}</span> of ${restaurants.length} restaurants`;
                }
            }
        }

        function resetFilters() {
            // Reset all filter state to defaults
            selectedRatings = [];
            selectedPrices = [];
            filterMainCategory = 'all';
            filterSubcategory = 'all';

            // Reset main category buttons
            document.querySelectorAll('#filterMainCategories .filter-category-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') btn.classList.add('active');
            });

            // Hide subcategories
            const subSection = document.getElementById('filterSubcategorySection');
            if (subSection) subSection.style.display = 'none';

            // Reset all chips
            document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
            document.querySelectorAll('.rating-chip').forEach(chip => chip.classList.remove('active'));
            document.querySelectorAll('.price-chip').forEach(chip => chip.classList.remove('active'));

            // INSTANT FILTER - Apply immediately (show all)
            applyFilterAndUpdateMap();

            // Update count
            updateFilterCount(restaurants.length, restaurants.length);
        }

        // Called when user clicks "Show Results" button in filter modal
        function applyFilters() {
            applyFilterAndUpdateMap();
            closeFilterModal();
        }

        function updateFilterCount(shown, total) {
            // Update any UI showing filter results count
            const countEl = document.getElementById('filterResultCount');
            if (countEl) {
                countEl.textContent = `Showing ${shown} of ${total}`;
            }
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            const modal = document.getElementById('filterModal');
            if (e.target === modal) {
                closeFilterModal();
            }
        });

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
