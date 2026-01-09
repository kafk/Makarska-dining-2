// ============================================
// UI.JS - Sidebar, navigation, settings UI
// ============================================

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
