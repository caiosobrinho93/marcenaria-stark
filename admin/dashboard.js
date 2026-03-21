/**
 * State Console V6.6 - UNIFIED MASTER ENGINE
 * Reconstruído para estabilidade total e correção de erros de sintaxe anteriores.
 */

const DB_PREFIX = 'state_db_';
const DB = {
    _getAll: (key, defaultVal = []) => {
        try {
            const data = localStorage.getItem(DB_PREFIX + key);
            return data ? JSON.parse(data) : defaultVal;
        } catch(e) { console.error("DB Error", e); return defaultVal; }
    },
    get: (key, defaultVal = []) => {
        const all = DB._getAll(key, defaultVal);
        const currentUser = localStorage.getItem('state_current_user');
        if (!currentUser || currentUser === 'admin') return all;
        if (key === 'projects' || key === 'clients') {
            const groups = DB._getAll('groups', []);
            const myGroups = groups.filter(g => g.members.includes(currentUser) || g.leader === currentUser).map(g => g.id);
            return all.filter(x => x.owner === currentUser || !x.owner || (x.groupId && myGroups.includes(x.groupId)));
        }
        if (['finance', 'gallery', 'providers', 'inventory'].includes(key)) {
            return all.filter(x => x.owner === currentUser || !x.owner);
        }
        return all;
    },
    set: (key, val) => localStorage.setItem(DB_PREFIX + key, JSON.stringify(val)),
    checkSession: () => {
        const session = localStorage.getItem('state_admin_session');
        const user = localStorage.getItem('state_current_user');
        if (session !== 'active' || !user) {
            localStorage.removeItem('state_admin_session');
            localStorage.removeItem('state_current_user');
            sessionStorage.removeItem('clubstate_session');
            window.location.href = 'login.html';
        }
    },
    saveItem: (key, id, data) => {
        const all = DB._getAll(key);
        const currentUser = localStorage.getItem('state_current_user') || 'admin';
        if (!id) {
            data.id = Date.now().toString();
            data.owner = currentUser;
            all.push(data);
        } else {
            const idx = all.findIndex(x => x.id === id);
            if (idx > -1) {
                data.owner = all[idx].owner || currentUser;
                all[idx] = data;
            } else {
                data.owner = currentUser;
                all.push(data);
            }
        }
        DB.set(key, all);
    }
};

