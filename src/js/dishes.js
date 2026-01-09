// ============================================
// DISHES.JS - Food items and dish management
// ============================================

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
