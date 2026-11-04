/**
 * Unlimited Page Corps Engine
 * Powered by Paperhouse Inc.
 */

const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "freegcash-ads.firebaseapp.com",
    databaseURL: "https://freegcash-ads-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "freegcash-ads",
    storageBucket: "freegcash-ads.firebasestorage.app",
    messagingSenderId: "608086825364",
    appId: "1:608086825364:web:3a8e628d231b52c6171781"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const app = {
    currentUser: null,
    currentPageId: null,
    currentGroupId: null,
    adTimerSeconds: 300, // 5 minute countdown
    
    init: () => {
        app.renderQuickPad();
        
        // Handle Firebase Anonymous Auth
        auth.onAuthStateChanged(user => {
            if (user) {
                app.currentUser = user;
                app.syncUserProfile();
                app.refreshFeed();
            } else {
                auth.signInAnonymously().catch(console.error);
            }
        });

        // Initialize In-App Interstitial Ad Cycle
        app.triggerInAppAd();
        app.startAdTimer();
    },

    // --- QUICK PAD RENDERING (1-9 Instant Page Generation) ---
    renderQuickPad: () => {
        const pad = document.getElementById('quick-number-pad');
        pad.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = "w-7 h-7 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-lg text-xs font-mono font-bold border border-slate-800 transition flex items-center justify-center";
            btn.innerText = i;
            btn.onclick = () => app.quickGenerateNumberPage(i);
            pad.appendChild(btn);
        }
    },

    quickGenerateNumberPage: async (num) => {
        const pageId = `node_${num}_${Date.now().toString(36)}`;
        await db.ref(`pages/${pageId}`).set({
            id: pageId,
            number: num,
            name: `Node Layer #${num}`,
            privacy: 'public',
            creator: app.currentUser ? app.currentUser.uid : 'anon',
            timestamp: Date.now()
        });
        app.openPage(pageId);
    },

    quickGenerateRandomPage: () => {
        const randomNum = Math.floor(Math.random() * 9) + 1;
        app.quickGenerateNumberPage(randomNum);
    },

    // --- ADS INTEGRATION & COOLDOWN ENGINE ---
    triggerInAppAd: () => {
        if (typeof show_10555663 === 'function') {
            try {
                show_10555663({
                    type: 'inApp',
                    inAppSettings: {
                        frequency: 2,
                        capping: 0.1,
                        interval: 30,
                        timeout: 5,
                        everyPage: false
                    }
                });
            } catch (err) {
                console.warn("InApp Ad Execution Warning:", err);
            }
        }
    },

    watchRewardedAd: () => {
        if (typeof show_10555663 === 'function') {
            show_10555663('pop').then(() => {
                alert("Paperhouse Reward Granted! Ad completion verified.");
            }).catch(e => {
                console.error("Ad playback error:", e);
                alert("Ad could not be completed at this moment.");
            });
        }
    },

    startAdTimer: () => {
        setInterval(() => {
            if (app.adTimerSeconds > 0) {
                app.adTimerSeconds--;
            } else {
                app.adTimerSeconds = 300; // Reset 5 minutes
                app.triggerInAppAd();
            }
            const mins = String(Math.floor(app.adTimerSeconds / 60)).padStart(2, '0');
            const secs = String(app.adTimerSeconds % 60).padStart(2, '0');
            const badge = document.getElementById('ad-timer-text');
            if (badge) badge.innerText = `${mins}:${secs}`;
        }, 1000);
    },

    // --- NAVIGATION ENGINE ---
    switchView: (viewName) => {
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(`view-${viewName}`);
        if (target) target.classList.remove('hidden');
    },

    // --- USER PROFILE SYSTEM ---
    syncUserProfile: () => {
        const uid = app.currentUser.uid;
        document.getElementById('profile-user-id').value = uid;

        db.ref(`users/${uid}`).on('value', snap => {
            const data = snap.val();
            if (!data) {
                const randomName = "Agent_" + Math.floor(1000 + Math.random() * 9000);
                const randomPfp = `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`;
                db.ref(`users/${uid}`).set({
                    name: randomName,
                    photoURL: randomPfp
                });
            } else {
                document.getElementById('nav-username').innerText = data.name;
                document.getElementById('nav-pfp').src = data.photoURL;
                document.getElementById('profile-edit-pfp').src = data.photoURL;
                document.getElementById('profile-edit-name').value = data.name;
            }
        });
    },

    saveProfile: async () => {
        const name = document.getElementById('profile-edit-name').value;
        const fileInput = document.getElementById('pfp-upload');
        let photoURL = document.getElementById('profile-edit-pfp').src;

        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            const ref = storage.ref(`pfps/${app.currentUser.uid}_${Date.now()}`);
            await ref.put(file);
            photoURL = await ref.getDownloadURL();
        }

        await db.ref(`users/${app.currentUser.uid}`).update({ name, photoURL });
        alert("Profile identity updated successfully.");
    },

    // --- PAGE CREATION ---
    createPage: async () => {
        const num = document.getElementById('page-number-input').value || 1;
        const name = document.getElementById('page-name-input').value || `Node ${num}`;
        const privacy = document.getElementById('page-privacy').value;

        const pageId = `node_${num}_${Date.now().toString(36)}`;
        await db.ref(`pages/${pageId}`).set({
            id: pageId,
            number: num,
            name: name,
            privacy: privacy,
            creator: app.currentUser.uid,
            timestamp: Date.now()
        });

        app.openPage(pageId);
    },

    openPage: (pageId) => {
        app.currentPageId = pageId;
        app.switchView('page');

        db.ref(`pages/${pageId}`).once('value', snap => {
            const page = snap.val();
            if (page) {
                document.getElementById('display-page-badge').innerText = `NODE #${page.number}`;
                document.getElementById('display-page-name').innerText = page.name;
                document.getElementById('display-page-id').innerText = `ID: ${page.id}`;
                app.loadGroups(pageId);
                app.loadPagePosts(pageId);
            }
        });
    },

    // --- POST PUBLISHING WITH 300s VIDEO VALIDATION ---
    uploadPost: async () => {
        const title = document.getElementById('post-title').value;
        const desc = document.getElementById('post-desc').value;
        const videoFile = document.getElementById('post-video').files[0];
        const link = document.getElementById('post-link').value;
        const btn = document.getElementById('btn-upload');

        if (!title) return alert("Title is required!");

        // Validate Video Max 300 Seconds
        if (videoFile) {
            const duration = await app.getVideoDuration(videoFile);
            if (duration > 300) {
                return alert("Video exceeds maximum limit of 300 seconds (5 minutes).");
            }
        }

        btn.disabled = true;
        btn.innerText = "Processing & Uploading...";

        let videoUrl = "";
        if (videoFile) {
            const sRef = storage.ref(`videos/${Date.now()}_${videoFile.name}`);
            await sRef.put(videoFile);
            videoUrl = await sRef.getDownloadURL();
        }

        // Rarity Tiers for Card styling
        const rarities = ['card-diamond animate-shimmer-diamond', 'card-platinum animate-shimmer-platinum', 'card-gold', 'card-obsidian'];
        const chosenRarity = rarities[Math.floor(Math.random() * rarities.length)];

        const postData = {
            title,
            desc,
            videoUrl,
            link,
            rarity: chosenRarity,
            pageId: app.currentPageId,
            userId: app.currentUser.uid,
            timestamp: Date.now()
        };

        const postKey = db.ref('posts').push().key;
        const updates = {};
        updates[`/posts/${postKey}`] = postData;
        updates[`/page_posts/${app.currentPageId}/${postKey}`] = postData;

        await db.ref().update(updates);

        btn.disabled = false;
        btn.innerText = "Publish Content Node";

        // Reset Form
        document.getElementById('post-title').value = '';
        document.getElementById('post-desc').value = '';
        document.getElementById('post-video').value = '';
        document.getElementById('post-link').value = '';

        app.loadPagePosts(app.currentPageId);
    },

    getVideoDuration: (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    },

    // --- FEED DISCOVERY (30 Random Cards) ---
    refreshFeed: () => {
        const grid = document.getElementById('public-feed-grid');
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500"><i class="fas fa-spinner fa-spin text-2xl"></i></div>`;

        db.ref('posts').limitToLast(100).once('value', snap => {
            grid.innerHTML = '';
            const posts = [];
            snap.forEach(c => { posts.push(c.val()); });

            // Randomize and select max 30 posts
            const shuffled = posts.sort(() => 0.5 - Math.random()).slice(0, 30);

            if (shuffled.length === 0) {
                grid.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500">No public posts available yet. Create one!</div>`;
                return;
            }

            shuffled.forEach(post => {
                const isDarkCard = post.rarity.includes('obsidian');
                const textColor = isDarkCard ? 'text-slate-100' : 'text-slate-900';

                const cardHtml = `
                    <div class="p-4 rounded-2xl ${post.rarity} ${textColor} space-y-3 transition transform hover:-translate-y-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-sm truncate max-w-[80%]">${post.title}</h4>
                            <span class="text-[9px] font-mono opacity-60 uppercase">NODE</span>
                        </div>
                        <p class="text-xs opacity-80 line-clamp-2">${post.desc}</p>
                        ${post.videoUrl ? `<video src="${post.videoUrl}" controls class="w-full h-36 object-cover rounded-xl bg-black/40"></video>` : ''}
                        ${post.link ? `<a href="${post.link}" target="_blank" class="text-xs underline block font-semibold hover:opacity-80 truncate"><i class="fas fa-link text-[10px]"></i> ${post.link}</a>` : ''}
                    </div>
                `;
                grid.innerHTML += cardHtml;
            });
        });
    },

    loadPagePosts: (pageId) => {
        const container = document.getElementById('page-posts');
        db.ref(`page_posts/${pageId}`).on('value', snap => {
            container.innerHTML = '';
            snap.forEach(c => {
                const post = c.val();
                const card = `
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-slate-200">
                        <h4 class="font-bold text-sm">${post.title}</h4>
                        <p class="text-xs text-slate-400">${post.desc}</p>
                        ${post.videoUrl ? `<video src="${post.videoUrl}" controls class="w-full h-48 object-cover rounded-xl bg-slate-950"></video>` : ''}
                        ${post.link ? `<a href="${post.link}" target="_blank" class="text-xs text-cyan-400 underline block"><i class="fas fa-link"></i> ${post.link}</a>` : ''}
                    </div>
                `;
                container.innerHTML += card;
            });
        });
    },

    // --- REALTIME CHAT & GROUPS (100 Message Windowing) ---
    showGroupCreatePrompt: async () => {
        const groupName = prompt("Enter Group Channel Name:");
        if (groupName && app.currentPageId) {
            await db.ref(`groups/${app.currentPageId}`).push({ name: groupName });
            app.loadGroups(app.currentPageId);
        }
    },

    loadGroups: (pageId) => {
        const list = document.getElementById('group-list');
        db.ref(`groups/${pageId}`).on('value', snap => {
            list.innerHTML = '';
            let firstGroupKey = null;

            snap.forEach(c => {
                if (!firstGroupKey) firstGroupKey = c.key;
                const g = c.val();
                const btn = document.createElement('button');
                btn.className = "w-full text-left px-3 py-1.5 rounded-xl text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium transition flex items-center gap-2 border border-slate-800/50";
                btn.innerHTML = `<i class="fas fa-hashtag text-cyan-400 text-[10px]"></i> ${g.name}`;
                btn.onclick = () => app.openChat(c.key, g.name);
                list.appendChild(btn);
            });

            if (firstGroupKey && !app.currentGroupId) {
                app.openChat(firstGroupKey, 'General');
            }
        });
    },

    openChat: (groupId, groupName) => {
        app.currentGroupId = groupId;
        document.getElementById('chat-container').classList.remove('hidden');
        document.getElementById('active-group-title').innerText = `# ${groupName}`;
        const chatBox = document.getElementById('chat-messages');

        // Windowed strictly to 100 messages max
        db.ref(`chats/${groupId}`).limitToLast(100).on('value', snap => {
            chatBox.innerHTML = '';
            snap.forEach(c => {
                const msg = c.val();
                chatBox.innerHTML += `
                    <div class="space-y-0.5">
                        <div class="flex justify-between items-center text-[10px] text-slate-500">
                            <span class="font-bold text-cyan-400">${msg.userName || 'Agent'}</span>
                            <span>${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p class="text-slate-200">${msg.text}</p>
                    </div>
                `;
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    },

    sendMessage: () => {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text || !app.currentGroupId) return;

        db.ref(`chats/${app.currentGroupId}`).push({
            userId: app.currentUser.uid,
            userName: document.getElementById('nav-username').innerText,
            text: text,
            timestamp: Date.now()
        });
        input.value = '';
    }
};

// Initialize Application Engine on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});