// --- Utilities ---
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function notify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `background:#161311; border-left:4px solid ${type === 'success' ? '#EAB308' : '#ff4d4d'}; padding:16px 24px; color:#F0EBE1; margin-bottom:10px; border-radius:4px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-size:0.9rem; z-index:9999; animation: slideIn 0.3s ease; transition:0.5s;`;
    toast.innerHTML = `<strong>INFO:</strong> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 4000);
}

function formatBRL(input) {
    let value = input.value.replace(/\D/g, "");
    if(value === "") return;
    value = (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    input.value = value;
}

function parseBRL(value) {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}

// --- Navigation Engine ---
let navLinks, sections;
function switchModule(modId) {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    if(!sections || !navLinks) {
        navLinks = document.querySelectorAll('.nav-link[data-mod]');
        sections = document.querySelectorAll('.module-section');
    }
    
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('mod-' + modId);
    const nav = document.querySelector(`.nav-link[data-mod="${modId}"]`);
    
    if(target) target.classList.add('active');
    if(nav) nav.classList.add('active');

    // Update Topbar
    const span = nav?.querySelector('span');
    if(span && document.getElementById('current-mod-name')) {
        document.getElementById('current-mod-name').innerText = span.innerText.toUpperCase();
    }

    // Module Handlers
    if(modId === 'home') renderDashboardHome();
    if(modId === 'clients') renderClients();
    if(modId === 'projects') renderProjects();
    if(modId === 'inventory') renderInventory();
    if(modId === 'finance') renderFinance();
    if(modId === 'providers') renderProviders();
    if(modId === 'gallery') renderGallery();
    if(modId === 'friends') renderFriends();
    if(modId === 'groups') renderGroups();
    if(modId === 'profile') loadProfile();
    if(modId === 'admsettings') renderAdminSettings();
    if(modId === 'home') renderDashboardHome();

    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.remove('open');
}

function renderDashboardHome() {
    const container = document.getElementById('mod-home');
    if(!container) return;
    container.innerHTML = `
        <h2 class="topbar-title">OPERADOR LOGADO: ${localStorage.getItem('state_current_user')?.toUpperCase()}</h2>
        <div class="card-grid" style="margin-top:20px;">
            <div class="card">
                <h4 style="color:var(--brand-yellow); margin-bottom:15px;"><i class="fa-solid fa-bullhorn"></i> NOVIDADES DO SISTEMA</h4>
                <div style="display:grid; gap:12px;">
                    <div style="padding:10px; border-left:3px solid var(--brand-yellow); background:rgba(255,255,255,0.02);">
                        <strong>V6.7 LANÇADA</strong><br><small>Novo sistema de Gemas e Perfil VIP integrado.</small>
                    </div>
                    <div style="padding:10px; border-left:3px solid #4ade80; background:rgba(255,255,255,0.02);">
                        <strong>SEGURANÇA REFORÇADA</strong><br><small>Sessões agora expiram automaticamente após logout.</small>
                    </div>
                </div>
            </div>
            <div class="card">
                <h4 style="color:var(--brand-yellow); margin-bottom:15px;"><i class="fa-solid fa-chart-line"></i> ATIVIDADE RECENTE</h4>
                <p style="font-size:0.85rem; opacity:0.6;">Acompanhe aqui o progresso dos seus projetos e interações sociais.</p>
            </div>
        </div>
    `;
}

// --- MODAL ENGINE ---
function openModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex';
}
function closeModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
}
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
}

// --- MODULE HANDLERS ---

function renderClients(filter = '') {
    const clients = DB.get('clients');
    const tbody = document.querySelector('#table-clients tbody');
    if(!tbody) return;
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(c => `
        <tr onclick="event.stopPropagation(); openClientDetail('${c.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div class="avatar" style="width:40px; height:40px;">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : c.name[0]}</div>
                    <strong style="color:var(--text-primary);">${c.name}</strong>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderProjects(filter = '') {
    const projects = DB.get('projects');
    const tbody = document.querySelector('#table-projects tbody');
    if(!tbody) return;
    const filtered = projects.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || p.client.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(p => `
        <tr onclick="event.stopPropagation(); openProjectDetail('${p.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:16px">
                    <div style="width:40px; height:40px; background:rgba(255,255,255,0.05); border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${p.images && p.images[0] ? `<img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fa-solid fa-drafting-dot" style="opacity:0.2;"></i>'}
                    </div>
                    <div><strong style="color:var(--brand-yellow);">${p.title}</strong><br><small style="color:var(--text-muted)">${p.client}</small></div>
                </div>
            </td>
        </tr>
    `).join('');
}

    openModal('modal-client-detail');
}

function renderInventory() {
    const items = DB.get('inventory');
    const container = document.getElementById('inventory-list');
    if(!container) return;
    container.innerHTML = items.map(i => `
        <div class="card">
            <div style="height:150px; background:rgba(255,255,255,0.05); overflow:hidden; border-radius:4px; margin-bottom:15px; display:flex; align-items:center; justify-content:center;">
                ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover">` : '<i class="fa-solid fa-box-open" style="font-size:3rem; opacity:0.1"></i>'}
            </div>
            <strong style="color:var(--brand-yellow);">${(i.name || 'Sem nome').toUpperCase()}</strong>
            <p style="font-size:0.8rem; margin:10px 0; opacity:0.6;">QUANTIDADE EM ESTOQUE: ${i.qty || 0}</p>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-primary btn-sm" onclick="editInventory('${i.id}')">EDITAR</button>
            </div>
        </div>
    `).join('') || '<p style="text-align:center; grid-column:1/-1; padding:40px; opacity:0.5;">Nenhum item em estoque.</p>';
}

function renderFinance() {
    const data = DB.get('finance');
    const tbody = document.querySelector('#table-finance tbody');
    if(!tbody) return;
    tbody.innerHTML = data.map(f => `
        <tr>
            <td><strong style="color:${f.type === 'entrada' ? '#4ade80' : '#ef4444'}">${f.type.toUpperCase()}</strong></td>
            <td>${f.desc}</td>
            <td><strong>${f.val}</strong></td>
            <td><small>${f.date}</small></td>
        </tr>
    `).join('');
}

function renderProviders() {
    const provs = DB.get('providers');
    const container = document.getElementById('providers-list');
    if(!container) return;
    container.innerHTML = provs.map(p => `
        <div class="card">
            <strong style="color:var(--brand-yellow);">${p.name.toUpperCase()}</strong>
            <p style="font-size:0.8rem; margin:5px 0; opacity:0.7;">${p.segment}</p>
            <div style="margin-top:15px; display:flex; gap:10px;">
                <button class="btn btn-primary btn-sm" onclick="window.open('https://wa.me/55${p.phone.replace(/\D/g,'')}')"><i class="fa-brands fa-whatsapp"></i></button>
            </div>
        </div>
    `).join('') || '<p style="text-align:center; grid-column:1/-1; padding:40px; opacity:0.5;">Nenhum parceiro cadastrado.</p>';
}

function renderGallery() {
    const gal = DB.get('gallery');
    const container = document.getElementById('gallery-list');
    if(!container) return;
    container.innerHTML = gal.map(g => `
        <div class="card" style="padding:0; overflow:hidden;">
            <img src="${g.photo}" style="width:100%; height:200px; object-fit:cover;">
            <div style="padding:15px;">
                <strong style="color:var(--brand-yellow);">${g.title.toUpperCase()}</strong>
                <p style="font-size:0.75rem; opacity:0.6; margin-top:5px;">${g.sub}</p>
            </div>
        </div>
    `).join('') || '<p style="text-align:center; grid-column:1/-1; padding:40px; opacity:0.5;">Nenhuma foto publicada na web.</p>';
}

function editInventory(id) {
    const items = DB.get('inventory');
    const i = items.find(x => x.id === id);
    if(i) {
        document.getElementById('item-id').value = i.id;
        document.getElementById('item-name').value = i.name;
        document.getElementById('item-qty').value = i.qty;
        switchModule('form-inventory');
    }
}
window.editInventory = editInventory;

function changePass() {
    const newPass = prompt("Digite a nova senha de segurança:");
    if(newPass && newPass.length >= 4) {
        const user = localStorage.getItem('state_current_user');
        let users = JSON.parse(localStorage.getItem('state_users')) || [];
        const idx = users.findIndex(x => x.u === user);
        if(idx > -1) {
            users[idx].p = newPass;
            localStorage.setItem('state_users', JSON.stringify(users));
            notify("Senha alterada com sucesso! Use-a no próximo login.");
        }
    } else if(newPass) {
        notify("Senha muito curta (mínimo 4 caracteres).", "error");
    }
}
window.changePass = changePass;

function likePost(id) {
    const posts = DB._getAll('social_posts', []);
    const idx = posts.findIndex(p => p.id == id);
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    
    if(idx > -1) {
        if(posts[idx].likes.includes(currentUser)) {
            posts[idx].likes = posts[idx].likes.filter(u => u !== currentUser);
        } else {
            posts[idx].likes.push(currentUser);
        }
        DB.set('social_posts', posts);
        renderFeed();
    }
}

// --- SOCIAL FEED ---
function renderFeed() {
    const container = document.getElementById('social-feed-list');
    if(!container) return;
    const posts = DB._getAll('social_posts', []);
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const currentUser = localStorage.getItem('state_current_user') || 'admin';

    container.innerHTML = posts.map(p => {
        const u = users.find(x => x.u === p.user) || { name: p.user };
        return `
            <div class="card" style="padding:0; overflow:hidden;">
                <div style="padding:15px; display:flex; align-items:center; gap:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div class="avatar" style="width:40px; height:40px;">${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%">` : p.user[0].toUpperCase()}</div>
                    <div><span style="font-weight:800; color:var(--brand-yellow);">${(u.name || p.user).toUpperCase()}</span><br><small style="opacity:0.5">${p.time}</small></div>
                </div>
                ${p.text ? `<div style="padding:15px; font-size:0.95rem;">${p.text}</div>` : ''}
                ${p.image ? `<img src="${p.image}" style="width:100%; max-height:400px; object-fit:cover;">` : ''}
                <div style="padding:10px 15px; display:flex; gap:20px;">
                    <button class="btn btn-ghost btn-sm" onclick="likePost(${p.id})"><i class="fa-solid fa-heart" style="color:${p.likes.includes(currentUser) ? '#ef4444' : ''}"></i> ${p.likes.length}</button>
                </div>
            </div>
        `;
    }).join('') || '<p style="text-align:center; padding:40px; color:var(--text-muted);">O mural está vazio.</p>';
}

