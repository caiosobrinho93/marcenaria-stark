const LocalDB = {
    get: (key, def = []) => JSON.parse(localStorage.getItem('state_db_' + key)) || def,
    set: (key, val) => localStorage.setItem('state_db_' + key, JSON.stringify(val))
};

// State
let bridgeUser = localStorage.getItem('clubstate_bridge_user');
if(bridgeUser) {
    localStorage.setItem('state_current_user', bridgeUser);
    sessionStorage.setItem('clubstate_session', 'active');
    localStorage.removeItem('clubstate_bridge_user'); // Consumed
}
let sessionProject = localStorage.getItem('state_current_user') || null;

// Routing
const viewLogin = document.getElementById('view-login');
const viewDashboard = document.getElementById('view-dashboard');

function switchView(view) {
    if(viewLogin) viewLogin.classList.remove('active');
    if(viewDashboard) viewDashboard.classList.remove('active');
    const target = document.getElementById('view-' + view);
    if(target) target.classList.add('active');
}

// Social Navigation
function switchSocialTab(tabId) {
    document.querySelectorAll('.social-tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById('tab-' + tabId);
    if(target) target.style.display = 'block';
    const btn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
    if(btn) btn.classList.add('active');

    if(tabId === 'feed') renderFeed();
    if(tabId === 'friends') renderFriendsList();
    if(tabId === 'groups') renderGroups();
    if(tabId === 'profile') renderInstagramProfile();
}
window.switchView = switchView;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const isAdminActive = localStorage.getItem('state_admin_session') === 'active';
    if (sessionProject || isAdminActive) {
        initDashboard();
        switchView('dashboard');
    } else {
        switchView('login');
    }
});

// Login Handlers
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('access-user').value.trim();
        const p = document.getElementById('access-pass').value.trim();
        
        const db = JSON.parse(localStorage.getItem('state_users')) || [];
        const validUser = db.find(x => x.u === u && x.p === p);
        
        if (validUser) {
            localStorage.setItem('state_current_user', validUser.u);
            localStorage.setItem('state_admin_session', 'active');
            sessionProject = validUser.u;
            toast(`Bem-vindo ao clubSTATE!`, 'success');
            setTimeout(() => {
                initDashboard();
                switchView('dashboard');
            }, 800);
        } else {
            toast('Credenciais corporativas inválidas.', 'error');
        }
    });
}

function logout() {
    localStorage.removeItem('state_admin_session');
    localStorage.removeItem('state_current_user');
    sessionStorage.removeItem('clubstate_session');
    sessionProject = null;
    window.location.href = '../admin/login.html'; 
}
window.logout = logout;

function checkAuth() {
    const session = localStorage.getItem('state_admin_session');
    const user = localStorage.getItem('state_current_user');
    // If we're on login view, don't force logout
    const isLoginActive = document.getElementById('view-login')?.classList.contains('active');
    if (!isLoginActive && (session !== 'active' || !user)) {
        logout();
    }
}
setInterval(checkAuth, 5000);

// --- GLOBAL STATE ---
let currentPostImages = [];
let activeCommentPostId = null;
let feedPage = 0;
const postsPerPage = 6;
let feedObserver = null;

