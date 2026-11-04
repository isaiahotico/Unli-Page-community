/* ==========================================================
   PAPERHOUSE INC. - UNLIMITED PAGE CORPS (app.js)
   Full Web Application Logic & State Engine
   ========================================================== */

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "freegcash-ads.firebaseapp.com",
    databaseURL: "https://freegcash-ads-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "freegcash-ads",
    storageBucket: "freegcash-ads.firebasestorage.app",
    messagingSenderId: "608086825364",
    appId: "1:608086825364:web:3a8e628d231b52c6171781"
};

// Default Avatar Pool
const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
];

// Central Application State
let state = {
    currentUser: null,
    pages: [],
    activePageId: null,
    activeGroupId: 'general',
    chatPaginationPage: 1,
    publicPosts30: [],
    cooldownInterval: null,
    nextAdTime: 0
};

/* ==========================================================
   INITIALIZATION & DATA PERSISTENCE
   ========================================================== */
function initApp() {
    loadUserFromStorage();
    loadPagesFromStorage();
    seedDefaultDataIfEmpty();
    setupAdCooldownTimer();
    switchTab('home');
    triggerInAppInterstitialAd();
}

function loadUserFromStorage() {
    const saved = localStorage.getItem('upc_user');
    if (saved) {
        state.currentUser = JSON.parse(saved);
    } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
        state.currentUser = {
            userId: 'usr_' + Date.now(),
            username: 'CorpsUser_' + randomNum,
            displayName: 'Corps Member #' + randomNum,
            avatarUrl: randomAvatar,
            bio: 'Passionate creator in the Unlimited Page Corps network.',
            websiteLinks: [
                { title: 'My Portfolio', url: 'https://paperhouseinc.com' },
                { title: 'YouTube Channel', url: 'https://youtube.com' }
            ]
        };
        saveUserToStorage();
    }
    renderUserProfile();
}

function saveUserToStorage() {
    localStorage.setItem('upc_user', JSON.stringify(state.currentUser));
}

function loadPagesFromStorage() {
    const saved = localStorage.getItem('upc_pages');
    if (saved) {
        state.pages = JSON.parse(saved);
    }
}

function savePagesToStorage() {
    localStorage.setItem('upc_pages', JSON.stringify(state.pages));
}

