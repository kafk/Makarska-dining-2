// ============================================
// SETTINGS.JS - Settings and configuration
// ============================================

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