// --- FEED ENGINE ---
function renderFeed(append = false) {
    const container = document.getElementById('social-feed-list');
    if(!container) return;
    
    if(!append) {
        container.innerHTML = '';
        feedPage = 0;
    }

    const allPosts = LocalDB.get('social_posts');
    const start = feedPage * postsPerPage;
    const end = start + postsPerPage;
    const posts = allPosts.slice(start, end);
    
    const dbUsers = JSON.parse(localStorage.getItem('state_users')) || [];
    const currentUser = sessionProject;
    const currentUserObj = dbUsers.find(x => x.u === currentUser) || {};

    // Update VIP status UI
    const createBtn = document.querySelector('button[onclick="openCreateGroup()"]');
    if(createBtn) {
        createBtn.style.opacity = currentUserObj.isVIP ? '1' : '0.4';
        createBtn.title = currentUserObj.isVIP ? 'Criar Novo Grupo' : 'Recurso exclusivo para Membros VIP';
    }

    const html = posts.map(p => {
        const u = dbUsers.find(x => x.u === p.user) || { name: p.user };
        const isLiked = (p.likes || []).includes(currentUser);
        const imagesHtml = (p.images || []).map(img => `<img src="${img}" class="feed-img-small" style="width:100px; height:100px; object-fit:cover; border-radius:8px; border:1px solid var(--border-glass);">`).join('');
        
        return `
            <div class="glass-panel post-card" style="padding:0; overflow:hidden; position:relative;">
                <button onclick="togglePostOptions(event, ${p.id})" style="position:absolute; top:12px; right:12px; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                
                <div style="padding:12px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-glass);">
                    <img src="${u.avatar || '../imgs/logo-state.png'}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                    <div><strong style="color:var(--brand-yellow); font-size:1rem;">${(u.name || p.user).toUpperCase()}</strong><br><small style="opacity:0.5; font-size:0.75rem;">${p.time || 'Agora'}</small></div>
                </div>
                
                ${p.text ? `
                    <div class="post-text-content" style="padding:12px; font-size:1rem; line-height:1.5; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;">${p.text}</div>
                    ${p.text.length > 300 ? `<button class="btn-ver-mais" onclick="toggleVerMais(this)" style="margin-left:12px; margin-bottom:10px;">Ver mais</button>` : ''}
                ` : ''}
                
                ${p.images && p.images.length > 0 ? `
                    <div style="display:flex; flex-wrap:wrap; gap:5px; padding:0 12px 12px 12px;">${imagesHtml}</div>
                ` : ''}
                
                <div style="padding:10px 12px; display:flex; gap:20px; background:rgba(255,255,255,0.02); border-top:1px solid var(--border-glass);">
                    <button class="btn-icon" onclick="likePost(${p.id})" style="color:${isLiked ? '#ef4444' : 'var(--text-secondary)'}; font-size:0.9rem; background:transparent; border:none; cursor:pointer;">
                        <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i> <span>${p.likes?.length || 0}</span>
                    </button>
                    <button class="btn-icon" onclick="openCommentModal(${p.id})" style="font-size:0.9rem; color:var(--text-secondary); background:transparent; border:none; cursor:pointer;">
                        <i class="fa-regular fa-comment"></i> <span>${p.comments?.length || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if(append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html || '<p style="text-align:center; padding:30px; opacity:0.5; font-size:0.9rem;">Nenhuma atividade no feed VIP ainda.</p>';
    }

    if(end < allPosts.length) {
        setupInfiniteScroll();
    }
}

function renderComments() {
    const list = document.getElementById('comment-list');
    if(!list) return;
    
    const posts = LocalDB.get('social_posts');
    const p = posts.find(x => x.id == activeCommentPostId);
    if(!p) return;

    list.innerHTML = (p.comments || []).map(c => `
        <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:8px; border:1px solid var(--border-glass); min-height:60px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; justify-content:center; position:relative;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <strong style="color:var(--brand-yellow); font-size:0.75rem;">${c.user === sessionProject ? 'VOCÊ' : c.user.toUpperCase()}</strong>
                    <small style="opacity:0.3; font-size:0.65rem;">${c.time || ''}</small>
                </div>
                ${c.user === sessionProject ? `<i class="fa-solid fa-trash" style="color:#ef4444; font-size:0.7rem; cursor:pointer; opacity:0.5;" onclick="deleteComment('${c.time}')" title="Apagar"></i>` : ''}
            </div>
            <div style="font-size:0.85rem; color:#fff; white-space: pre-wrap; line-height:1.4;">${c.text}</div>
        </div>
    `).join('') || '<p style="text-align:center; opacity:0.5; font-size:0.8rem; padding:20px;">Nenhuma interação ainda.</p>';
}

function deleteComment(timeId) {
    if(!confirm('Deseja apagar este comentário?')) return;
    const posts = LocalDB.get('social_posts');
    const pIdx = posts.findIndex(x => x.id == activeCommentPostId);
    if(pIdx > -1) {
        posts[pIdx].comments = posts[pIdx].comments.filter(c => c.time !== timeId);
        LocalDB.set('social_posts', posts);
        renderComments();
        renderFeed();
    }
}
window.deleteComment = deleteComment;

function setupInfiniteScroll() {
    if(feedObserver) feedObserver.disconnect();
    
    feedObserver = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting) {
            feedPage++;
            renderFeed(true);
        }
    }, { threshold: 0.1 });

    const lastPost = document.querySelector('#social-feed-list .post-card:last-child');
    if(lastPost) feedObserver.observe(lastPost);
}


function handleMultipleImages(input) {
    if (input.files) {
        const preview = document.getElementById('post-images-preview');
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentPostImages.push(e.target.result);
                const imgWrap = document.createElement('div');
                imgWrap.style.position = 'relative';
                imgWrap.innerHTML = `
                    <img src="${e.target.result}" class="preview-img-item">
                    <button onclick="removePreviewImage(this, '${e.target.result}')" style="position:absolute; top:-5px; right:-5px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:18px; height:18px; font-size:12px; cursor:pointer;">&times;</button>
                `;
                preview.appendChild(imgWrap);
            };
            reader.readAsDataURL(file);
        });
    }
}
window.handleMultipleImages = handleMultipleImages;

function removePreviewImage(btn, src) {
    currentPostImages = currentPostImages.filter(i => i !== src);
    btn.parentElement.remove();
}
window.removePreviewImage = removePreviewImage;

function handlePostSubmit() {
    const textEl = document.getElementById('post-text');
    const text = textEl.value.trim();
    if(!text && currentPostImages.length === 0) return toast('Escreva algo ou adicione fotos!', 'error');

    // Clone images to ensure they are captured correctly
    const finalImages = [...currentPostImages];
    
    const posts = LocalDB.get('social_posts');
    posts.unshift({
        id: Date.now(),
        user: sessionProject,
        text,
        images: finalImages,
        time: new Date().toLocaleString('pt-BR'),
        likes: [],
        comments: []
    });
    LocalDB.set('social_posts', posts);
    
    currentPostImages = [];
    renderFeed();
    toast('Publicado no Feed VIP!');
}
window.handlePostSubmit = handlePostSubmit;

// --- COMMENT SYSTEM ---
function openCommentModal(postId) {
    activeCommentPostId = postId;
    const modal = document.getElementById('modal-comments');
    const list = document.getElementById('comment-list');
    const input = document.getElementById('comment-input');
    
    if(!modal || !list) return;
    
    input.value = ''; // Clean input
    modal.style.display = 'flex';
    renderComments();
}
window.openCommentModal = openCommentModal;

function closeCommentModal() {
    document.getElementById('modal-comments').style.display = 'none';
    document.getElementById('comment-input').value = '';
}
window.closeCommentModal = closeCommentModal;

function renderComments() {
    const list = document.getElementById('comment-list');
    const posts = LocalDB.get('social_posts');
    const post = posts.find(p => p.id === activeCommentPostId);
    if(!post) return;

    list.innerHTML = (post.comments || []).map(c => `
        <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:8px; border:1px solid var(--border-glass); min-height:60px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; justify-content:center; position:relative;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <strong style="color:var(--brand-yellow); font-size:0.75rem;">${c.user === sessionProject ? 'VOCÊ' : c.user.toUpperCase()}</strong>
                    <small style="opacity:0.3; font-size:0.65rem;">${c.time || ''}</small>
                </div>
                ${c.user === sessionProject ? `<i class="fa-solid fa-trash" style="color:#ef4444; font-size:0.7rem; cursor:pointer; opacity:0.5;" onclick="deleteComment('${c.time}')" title="Apagar"></i>` : ''}
            </div>
            <div style="font-size:0.85rem; color:#fff; white-space: pre-wrap; line-height:1.4;">${c.text}</div>
        </div>
    `).join('') || '<p style="text-align:center; opacity:0.4; font-size:0.8rem;">Seja o primeiro a interagir!</p>';
}

function submitComment() {
    const text = document.getElementById('comment-input').value.trim();
    if(!text) return;

    const posts = LocalDB.get('social_posts');
    const idx = posts.findIndex(p => p.id === activeCommentPostId);
    if(idx === -1) return;

    if(!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push({
        user: sessionProject,
        text,
        time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
    });

    LocalDB.set('social_posts', posts);
    document.getElementById('comment-input').value = '';
    renderComments();
    renderFeed();
}
window.submitComment = submitComment;

function addEmoji(emoji) {
    const input = document.getElementById('comment-input');
    if(input) {
        input.value += emoji;
        input.focus();
        if(typeof toggleEmojiPicker === 'function') toggleEmojiPicker();
    }
}
window.addEmoji = addEmoji;

// --- POST OPTIONS ---
function togglePostOptions(event, postId) {
    event.stopPropagation();
    const modal = document.getElementById('modal-post-options');
    const panel = modal.querySelector('.glass-panel');
    
    panel.style.top = (event.clientY + 10) + 'px';
    panel.style.left = (event.clientX - 180) + 'px';
    
    const posts = LocalDB.get('social_posts');
    const post = posts.find(p => p.id === postId);
    
    document.getElementById('opt-delete').style.display = post.user === sessionProject ? 'block' : 'none';
    document.getElementById('opt-edit').style.display = post.user === sessionProject ? 'block' : 'none';
    
    document.getElementById('opt-delete').onclick = () => deletePost(postId);
    
    modal.style.display = 'block';
}
window.togglePostOptions = togglePostOptions;

function deletePost(postId) {
    if(!confirm('Deseja excluir esta publicação?')) return;
    let posts = LocalDB.get('social_posts');
    posts = posts.filter(p => p.id !== postId);
    LocalDB.set('social_posts', posts);
    renderFeed();
    toast('Publicação removida.');
}

// --- FRIENDS & REQUESTS ENGINE ---
function renderFriendsList(filter = '') {
    const container = document.getElementById('friends-list');
    if(!container) return;
    
    const dbUsers = JSON.parse(localStorage.getItem('state_users')) || [];
    const currentUser = sessionProject;
    const requests = LocalDB.get('friend_requests');
    const userObj = dbUsers.find(x => x.u === currentUser) || {};
    const myFriends = userObj.friends || [];

    const badge = document.getElementById('badge-received');
    const receivedCount = requests.filter(r => r.to === currentUser && r.status === 'pending').length;
    if(badge) { badge.innerText = receivedCount; badge.style.display = receivedCount > 0 ? 'inline-block' : 'none'; }

    let list = [];
    if(currentFriendsSubTab === 'all') {
        list = dbUsers.filter(u => u.u !== currentUser && u.u !== 'admin' && (u.name || u.u).toLowerCase().includes(filter.toLowerCase()));
    } else if(currentFriendsSubTab === 'received') {
        list = requests.filter(r => r.to === currentUser && r.status === 'pending').map(r => ({ ...dbUsers.find(u => u.u === r.from), requestId: r.id }));
    } else if(currentFriendsSubTab === 'sent') {
        list = requests.filter(r => r.from === currentUser && r.status === 'pending').map(r => ({ ...dbUsers.find(u => u.u === r.to), requestId: r.id }));
    }

    container.innerHTML = list.map(u => {
        if(!u.u) return '';
        const isFriend = myFriends.includes(u.u);
        const hasSent = requests.some(r => r.from === currentUser && r.to === u.u && r.status === 'pending');
        const hasReceived = requests.some(r => r.from === u.u && r.to === currentUser && r.status === 'pending');

        let actionBtn = '';
        if(currentFriendsSubTab === 'received') {
            actionBtn = `<div style="display:flex; gap:5px;"><button class="btn-royal" onclick="handleFriendRequest(${u.requestId}, 'accept')" style="background:#4ade8022; border-color:#4ade80; color:#4ade80;"><i class="fa-solid fa-check"></i></button><button class="btn-royal" onclick="handleFriendRequest(${u.requestId}, 'refuse')" style="background:#ef444422; border-color:#ef4444; color:#ef4444;"><i class="fa-solid fa-xmark"></i></button></div>`;
        } else if(currentFriendsSubTab === 'sent') {
            const req = requests.find(r => r.from === currentUser && r.to === u.u && r.status === 'pending');
            actionBtn = `<button class="btn-royal" onclick="handleFriendRequest(${req.id}, 'refuse')" style="background:#ef444422; border-color:#ef4444; color:#ef4444; font-size:0.65rem;">CANCELAR</button>`;
        } else if(isFriend) {
            actionBtn = `<span style="color:#4ade80; font-size:0.75rem;"><i class="fa-solid fa-user-check"></i> AMIGO</span>`;
        } else if(hasSent) {
            actionBtn = `<span style="color:var(--text-muted); font-size:0.7rem;">AGUARDANDO...</span>`;
        } else if(hasReceived) {
            actionBtn = `<button class="btn-royal" onclick="switchFriendsSubTab('received')">VER PEDIDO</button>`;
        } else {
            actionBtn = `<button class="btn-royal" onclick="sendFriendRequest('${u.u}')"><i class="fa-solid fa-user-plus"></i></button>`;
        }

        return `<div class="friend-item"><div style="display:flex; align-items:center; gap:12px;"><img src="${u.avatar || '../imgs/logo-state.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--border-glass);"><div><strong style="font-size:0.9rem; color:#fff;">${(u.name || u.u).toUpperCase()}</strong><br><small style="color:var(--brand-yellow); font-size:0.65rem;">${u.isVIP ? 'MEMBRO VIP' : 'MEMBRO PADRÃO'}</small></div></div>${actionBtn}</div>`;
    }).join('') || `<p style="text-align:center; padding:40px; opacity:0.5; font-size:0.85rem;">Vazio em "${currentFriendsSubTab.toUpperCase()}".</p>`;
}

function sendFriendRequest(toUser) {
    const requests = LocalDB.get('friend_requests');
    if(requests.some(r => r.from === sessionProject && r.to === toUser && r.status === 'pending')) return;
    requests.push({ id: Date.now(), from: sessionProject, to: toUser, status: 'pending', time: new Date().toISOString() });
    LocalDB.set('friend_requests', requests);
    toast('Solicitação enviada!');
    renderFriendsList();
}
window.sendFriendRequest = sendFriendRequest;

function handleFriendRequest(reqId, action) {
    const requests = LocalDB.get('friend_requests');
    const idx = requests.findIndex(r => r.id === reqId);
    if(idx === -1) return;

    if(action === 'accept') {
        const req = requests[idx];
        const dbUsers = JSON.parse(localStorage.getItem('state_users')) || [];
        dbUsers.forEach(u => {
            if(u.u === req.from) { u.friends = u.friends || []; if(!u.friends.includes(req.to)) u.friends.push(req.to); }
            if(u.u === req.to) { u.friends = u.friends || []; if(!u.friends.includes(req.from)) u.friends.push(req.from); }
        });
        localStorage.setItem('state_users', JSON.stringify(dbUsers));
        requests.splice(idx, 1);
        toast('Agora vocês são amigos!', 'success');
    } else {
        requests.splice(idx, 1);
        toast('Solicitação removida.');
    }
    LocalDB.set('friend_requests', requests);
    renderFriendsList();
}
window.handleFriendRequest = handleFriendRequest;

function likePost(id) {
    const posts = LocalDB.get('social_posts');
    const idx = posts.findIndex(x => x.id == id);
    if(idx > -1) {
        if(!posts[idx].likes) posts[idx].likes = [];
        const uIdx = posts[idx].likes.indexOf(sessionProject);
        if(uIdx > -1) posts[idx].likes.splice(uIdx, 1);
        else posts[idx].likes.push(sessionProject);
        LocalDB.set('social_posts', posts);
        renderFeed();
    }
}
window.likePost = likePost;

// --- GROUPS ENGINE ---
function renderGroups() {
    const container = document.getElementById('groups-list');
    if(!container) return;
    const groups = LocalDB.get('groups');
    const myGroups = groups.filter(g => g.leader === sessionProject || (g.members && g.members.includes(sessionProject)));
    container.innerHTML = myGroups.map(g => `<div class="glass-panel" style="padding:15px; border-left:3px solid var(--brand-yellow); margin-bottom:10px;"><div style="display:flex; justify-content:space-between; align-items:center;"><strong style="color:var(--brand-yellow); font-family:var(--font-head);">${g.name.toUpperCase()}</strong><span style="font-size:0.65rem; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:10px;">${g.members?.length || 1} MEMBROS</span></div><p style="font-size:0.8rem; margin-top:8px; opacity:0.8; line-height:1.4;">${g.desc || 'Sem descrição definida.'}</p></div>`).join('') || `<div style="text-align:center; padding:30px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px dashed var(--border-glass);"><p style="font-size:0.8rem; opacity:0.5; margin-bottom:15px;">Você ainda não participa de nenhum grupo estratégico.</p><button class="btn-primary btn-sm" onclick="alert('Funcionalidade de criação de grupos em liberação gradual...')">INGRESSAR EM GRUPO</button></div>`;
}

// --- INITIALIZATION ---
function initDashboard() {
    const db = JSON.parse(localStorage.getItem('state_users')) || [];
    const userObj = db.find(x => x.u === sessionProject) || {};
    document.getElementById('dash-client-name').innerText = (userObj.name || sessionProject).toUpperCase();
    
    // Clear Upload Cache on login
    currentPostImages = [];
    const preview = document.getElementById('post-images-preview');
    if(preview) preview.innerHTML = '';

    switchSocialTab('feed');
    switchView('dashboard');
}

// UI Utilities
function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const div = document.createElement('div');
    div.className = 'toast';
    div.style.cssText = `background:#161311; border-left:4px solid ${type === 'success' ? '#4ade80' : '#ef4444'}; padding:12px 20px; color:#fff; margin-bottom:10px; border-radius:4px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-size:0.8rem; z-index:9999; display:flex; align-items:center; gap:10px; animation: slideInUp 0.3s ease;`;
    div.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-xmark'}" style="color:${type === 'success' ? '#4ade80' : '#ef4444'};"></i> ${msg}`;
    container.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 3000);
}

// Friends Sub-Navigation Logic
let currentFriendsSubTab = 'all';
function switchFriendsSubTab(sub) {
    currentFriendsSubTab = sub;
    document.querySelectorAll('.sub-tab-btn').forEach(b => {
        const isTarget = b.getAttribute('onclick').includes(`'${sub}'`);
        b.classList.toggle('active', isTarget);
        b.style.background = isTarget ? 'var(--brand-yellow-glow)' : 'transparent';
        b.style.color = isTarget ? 'var(--brand-yellow)' : '#fff';
    });
    const searchArea = document.getElementById('friends-search-area');
    if(searchArea) searchArea.style.display = (sub === 'all') ? 'block' : 'none';
    renderFriendsList();
}
window.switchFriendsSubTab = switchFriendsSubTab;

function renderInstagramProfile() {
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = users.find(x => x.u === sessionProject);
    const allPosts = LocalDB.get('social_posts');
    const myPosts = allPosts.filter(p => p.user === sessionProject);

    if (u) {
        document.getElementById('insta-avatar').src = u.avatar || '../imgs/logo-state.png';
        document.getElementById('insta-name').innerText = (u.name || sessionProject).toUpperCase();
        document.getElementById('insta-bio-text').innerText = u.bio || 'Expert VIP ClubSTATE System.';
        document.getElementById('insta-posts-count').innerText = myPosts.length;
        
        const grid = document.getElementById('insta-grid-photos');
        grid.innerHTML = myPosts.filter(p => p.images && p.images[0]).map(p => `
            <img src="${p.images[0]}" onclick="switchSocialTab('feed')">
        `).join('') || '<p style="grid-column: span 3; text-align:center; opacity:0.5; padding:40px;">Nenhuma foto publicada.</p>';
    }
}
window.renderInstagramProfile = renderInstagramProfile;

function toggleEmojiPicker() {
    const p = document.getElementById('emoji-picker');
    p.style.display = p.style.display === 'grid' ? 'none' : 'grid';
}
window.toggleEmojiPicker = toggleEmojiPicker;

function toggleVerMais(btn) {
    const content = btn.previousElementSibling;
    if(content.style.webkitLineClamp === 'none') {
        content.style.webkitLineClamp = '5';
        btn.innerText = 'Ver mais';
    } else {
        content.style.webkitLineClamp = 'none';
        btn.innerText = 'Ver menos';
    }
}
window.toggleVerMais = toggleVerMais;
