// ============================================
// INIT.JS - App initialization and event listeners
// ============================================

// Data migration for old data without mainCategory
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
