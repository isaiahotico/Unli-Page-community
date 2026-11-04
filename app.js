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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const app = {
    currentUser: null,
    currentPageId: null,
    currentGroupId: null,
    adCooldown: false,

    init: async () => {
        // Handle Auth
        auth.onAuthStateChanged(user => {
            if (user) {
                app.currentUser = user;
                app.syncProfile();
                app.refreshFeed();
            } else {
                auth.signInAnonymously();
            }
        });

        // Ad Logic: Every 5 minutes (300000ms)
        app.triggerAd();
        setInterval(() => app.triggerAd(), 300000);
    },

    triggerAd: () => {
        console.log("Triggering Ads...");
        // Show Interstitial
        show_10555663({
            type: 'inApp',
            inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
        });
        
        // Rewarded Logic
        show_10555663().then(() => {
            console.log("Ad Watched");
        }).catch(e => console.error("Ad failed", e));
    },

    syncProfile: () => {
        db.ref(`users/${app.currentUser.uid}`).on('value', snap => {
            let data = snap.val();
            if (!data) {
                // Generate random name if new user
                const randomName = "User_" + Math.floor(Math.random() * 9999);
                db.ref(`users/${app.currentUser.uid}`).set({
                    name: randomName,
                    photoURL: "https://www.gravatar.com/avatar/000?d=mp"
                });
            } else {
                document.getElementById('nav-username').innerText = data.name;
                document.getElementById('nav-pfp').src = data.photoURL;
                document.getElementById('profile-edit-pfp').src = data.photoURL;
                document.getElementById('profile-edit-name').value = data.name;
            }
        });
    },

    switchView: (viewName) => {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`view-${viewName}`).classList.remove('hidden');
    },

    createPage: async () => {
        const num = document.getElementById('page-number-input').value;
        const name = document.getElementById('page-name-input').value || "Unnamed Page";
        const privacy = document.getElementById('page-privacy').value;

        if (!num || num < 1) return alert("Enter valid numbers 1-9");

        const pageId = `page_${num}_${Date.now()}`;
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
            document.getElementById('display-page-name').innerText = page.name;
            document.getElementById('display-page-number').innerText = `ID: ${page.number}`;
            app.loadGroups(pageId);
            app.loadPagePosts(pageId);
        });
    },

    uploadPost: async () => {
        const title = document.getElementById('post-title').value;
        const desc = document.getElementById('post-desc').value;
        const videoFile = document.getElementById('post-video').files[0];
        const link = document.getElementById('post-link').value;
        const btn = document.getElementById('btn-upload');

        if (!title) return alert("Title required");
        btn.disabled = true;
        btn.innerText = "Uploading...";

        let videoUrl = "";
        if (videoFile) {
            // Check video length would usually happen here via a metadata check
            const storageRef = storage.ref(`videos/${Date.now()}_${videoFile.name}`);
            await storageRef.put(videoFile);
            videoUrl = await storageRef.getDownloadURL();
        }

        const rarities = ['shiny-diamond', 'shiny-platinum', 'bg-gray-700'];
        const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];

        const postData = {
            title,
            desc,
            videoUrl,
            link,
            rarity: randomRarity,
            pageId: app.currentPageId,
            userId: app.currentUser.uid,
            timestamp: Date.now()
        };

        await db.ref(`posts`).push(postData);
        await db.ref(`page_posts/${app.currentPageId}`).push(postData);

        btn.disabled = false;
        btn.innerText = "Post to Page";
        app.loadPagePosts(app.currentPageId);
    },

    refreshFeed: () => {
        const feedGrid = document.getElementById('public-feed-grid');
        feedGrid.innerHTML = "Loading...";

        db.ref('posts').limitToLast(100).once('value', snap => {
            feedGrid.innerHTML = "";
            let posts = [];
            snap.forEach(child => { posts.push(child.val()); });
            
            // Randomize and pick 30
            const shuffled = posts.sort(() => 0.5 - Math.random()).slice(0, 30);

            shuffled.forEach(post => {
                const card = `
                    <div class="p-4 rounded-lg shadow-lg text-black ${post.rarity} transform hover:scale-105 transition-all">
                        <h4 class="font-bold text-lg truncate">${post.title}</h4>
                        <p class="text-xs mb-2 line-clamp-2">${post.desc}</p>
                        ${post.videoUrl ? `<video src="${post.videoUrl}" class="w-full h-32 object-cover rounded" controls></video>` : ''}
                        ${post.link ? `<a href="${post.link}" target="_blank" class="text-blue-800 text-xs underline block mt-2">View Link</a>` : ''}
                    </div>
                `;
                feedGrid.innerHTML += card;
            });
        });
    },

    // Group & Chat Logic
    showGroupCreate: async () => {
        const name = prompt("Group Name:");
        if (name) {
            await db.ref(`groups/${app.currentPageId}`).push({ name: name });
            app.loadGroups(app.currentPageId);
        }
    },

    loadGroups: (pageId) => {
        const list = document.getElementById('group-list');
        db.ref(`groups/${pageId}`).on('value', snap => {
            list.innerHTML = "";
            snap.forEach(child => {
                const g = child.val();
                const btn = document.createElement('button');
                btn.className = "w-full text-left p-2 bg-gray-700 rounded hover:bg-blue-600";
                btn.innerText = `# ${g.name}`;
                btn.onclick = () => app.openChat(child.key);
                list.appendChild(btn);
            });
        });
    },

    openChat: (groupId) => {
        app.currentGroupId = groupId;
        document.getElementById('chat-container').classList.remove('hidden');
        const msgBox = document.getElementById('chat-messages');
        
        db.ref(`chats/${groupId}`).limitToLast(100).on('value', snap => {
            msgBox.innerHTML = "";
            snap.forEach(child => {
                const m = child.val();
                msgBox.innerHTML += `<div class="mb-1"><b class="text-blue-400">User:</b> ${m.text}</div>`;
            });
            msgBox.scrollTop = msgBox.scrollHeight;
        });
    },

    sendMessage: () => {
        const text = document.getElementById('chat-input').value;
        if (!text || !app.currentGroupId) return;
        db.ref(`chats/${app.currentGroupId}`).push({
            userId: app.currentUser.uid,
            text: text,
            timestamp: Date.now()
        });
        document.getElementById('chat-input').value = "";
    },

    saveProfile: async () => {
        const newName = document.getElementById('profile-edit-name').value;
        const file = document.getElementById('pfp-upload').files[0];
        let url = document.getElementById('profile-edit-pfp').src;

        if (file) {
            const ref = storage.ref(`pfps/${app.currentUser.uid}`);
            await ref.put(file);
            url = await ref.getDownloadURL();
        }

        await db.ref(`users/${app.currentUser.uid}`).update({
            name: newName,
            photoURL: url
        });
        alert("Profile Updated!");
    }
};

app.init();