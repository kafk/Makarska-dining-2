// ============================================
// AUTH.JS - Authentication and group management
// ============================================

}

function generateGroupId() {
    return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function hideAllAuthScreens() {
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.add('hidden');
    loginScreen.classList.remove('visible');
    document.getElementById('emptyStateScreen').classList.add('hidden');
    document.getElementById('createGroupScreen').classList.remove('visible');
    document.getElementById('joinGroupScreen').classList.remove('visible');
    document.getElementById('groupsListScreen').classList.remove('visible');
    document.getElementById('mainApp').classList.remove('visible');
}

function showEmptyState() {
    hideAllAuthScreens();
    document.getElementById('emptyStateScreen').classList.remove('hidden');
}

function showCreateGroup() {
    hideAllAuthScreens();
    // Reset form
    document.getElementById('groupNameInput').value = '';
    document.getElementById('groupDescInput').value = '';
    removePhoto();
    document.getElementById('createGroupScreen').classList.add('visible');
}

function showJoinGroup() {
    hideAllAuthScreens();
    document.getElementById('inviteCodeInput').value = '';
    document.getElementById('joinGroupScreen').classList.add('visible');
}

function showGroupsList() {
    hideAllAuthScreens();
    renderGroupsList();
    document.getElementById('groupsListScreen').classList.add('visible');
}

function showMainApp() {
    hideAllAuthScreens();
    document.getElementById('mainApp').classList.add('visible');
    // Reinitialize map and sync with Firestore
    setTimeout(async () => {
        if (!map) {
            initMap();
        } else {
            map.invalidateSize();
        }
        // Sync with Firestore
        await initFirestoreSync();
        loadMarkers();
    }, 100);
}

function showLoginScreen() {
    hideAllAuthScreens();
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('visible');
    // Reset to login form
    showLoginForm();
}

// Go back from Create Group - check if we have groups
function goBackFromCreate() {
    if (userGroups.length > 0) {
        showGroupsList();
    } else {
        showEmptyState();
    }
}

// Go back from Join Group - check if we have groups
function goBackFromJoin() {
    if (userGroups.length > 0) {
        showGroupsList();
    } else {
        showEmptyState();
    }
}

// Photo picker functions
function pickPhoto() {
    document.getElementById('photoInput').click();
}

function takePhoto() {
    document.getElementById('cameraInput').click();
}

function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedGroupPhoto = e.target.result;
            document.getElementById('photoPreview').src = selectedGroupPhoto;
            document.getElementById('photoPreviewContainer').style.display = 'block';
            document.getElementById('photoPicker').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    selectedGroupPhoto = null;
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('photoPicker').style.display = 'flex';
    document.getElementById('photoInput').value = '';
    document.getElementById('cameraInput').value = '';
}

// Create group function
function createGroup() {
    const groupName = document.getElementById('groupNameInput').value.trim();
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }

    const newGroup = {
        id: generateGroupId(),
        name: groupName,
        description: document.getElementById('groupDescInput').value.trim(),
        photo: selectedGroupPhoto,
        inviteCode: generateInviteCode(),
        members: 1,
        places: 0,
        ratings: 0,
        createdAt: new Date().toISOString()
    };

    userGroups.push(newGroup);
    saveGroups();
    
    // Enter the new group
    currentGroupId = newGroup.id;
    showGroupsList();
}

// Join group function
function joinGroup() {
    const inviteCode = document.getElementById('inviteCodeInput').value.trim().toUpperCase();
    if (!inviteCode || inviteCode.length < 6) {
        alert('Please enter a valid 6-digit invite code');
        return;
    }

    // Check if code matches any existing group (for demo, create a placeholder)
    // In real app, this would query Firebase
    const existingGroup = userGroups.find(g => g.inviteCode === inviteCode);
    
    if (existingGroup) {
        alert('You are already a member of this group!');
        showGroupsList();
        return;
    }

    // For demo, create a joined group with this code
    const joinedGroup = {
        id: generateGroupId(),
        name: 'Joined Group',
        description: 'Joined with code ' + inviteCode,
        photo: null,
        inviteCode: inviteCode,
        members: 2,
        places: 0,
        ratings: 0,
        createdAt: new Date().toISOString(),
        joined: true
    };

    userGroups.push(joinedGroup);
    saveGroups();
    showGroupsList();
}

// Render groups list
function renderGroupsList() {
    const container = document.getElementById('groupsListContent');
    const subtitle = document.getElementById('groupsSubtitle');
    
    if (userGroups.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 24px;">
                <div style="font-size: 64px; margin-bottom: 16px;">👥</div>
                <div style="font-size: 18px; font-weight: 600; color: #2d3436; margin-bottom: 8px;">No groups yet</div>
                <div style="font-size: 14px; color: #636e72;">Create your first group to get started</div>
            </div>
        `;
        subtitle.textContent = 'No groups yet';
        return;
    }

    subtitle.textContent = userGroups.length + ' group' + (userGroups.length > 1 ? 's' : '');

    const gradients = [
        'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
        'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
        'linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%)',
        'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
        'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
    ];

    container.innerHTML = userGroups.map((group, index) => {
        const avatarStyle = group.photo 
            ? `background-image: url('${group.photo}'); background-size: cover; background-position: center;`
            : `background: ${gradients[index % gradients.length]};`;
        
        const avatarContent = group.photo ? '' : '🍽️';
        
        return `
            <div class="group-card" onclick="enterGroup('${group.id}')">
                <div class="group-card-header">
                    <div class="group-avatar" style="${avatarStyle}">${avatarContent}</div>
                    <div class="group-info">
                        <div class="group-name">${group.name}</div>
                        <div class="group-meta">${group.members} member${group.members > 1 ? 's' : ''}</div>
                    </div>
                    <div class="group-arrow">›</div>
                </div>
                <div class="group-stats">
                    <div class="group-stat"><span class="group-stat-value">${group.places}</span> places</div>
                    <div class="group-stat"><span class="group-stat-value">${group.ratings}</span> ratings</div>
                </div>
            </div>
        `;
    }).join('');
}

// Enter a specific group
function enterGroup(groupId) {
    currentGroupId = groupId;
    const group = userGroups.find(g => g.id === groupId);
    showMainApp();
}

// Check if user is already logged in (for demo, always show login)
// In real app, check Firebase Auth state here

function resetToDemo() {
    if (confirm('Vill du ladda demo-data med alla restauranger och maträtter?')) {
        localStorage.removeItem('restaurants');
        alert('Data återställd! Sidan laddas om...');
        window.location.reload(true);
    }
}

// Show login screen if not logged in
setTimeout(function() {
    if (!currentUser) {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.classList.add('visible');
        }
    }
}, 100);