function handlePostSubmit() {
    const text = document.getElementById('post-text').value.trim();
    const imgContainer = document.getElementById('post-preview-img-container');
    const img = imgContainer.style.display === 'block' ? document.getElementById('post-preview-img').src : null;
    
    if(!text && !img) return notify('Nada para postar.', 'error');
    
    const posts = DB._getAll('social_posts', []);
    posts.unshift({
        id: Date.now(),
        user: localStorage.getItem('state_current_user') || 'admin',
        text,
        image: img,
        time: new Date().toLocaleString(),
        likes: [],
        comments: []
    });
    DB.set('social_posts', posts);
    document.getElementById('post-text').value = '';
    imgContainer.style.display = 'none';
    renderFeed();
    notify('Post publicado!');
}

async function previewPostImage(input) {
    if (input.files[0]) {
        const base = await toBase64(input.files[0]);
        document.getElementById('post-preview-img').src = base;
        document.getElementById('post-preview-img-container').style.display = 'block';
    }
}

// --- ADMIN SETTINGS ---
function renderAdminSettings() {
    const list = document.getElementById('admin-users-list');
    if(!list) return;
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    list.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.u.toUpperCase()}</strong></td>
            <td>${u.name || '-'}</td>
            <td><span class="badge ${u.isVIP ? 'badge-success' : 'badge-ghost'}">${u.isVIP ? 'VIP' : 'PADRÃO'}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="toggleUserVIP('${u.u}')">VIP</button>
                <button class="btn btn-primary btn-sm" style="background:var(--brand-yellow); color:#000;" onclick="addGemsPrompt('${u.u}')"><i class="fa-solid fa-gem"></i> +100</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.u}')">BAN</button>
            </td>
        </tr>
    `).join('');
}

function addGemsPrompt(uname) {
    let users = JSON.parse(localStorage.getItem('state_users')) || [];
    const idx = users.findIndex(x => x.u === uname);
    if(idx > -1) {
        users[idx].gems = (users[idx].gems || 0) + 100;
        localStorage.setItem('state_users', JSON.stringify(users));
        renderAdminSettings();
        notify(`+100 Gemas adicionadas para ${uname}`);
    }
}
window.addGemsPrompt = addGemsPrompt;


function toggleUserVIP(uname) {
    let users = JSON.parse(localStorage.getItem('state_users')) || [];
    const idx = users.findIndex(x => x.u === uname);
    if(idx > -1) {
        users[idx].isVIP = !users[idx].isVIP;
        localStorage.setItem('state_users', JSON.stringify(users));
        renderAdminSettings();
        notify(`VIP status alterado para ${uname}`);
    }
}

// --- Profile & VIP UI ---
function updateTopbarProfile() {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = users.find(x => x.u === currentUser);
    const isVIP = u?.isVIP || currentUser === 'admin';
    
    const greeting = document.getElementById('topbar-greeting');
    if(greeting) greeting.innerHTML = `${isVIP ? '<i class="fa-solid fa-crown" style="color:var(--brand-yellow); margin-right:5px;"></i>' : ''}OPERADOR: <strong>${currentUser.toUpperCase()}</strong>`;
    
    const crown = document.getElementById('crown-vip-btn');
    const upsell = document.getElementById('vip-upsell-tag');
    if(crown) crown.style.opacity = isVIP ? '1' : '0.2';
    if(upsell) upsell.style.display = isVIP ? 'none' : 'block';

    const avatar = document.querySelector('.topbar-right .avatar');
    if(avatar) {
        if(u && u.avatar) {
            avatar.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatar.style.background = 'transparent';
        } else {
            avatar.innerText = currentUser[0].toUpperCase();
            avatar.style.background = 'var(--brand-yellow)';
        }
    }
    
    // Admin Only Visibility
    const adminMenu = document.getElementById('nav-admin-only');
    if(adminMenu) adminMenu.style.display = currentUser === 'admin' ? 'block' : 'none';
}

function loadProfile() {
    const user = localStorage.getItem('state_current_user') || 'admin';
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = users.find(x => x.u === user);
    
    document.getElementById('profile-email').value = user;
    if(u) {
        document.getElementById('profile-name').value = u.name || '';
        document.getElementById('profile-bio').value = u.bio || '';
        document.getElementById('profile-avatar').value = u.avatar || '';
        const display = document.getElementById('profile-avatar-display');
        const placeholder = document.getElementById('profile-avatar-placeholder');
        const previewBox = document.getElementById('avatar-preview-box');
        
        if(u.avatar) {
            display.src = u.avatar;
            display.style.display = 'block';
            placeholder.style.display = 'none';
            if(previewBox) previewBox.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
            display.style.display = 'none';
            placeholder.style.display = 'flex';
            if(previewBox) previewBox.innerText = user[0].toUpperCase();
        }
    }
}

async function handleAvatarUpload(input) {
    if (input.files && input.files[0]) {
        try {
            const base64 = await toBase64(input.files[0]);
            document.getElementById('profile-avatar').value = base64;
            const previewBox = document.getElementById('avatar-preview-box');
            if(previewBox) previewBox.innerHTML = `<img src="${base64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            notify('Imagem carregada! Clique em Salvar Perfil para aplicar.');
        } catch(e) {
            notify('Erro ao processar imagem.', 'error');
        }
    }
}
window.handleAvatarUpload = handleAvatarUpload;

