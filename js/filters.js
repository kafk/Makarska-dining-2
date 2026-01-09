// ============================================
// FILTERS.JS - Filter modal and filtering logic
// ============================================

        // ========== REACT-STYLE FILTER (Simple & Direct) ==========
        // State: empty array = show all
        let filterMainCategory = 'all';
        let selectedRatings = [];
        let selectedPrices = [];

        // Core filter function - runs instantly on any change
        function getFilteredRestaurants() {
            return restaurants.filter(r => {
                // Type/Category match
                const restaurantType = r.mainCategory || 'restaurant';
                const typeMatch = filterMainCategory === 'all' || restaurantType === filterMainCategory;

                // Subcategory match (e.g., Seafood within Restaurant)
                let subcategoryMatch = true;
                if (filterSubcategory !== 'all' && filterMainCategory !== 'all') {
                    // Check if restaurant has dishes with this subcategory
                    if (r.foodItems && r.foodItems.length > 0) {
                        // foodItems use 'category' field, not 'subcategory'
                        subcategoryMatch = r.foodItems.some(item => item.category === filterSubcategory);
                    }
                    // Also check photos array (they have 'category' or 'subcategory' field)
                    if (!subcategoryMatch && r.photos && r.photos.length > 0) {
                        subcategoryMatch = r.photos.some(photo =>
                            photo.category === filterSubcategory ||
                            photo.subcategory === filterSubcategory
                        );
                    }
                    // Fallback: check cuisine field
                    if (!subcategoryMatch && r.cuisine) {
                        subcategoryMatch = r.cuisine.toLowerCase().includes(filterSubcategory.toLowerCase());
                    }
                }

                // Rating match (empty = show all)
                const avgRating = Math.round(((r.foodRating || 0) + (r.serviceRating || 0)) / 2) || 0;
                const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(avgRating);

                // Price match (empty = show all)
                const priceMatch = selectedPrices.length === 0 || selectedPrices.includes(r.price);

                return typeMatch && subcategoryMatch && ratingMatch && priceMatch;
            });
        }

        // Apply filter and update map - call this on every filter change
        function applyFilterAndUpdateMap() {
            const filtered = getFilteredRestaurants();

            // Dynamic display flags (like React reference)
            const showRating = selectedRatings.length > 0;
            const showPrice = selectedPrices.length > 0;

            // Clear existing markers
            if (markerClusterGroup) {
                markerClusterGroup.clearLayers();
            }
            markers = [];

            // Add filtered markers with ADAPTIVE pin style
            filtered.forEach(restaurant => {
                const mainCat = restaurant.mainCategory || 'restaurant';
                const icon = mainCategoryIcons[mainCat] || '🍴';
                const iconBg = mainCategoryColors[mainCat] || '#ff6b6b';
                const svg = mainCategorySvg[mainCat] || mainCategorySvg['restaurant'];
                const avgRating = Math.round(((restaurant.foodRating || 0) + (restaurant.serviceRating || 0)) / 2) || 0;
                const price = restaurant.price || 1;

                // Price color based on level (like React)
                const priceColor = price === 1 ? '#4ade80' : price === 2 ? '#facc15' : price === 3 ? '#f97316' : '#ef4444';
                const priceSymbol = '€'.repeat(price);
                const ratingStars = '★'.repeat(avgRating);

                // Build ADAPTIVE pin HTML based on active filters AND pin style
                let iconHtml;
                let iconSize;
                let iconAnchor;

                if (currentPinStyle === 'circle-dot') {
                    // === CIRCLE + DOT STYLE ===
                    // Build badge HTML based on active filters
                    let priceBadge = '';
                    let ratingBadge = '';

                    if (showPrice) {
                        priceBadge = `<div style="position: absolute; top: -4px; right: -8px; background: ${priceColor}; color: white; font-size: 9px; font-weight: 700; padding: 3px 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${priceSymbol}</div>`;
                    }
                    if (showRating) {
                        ratingBadge = `<div style="position: absolute; top: -4px; left: -8px; background: #fbbf24; color: white; font-size: 9px; font-weight: 700; padding: 3px 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 2px;">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>${avgRating.toFixed(1)}
                        </div>`;
                    }

                    iconHtml = `<div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="position: relative;">
                            <div style="width: 50px; height: 50px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.2); border: 3px solid white;">
                                ${svg}
                            </div>
                            ${priceBadge}
                            ${ratingBadge}
                        </div>
                        <div style="width: 10px; height: 10px; background: ${iconBg}; border-radius: 50%; margin-top: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
                    </div>`;
                    iconSize = [70, 70];
                    iconAnchor = [35, 66];
                } else {
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
