// ============================================
// UI.JS - Sidebar, modals, navigation
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