function saveProfile(e) {
    if(e) e.preventDefault();
    const user = localStorage.getItem('state_current_user') || 'admin';
    let users = JSON.parse(localStorage.getItem('state_users')) || [];
    const idx = users.findIndex(x => x.u === user);
    
    if(idx > -1) {
        users[idx].name = document.getElementById('profile-name').value;
        users[idx].bio = document.getElementById('profile-bio').value;
        users[idx].avatar = document.getElementById('profile-avatar').value;
        localStorage.setItem('state_users', JSON.stringify(users));
        updateTopbarProfile();
        notify('Perfil atualizado! Recarregando sistema...');
        setTimeout(() => location.reload(), 1500);
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    DB.checkSession();
    setInterval(DB.checkSession, 5000); // Recurring security check
    updateTopbarProfile();
    switchModule('home');

    // Attach UI Global Events
    const menuToggle = document.getElementById('menu-toggle');
    if(menuToggle) menuToggle.onclick = () => document.getElementById('sidebar').classList.toggle('open');
    
    const notifTrigger = document.getElementById('notifications-trigger');
    const notifDropdown = document.getElementById('notif-dropdown');
    if(notifTrigger) notifTrigger.onclick = () => notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'flex' : 'none';

    // Navigation Links
    navLinks = document.querySelectorAll('.nav-link[data-mod]');
    sections = document.querySelectorAll('.module-section');
    navLinks.forEach(l => {
        l.onclick = () => switchModule(l.dataset.mod);
    });

    // Global Search Attachments
    const sC = document.getElementById('search-clients'); if(sC) sC.oninput = (e) => renderClients(e.target.value);
    const sP = document.getElementById('search-projects'); if(sP) sP.oninput = (e) => renderProjects(e.target.value);

    // Profile Form
    const pF = document.getElementById('profile-form'); 
    if(pF) pF.onsubmit = (e) => { e.preventDefault(); saveProfile(e); };

    // --- FORM SUBMISSIONS (FIXING DASHBOARD RESET) ---
    const clientF = document.getElementById('client-form-el');
    if(clientF) clientF.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('client-id').value,
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            insta: document.getElementById('client-instagram').value,
            photo: document.getElementById('photo-preview').querySelector('img')?.src || ''
        };
        DB.saveItem('clients', data.id, data);
        notify("Cliente salvo!");
        switchModule('clients');
    };

    const projectF = document.getElementById('project-form-el');
    if(projectF) projectF.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('project-id').value,
            title: document.getElementById('project-title').value,
            client: document.getElementById('project-client-select').value,
            status: document.getElementById('project-status').value,
            progress: document.getElementById('project-progress').value
        };
        DB.saveItem('projects', data.id, data);
        notify("Projeto atualizado!");
        switchModule('projects');
    };

    const inventoryF = document.getElementById('inventory-form-el');
    if(inventoryF) inventoryF.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('item-id').value,
            name: document.getElementById('item-name').value,
            qty: document.getElementById('item-qty').value,
            photo: document.getElementById('item-photo-preview').querySelector('img')?.src || ''
        };
        DB.saveItem('inventory', data.id, data);
        notify("Item de estoque salvo!");
        switchModule('inventory');
    };

    const financeF = document.getElementById('finance-form-el');
    if(financeF) financeF.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('trans-id').value,
            type: document.getElementById('trans-type').value,
            val: document.getElementById('trans-val').value,
            desc: document.getElementById('trans-desc').value,
            date: document.getElementById('trans-date').value
        };
        DB.saveItem('finance', data.id, data);
        notify("Lançamento financeiro concluído!");
        switchModule('finance');
    };
    
    renderDashboardHome();
});

// Windows Global Exports
window.switchModule = switchModule;
window.handlePostSubmit = handlePostSubmit;
window.previewPostImage = previewPostImage;
window.toggleUserVIP = toggleUserVIP;
window.formatBRL = formatBRL;
window.openProjectDetail = openProjectDetail;
window.openClientDetail = openClientDetail;
window.likePost = likePost;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveProfile = saveProfile;
window.logout = () => { 
    localStorage.removeItem('state_admin_session'); 
    localStorage.removeItem('state_current_user');
    sessionStorage.removeItem('clubstate_session');
    window.location.href='login.html'; 
};