function seedDefaultDataIfEmpty() {
    if (state.pages.length === 0) {
        state.pages = [
            {
                pageId: 'page_1_tech',
                pageNumber: '1',
                pageName: 'Technology Hub',
                description: 'Discuss AI, frontend frameworks, and cloud architectures.',
                visibility: 'public',
                ownerId: state.currentUser.userId,
                ownerName: state.currentUser.displayName,
                members: [state.currentUser.userId],
                groups: [
                    { id: 'general', name: 'General Tech' },
                    { id: 'ai-news', name: 'AI Breakthroughs' }
                ],
                posts: [
                    {
                        postId: 'post_101',
                        title: 'Next-Gen Infinite Canvas Platforms',
                        description: 'Explore how infinite page allocation changes user interaction paradigms.',
                        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
                        videoUrl: '',
                        externalUrl: 'https://paperhouseinc.com',
                        cardTheme: 'diamond',
                        authorName: state.currentUser.displayName,
                        authorAvatar: state.currentUser.avatarUrl,
                        createdAt: new Date().toISOString()
                    },
                    {
                        postId: 'post_102',
                        title: 'Building Scalable Realtime Engines',
                        description: 'Handling 100-message chat pagination efficiently in mobile web apps.',
                        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
                        videoUrl: '',
                        externalUrl: '',
                        cardTheme: 'platinum',
                        authorName: 'Alex Cipher',
                        authorAvatar: DEFAULT_AVATARS[1],
                        createdAt: new Date().toISOString()
                    }
                ],
                chats: {
                    'general': [
                        { sender: 'Alex Cipher', avatar: DEFAULT_AVATARS[1], text: 'Welcome to Page 1 Technology Hub!', time: '10:00 AM' },
                        { sender: state.currentUser.displayName, avatar: state.currentUser.avatarUrl, text: 'Glad to be here. Unlimited numbers are working smoothly!', time: '10:02 AM' }
                    ]
                }
            },
            {
                pageId: 'page_2_gaming',
                pageNumber: '2',
                pageName: 'Gaming Universe',
                description: 'Esports, game dev showcases, and video clips.',
                visibility: 'public',
                ownerId: 'usr_gamer99',
                ownerName: 'VortexGamer',
                members: [],
                groups: [{ id: 'general', name: 'Main Lounge' }],
                posts: [
                    {
                        postId: 'post_201',
                        title: 'High Octane Cyber Trailer (5-Min Max Specs)',
                        description: 'Check out this full HD gameplay trailer preview.',
                        thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        externalUrl: '',
                        cardTheme: 'gold',
                        authorName: 'VortexGamer',
                        authorAvatar: DEFAULT_AVATARS[2],
                        createdAt: new Date().toISOString()
                    }
                ],
                chats: { 'general': [] }
            },
            {
                pageId: 'page_999999_future',
                pageNumber: '999999',
                pageName: 'Future Universe',
                description: 'Boundaryless creative space for large page numbers.',
                visibility: 'public',
                ownerId: 'usr_neo',
                ownerName: 'NeoArchitect',
                members: [],
                groups: [{ id: 'general', name: 'Future Lounge' }],
                posts: [
                    {
                        postId: 'post_999',
                        title: 'Welcome to Page 999,999',
                        description: 'Numerical identifiers carry no artificial constraints.',
                        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
                        videoUrl: '',
                        externalUrl: '',
                        cardTheme: 'emerald',
                        authorName: 'NeoArchitect',
                        authorAvatar: DEFAULT_AVATARS[3],
                        createdAt: new Date().toISOString()
                    }
                ],
                chats: { 'general': [] }
            }
        ];
        savePagesToStorage();
    }
}

/* ==========================================================
   NAVIGATION & UI VIEW SWITCHING
   ========================================================== */
function switchTab(viewId) {
    document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.remove('hidden');

    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.add('hidden');

    if (viewId === 'home') renderHomeDashboard();
    if (viewId === 'public-area') refreshPublicAreaPosts();
    if (viewId === 'my-pages') renderMyPagesGrid();
    if (viewId === 'profile') renderUserProfile();
}

function toggleMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.toggle('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

/* ==========================================================
   USER PROFILE & WEBSITE LINKS SHOWCASE
   ========================================================== */
function renderUserProfile() {
    const u = state.currentUser;
    if (!u) return;

    const navAvatar = document.getElementById('nav-user-avatar');
    const navName = document.getElementById('nav-user-name');
    if (navAvatar) navAvatar.src = u.avatarUrl;
    if (navName) navName.textContent = u.displayName;

    const dashImg = document.getElementById('dash-profile-img');
    const dashName = document.getElementById('dash-profile-name');
    const dashHandle = document.getElementById('dash-profile-handle');
    const dashBio = document.getElementById('dash-profile-bio');

    if (dashImg) dashImg.src = u.avatarUrl;
    if (dashName) dashName.textContent = u.displayName;
    if (dashHandle) dashHandle.textContent = '@' + u.username;
    if (dashBio) dashBio.textContent = u.bio || 'No bio added yet.';

    const editAvatarPreview = document.getElementById('edit-avatar-preview');
    const editAvatarUrl = document.getElementById('edit-avatar-url');
    const editUsername = document.getElementById('edit-username');
    const editDisplay = document.getElementById('edit-displayname');
    const editBio = document.getElementById('edit-bio');
    const profUserId = document.getElementById('prof-user-id');

    if (editAvatarPreview) editAvatarPreview.src = u.avatarUrl;
    if (editAvatarUrl) editAvatarUrl.value = u.avatarUrl;
    if (editUsername) editUsername.value = u.username;
    if (editDisplay) editDisplay.value = u.displayName;
    if (editBio) editBio.value = u.bio;
    if (profUserId) profUserId.textContent = u.userId;

    renderProfileWebsiteLinks();
}

function updateAvatarPreview(url) {
    const preview = document.getElementById('edit-avatar-preview');
    if (preview && url) preview.src = url;
}

function handleSaveProfile(e) {
    e.preventDefault();
    state.currentUser.avatarUrl = document.getElementById('edit-avatar-url').value;
    state.currentUser.username = document.getElementById('edit-username').value;
    state.currentUser.displayName = document.getElementById('edit-displayname').value;
    state.currentUser.bio = document.getElementById('edit-bio').value;

    saveUserToStorage();
    renderUserProfile();
    alert('Profile updated successfully!');
}

function renderProfileWebsiteLinks() {
    const containerDash = document.getElementById('dash-profile-links');
    const containerEdit = document.getElementById('website-links-list');

    let dashHtml = '';
    let editHtml = '';

    (state.currentUser.websiteLinks || []).forEach((link, idx) => {
        dashHtml += `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="block p-2 rounded bg-slate-900 hover:bg-slate-800 text-xs text-sky-400 font-semibold border border-slate-800 transition truncate">
                <i class="fa-solid fa-link mr-1.5 text-slate-400"></i>${link.title}
            </a>
        `;
        editHtml += `
            <div class="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div class="truncate">
                    <p class="text-xs font-bold text-white">${link.title}</p>
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-indigo-400 hover:underline truncate block">${link.url}</a>
                </div>
                <button type="button" onclick="deleteWebsiteLink(${idx})" class="p-1.5 text-slate-400 hover:text-rose-400">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    if (containerDash) containerDash.innerHTML = dashHtml || '<p class="text-slate-500 text-[11px]">No external website links added.</p>';
    if (containerEdit) containerEdit.innerHTML = editHtml || '<p class="text-slate-500 text-xs">No links showcase added.</p>';
}

function openAddLinkModal() {
    const modal = document.getElementById('modal-add-link');
    if (modal) modal.classList.remove('hidden');
}

function handleAddWebsiteLink(e) {
    e.preventDefault();
    const title = document.getElementById('link-title').value.trim();
    const url = document.getElementById('link-url').value.trim();

    if (!state.currentUser.websiteLinks) state.currentUser.websiteLinks = [];
    state.currentUser.websiteLinks.push({ title, url });

    saveUserToStorage();
    renderUserProfile();
    closeModal('modal-add-link');
    document.getElementById('link-title').value = '';
    document.getElementById('link-url').value = '';
}

function deleteWebsiteLink(idx) {
    state.currentUser.websiteLinks.splice(idx, 1);
    saveUserToStorage();
    renderUserProfile();
}

/* ==========================================================
   UNLIMITED PAGE GENERATION & MANAGEMENT
   ========================================================== */
function openCreatePageModal() {
    const modal = document.getElementById('modal-create-page');
    if (modal) modal.classList.remove('hidden');
}

function handleCreatePage(e) {
    e.preventDefault();
    const pageNum = document.getElementById('create-page-num').value.trim();
    const pageName = document.getElementById('create-page-name').value.trim();
    const desc = document.getElementById('create-page-desc').value.trim();
    const vis = document.getElementById('create-page-vis').value;

    const newPage = {
        pageId: 'page_' + Date.now(),
        pageNumber: pageNum,
        pageName: pageName,
        description: desc || `Page #${pageNum} community hosted on Unlimited Page Corps.`,
        visibility: vis,
        ownerId: state.currentUser.userId,
        ownerName: state.currentUser.displayName,
        members: [state.currentUser.userId],
        groups: [{ id: 'general', name: 'General Chat' }],
        posts: [],
        chats: { 'general': [] }
    };

    state.pages.unshift(newPage);
    savePagesToStorage();

    closeModal('modal-create-page');
    openPageDetail(newPage.pageId);
}

function renderMyPagesGrid() {
    const container = document.getElementById('my-pages-grid');
    if (!container) return;

    const myPages = state.pages.filter(p => p.ownerId === state.currentUser.userId || (p.members && p.members.includes(state.currentUser.userId)));

    if (myPages.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-cardbg rounded-2xl border border-slate-800">
                <i class="fa-solid fa-folder-plus text-4xl text-slate-600 mb-3"></i>
                <p class="text-slate-300 font-bold">No Pages Created Yet</p>
                <p class="text-xs text-slate-500 mt-1">Generate your first unlimited page now using any number!</p>
                <button onclick="openCreatePageModal()" class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow">
                    Generate Page
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = myPages.map(page => `
        <div class="bg-cardbg rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-slate-700 transition space-y-3">
            <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                    PAGE #${page.pageNumber}
                </span>
                <span class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    ${page.visibility}
                </span>
            </div>
            <h3 class="text-lg font-bold text-white hover:text-indigo-400 cursor-pointer" onclick="openPageDetail('${page.pageId}')">
                ${page.pageName}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2">${page.description}</p>
            <div class="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                <span class="text-slate-500">${(page.posts || []).length} Topics</span>
                <button onclick="openPageDetail('${page.pageId}')" class="text-indigo-400 font-semibold hover:underline">
                    Open Page <i class="fa-solid fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderHomeDashboard() {
    const homePagesContainer = document.getElementById('home-my-pages-list');
    if (homePagesContainer) {
        const userPages = state.pages.slice(0, 4);
        homePagesContainer.innerHTML = userPages.map(page => `
            <div onclick="openPageDetail('${page.pageId}')" class="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 cursor-pointer transition flex items-center justify-between">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-mono font-bold text-emerald-400">#${page.pageNumber}</span>
                        <span class="text-xs font-bold text-white">${page.pageName}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-0.5">${(page.posts || []).length} published posts</p>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-600 text-xs"></i>
            </div>
        `).join('');
    }

    const homeFeaturedContainer = document.getElementById('home-featured-posts');
    if (homeFeaturedContainer) {
        const allPublicPosts = [];
        state.pages.filter(p => p.visibility === 'public').forEach(p => {
            (p.posts || []).forEach(post => {
                allPublicPosts.push({ ...post, pageId: p.pageId, pageNumber: p.pageNumber, pageName: p.pageName });
            });
        });

        homeFeaturedContainer.innerHTML = allPublicPosts.slice(0, 3).map(post => renderPostCardHtml(post)).join('') || '<p class="text-slate-500 text-xs">No posts available.</p>';
    }
}

/* ==========================================================
   INDIVIDUAL PAGE DASHBOARD & GROUPS
   ========================================================== */
function openPageDetail(pageId) {
    const page = state.pages.find(p => p.pageId === pageId);
    if (!page) return;

    state.activePageId = pageId;
    state.activeGroupId = 'general';
    state.chatPaginationPage = 1;

    document.getElementById('page-detail-num').textContent = '#' + page.pageNumber;
    document.getElementById('page-detail-title').textContent = page.pageName;
    document.getElementById('page-detail-desc').textContent = page.description;
    document.getElementById('page-detail-owner').innerHTML = `Owner: <span class="text-indigo-400">@${page.ownerName}</span>`;

    const visBadge = document.getElementById('page-detail-vis-badge');
    if (visBadge) {
        visBadge.textContent = page.visibility.toUpperCase();
        visBadge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold border ${page.visibility === 'public' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`;
    }

    const joinBtn = document.getElementById('btn-page-join');
    if (joinBtn) {
        const isMember = (page.members || []).includes(state.currentUser.userId);
        joinBtn.innerHTML = isMember ? '<i class="fa-solid fa-user-check mr-1 text-emerald-400"></i>Joined' : '<i class="fa-solid fa-user-plus mr-1"></i>Join Community';
    }

    renderPageGroupsTabs(page);
    renderPagePostsFeed(page);
    renderPageChatMessages(page);

    switchTab('page-detail');
}

function toggleJoinPage() {
    const page = state.pages.find(p => p.pageId === state.activePageId);
    if (!page) return;

    if (!page.members) page.members = [];
    const idx = page.members.indexOf(state.currentUser.userId);
    if (idx > -1) {
        page.members.splice(idx, 1);
    } else {
        page.members.push(state.currentUser.userId);
    }
    savePagesToStorage();
    openPageDetail(page.pageId);
}

function renderPageGroupsTabs(page) {
    const container = document.getElementById('page-subgroups-bar');
    if (!container) return;

    container.innerHTML = (page.groups || []).map(group => `
        <button onclick="switchActiveGroup('${group.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${state.activeGroupId === group.id ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
            # ${group.name}
        </button>
    `).join('');
}

function switchActiveGroup(groupId) {
    state.activeGroupId = groupId;
    const page = state.pages.find(p => p.pageId === state.activePageId);
    if (page) {
        renderPageGroupsTabs(page);
        renderPageChatMessages(page);
    }
}

function openCreateGroupModal() {
    const modal = document.getElementById('modal-create-group');
    if (modal) modal.classList.remove('hidden');
}

function handleCreateGroup(e) {
    e.preventDefault();
    const groupName = document.getElementById('group-name').value.trim();
    const page = state.pages.find(p => p.pageId === state.activePageId);

    if (page && groupName) {
        const groupId = 'grp_' + Date.now();
        if (!page.groups) page.groups = [];
        page.groups.push({ id: groupId, name: groupName });
        if (!page.chats) page.chats = {};
        page.chats[groupId] = [];

        savePagesToStorage();
        closeModal('modal-create-group');
        document.getElementById('group-name').value = '';
        switchActiveGroup(groupId);
    }
}

/* ==========================================================
   REAL-TIME CHAT & 100-MESSAGE PAGINATION
   ========================================================== */
function renderPageChatMessages(page) {
    const chatHeaderTitle = document.getElementById('chat-header-title');
    const groupObj = (page.groups || []).find(g => g.id === state.activeGroupId) || { name: 'Main' };
    if (chatHeaderTitle) {
        chatHeaderTitle.innerHTML = `<i class="fa-solid fa-comments text-sky-400"></i><span>${groupObj.name} Chat</span>`;
    }

    const chats = (page.chats && page.chats[state.activeGroupId]) || [];
    const messagesPerPage = 100;
    const totalPages = Math.max(1, Math.ceil(chats.length / messagesPerPage));

    if (state.chatPaginationPage > totalPages) state.chatPaginationPage = totalPages;
    const pageNumEl = document.getElementById('chat-page-num');
    if (pageNumEl) pageNumEl.textContent = `Pg ${state.chatPaginationPage}/${totalPages}`;

    const startIdx = (state.chatPaginationPage - 1) * messagesPerPage;
    const pageMessages = chats.slice(startIdx, startIdx + messagesPerPage);

    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    if (pageMessages.length === 0) {
        container.innerHTML = '<div class="text-center text-slate-500 text-xs py-8">No messages yet. Start the conversation!</div>';
        return;
    }

    container.innerHTML = pageMessages.map(msg => `
        <div class="flex items-start space-x-2.5">
            <img src="${msg.avatar || DEFAULT_AVATARS[0]}" class="w-6 h-6 rounded-full object-cover mt-0.5" alt="Avatar">
            <div class="flex-grow">
                <div class="flex items-center space-x-2">
                    <span class="text-xs font-bold text-slate-200">${msg.sender}</span>
                    <span class="text-[10px] text-slate-500 font-mono">${msg.time}</span>
                </div>
                <p class="text-xs text-slate-300 mt-0.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 inline-block">${msg.text}</p>
            </div>
        </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
}

function prevChatPage() {
    if (state.chatPaginationPage > 1) {
        state.chatPaginationPage--;
        const page = state.pages.find(p => p.pageId === state.activePageId);
        if (page) renderPageChatMessages(page);
    }
}

function nextChatPage() {
    const page = state.pages.find(p => p.pageId === state.activePageId);
    const chats = (page && page.chats && page.chats[state.activeGroupId]) || [];
    const totalPages = Math.ceil(chats.length / 100);
    if (state.chatPaginationPage < totalPages) {
        state.chatPaginationPage++;
        renderPageChatMessages(page);
    }
}

function handleSendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input-text');
    const text = input.value.trim();
    if (!text) return;

    const page = state.pages.find(p => p.pageId === state.activePageId);
    if (!page) return;

    if (!page.chats) page.chats = {};
    if (!page.chats[state.activeGroupId]) page.chats[state.activeGroupId] = [];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    page.chats[state.activeGroupId].push({
        sender: state.currentUser.displayName,
        avatar: state.currentUser.avatarUrl,
        text: text,
        time: timeStr
    });

    savePagesToStorage();
    input.value = '';
    renderPageChatMessages(page);
}

/* ==========================================================
   TOPICS, POSTS, VIDEO (MAX 300S), & PREMIUM CARD DESIGNS
   ========================================================== */
function openCreatePostModal() {
    const modal = document.getElementById('modal-create-post');
    if (modal) modal.classList.remove('hidden');
}

function handleCreatePost(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value.trim();
    const desc = document.getElementById('post-desc').value.trim();
    const thumb = document.getElementById('post-thumb').value.trim();
    const video = document.getElementById('post-video').value.trim();
    const extLink = document.getElementById('post-ext-link').value.trim();
    const theme = document.getElementById('post-card-theme').value;

    const page = state.pages.find(p => p.pageId === state.activePageId);
    if (!page) return;

    if (!page.posts) page.posts = [];
    page.posts.unshift({
        postId: 'post_' + Date.now(),
        title: title,
        description: desc,
        thumbnail: thumb || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        videoUrl: video,
        externalUrl: extLink,
        cardTheme: theme,
        authorName: state.currentUser.displayName,
        authorAvatar: state.currentUser.avatarUrl,
        createdAt: new Date().toISOString()
    });

    savePagesToStorage();
    closeModal('modal-create-post');
    renderPagePostsFeed(page);
}

function renderPagePostsFeed(page) {
    const container = document.getElementById('page-posts-feed');
    if (!container) return;

    if (!page.posts || page.posts.length === 0) {
        container.innerHTML = '<div class="text-center text-slate-500 py-10 bg-cardbg rounded-xl border border-slate-800 text-xs">No posts published in this page yet.</div>';
        return;
    }

    container.innerHTML = page.posts.map(post => renderPostCardHtml({
        ...post,
        pageId: page.pageId,
        pageNumber: page.pageNumber,
        pageName: page.pageName
    })).join('');
}

function renderPostCardHtml(post) {
    const themeClass = `card-theme-${post.cardTheme || 'diamond'}`;
    return `
        <div class="${themeClass} rounded-2xl p-5 space-y-4 transition-all duration-300 hover:scale-[1.01]">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <img src="${post.authorAvatar || DEFAULT_AVATARS[0]}" class="w-8 h-8 rounded-full object-cover border border-slate-400" alt="Author">
                    <div>
                        <h4 class="text-xs font-bold text-white">${post.authorName}</h4>
                        <span class="text-[10px] text-slate-400">Page #${post.pageNumber || '1'} • ${post.pageName || 'Community'}</span>
                    </div>
                </div>
                <span class="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-black/40 text-slate-200 border border-white/10">
                    ${post.cardTheme || 'diamond'}
                </span>
            </div>

            <div>
                <h3 class="text-base font-extrabold text-white leading-snug mb-1">${post.title}</h3>
                <p class="text-xs text-slate-300 leading-relaxed">${post.description}</p>
            </div>

            ${post.videoUrl ? `
                <div class="rounded-xl overflow-hidden border border-slate-700 bg-black">
                    <video controls preload="metadata" class="w-full max-h-64 object-contain">
                        <source src="${post.videoUrl}" type="video/mp4">
                        Your browser does not support HTML5 video playback.
                    </video>
                    <p class="p-1.5 text-[10px] text-slate-400 bg-slate-900 text-center"><i class="fa-solid fa-video mr-1 text-emerald-400"></i> Max 300 Sec (5 Min) Video Playback</p>
                </div>
            ` : post.thumbnail ? `
                <div class="rounded-xl overflow-hidden border border-slate-800">
                    <img src="${post.thumbnail}" class="w-full h-48 object-cover" alt="Post Thumbnail" loading="lazy">
                </div>
            ` : ''}

            ${post.externalUrl ? `
                <a href="${post.externalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 text-xs text-sky-400 hover:underline font-semibold bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i><span>Visit External Link</span>
                </a>
            ` : ''}
        </div>
    `;
}

/* ==========================================================
   PUBLIC AREA: RANDOM 30-POST GENERATOR
   ========================================================== */
function refreshPublicAreaPosts() {
    const container = document.getElementById('public-area-grid');
    if (!container) return;

    let allPosts = [];

    state.pages.filter(p => p.visibility === 'public').forEach(p => {
        (p.posts || []).forEach(post => {
            allPosts.push({
                ...post,
                pageId: p.pageId,
                pageNumber: p.pageNumber,
                pageName: p.pageName
            });
        });
    });

    // Fisher-Yates Random Selection of 30 Posts
    const shuffled = [...allPosts];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected30 = shuffled.slice(0, 30);
    state.publicPosts30 = selected30;

    if (selected30.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-cardbg rounded-2xl border border-slate-800">
                <i class="fa-solid fa-compass text-4xl text-slate-600 mb-3"></i>
                <p class="text-slate-300 font-bold">No Public Posts Found</p>
                <p class="text-xs text-slate-500 mt-1">Create public pages and publish topics to populate the Public Area!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = selected30.map(post => renderPostCardHtml(post)).join('');
}

/* ==========================================================
   ADVERTISEMENT INTEGRATION & 5-MIN COOLDOWN
   ========================================================== */
function setupAdCooldownTimer() {
    const savedTime = localStorage.getItem('upc_next_ad');
    if (savedTime) {
        state.nextAdTime = parseInt(savedTime, 10);
    }
    setInterval(updateCooldownDisplay, 1000);
}

function updateCooldownDisplay() {
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((state.nextAdTime - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    const timerEl = document.getElementById('ad-cooldown-timer');
    if (timerEl) {
        timerEl.textContent = diff > 0 ? `Next Auto Ad: ${mins}:${secs < 10 ? '0' : ''}${secs}` : 'Auto Ad Ready';
    }
}

function triggerInAppInterstitialAd() {
    const now = Date.now();
    if (now < state.nextAdTime) {
        console.log('Ad Cooldown Active. Skipping interstitial.');
        return;
    }

    // Set 5-Minute Cooldown (300,000 ms)
    state.nextAdTime = now + (5 * 60 * 1000);
    localStorage.setItem('upc_next_ad', state.nextAdTime.toString());

    if (typeof window.show_10555663 === 'function') {
        try {
            window.show_10555663({
                type: 'inApp',
                inAppSettings: {
                    frequency: 2,
                    capping: 0.1,
                    interval: 30,
                    timeout: 5,
                    everyPage: false
                }
            });
        } catch (e) {
            console.log('Ad trigger exception:', e);
        }
    } else {
        console.log('Ad SDK initializing or adblocker present.');
    }
}

function triggerRewardedAd() {
    if (typeof window.show_10555663 === 'function') {
        window.show_10555663().then(() => {
            alert('You have seen an ad! Reward granted.');
        }).catch(err => {
            alert('Ad error or blocked: ' + err);
        });
    } else {
        alert('Rewarded ad simulated (SDK ready). Reward granted!');
    }
}

function triggerRewardedPopup() {
    if (typeof window.show_10555663 === 'function') {
        window.show_10555663('pop').then(() => {
            alert('Rewarded Popup completed!');
        }).catch(err => {
            console.log('Rewarded Popup dismissed or error:', err);
        });
    } else {
        alert('Rewarded Popup simulated (SDK ready).');
    }
}

// Startup execution
window.addEventListener('DOMContentLoaded', initApp);
