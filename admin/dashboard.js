/**
 * State Console V6.9 - FINAL STABILITY REBUILD
 * Reconstruído para corrigir navegação, salvamento de perfil sem reload e acesso ao Club.
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
            const myGroups = groups.filter(g => g.members && g.members.includes(currentUser) || g.leader === currentUser).map(g => g.id);
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

// --- Navigation ---
let navLinks, sections;
function switchModule(modId) {
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

    const span = nav?.querySelector('span');
    if(span && document.getElementById('current-mod-name')) {
        document.getElementById('current-mod-name').innerText = span.innerText.toUpperCase();
    }

    if(modId === 'home') renderDashboardHome();
    if(modId === 'clients') renderClients();
    if(modId === 'projects') renderProjects();
    if(modId === 'inventory') renderInventory();
    if(modId === 'finance') renderFinance();
    if(modId === 'providers') renderProviders();
    if(modId === 'gallery') renderGallery();
    if(modId === 'profile') loadProfile();

    document.getElementById('sidebar')?.classList.remove('open');
}

function renderDashboardHome() {
    const container = document.getElementById('mod-home');
    if(!container) return;
    container.innerHTML = `
        <h2 class="topbar-title">OPERADOR: ${localStorage.getItem('state_current_user')?.toUpperCase()}</h2>
        <div class="card-grid" style="margin-top:20px;">
            <div class="card">
                <h4 style="color:var(--brand-yellow); margin-bottom:15px;"><i class="fa-solid fa-bullhorn"></i> SISTEMA V6.9</h4>
                <div style="display:grid; gap:12px;">
                    <div style="padding:10px; border-left:3px solid var(--brand-yellow); background:rgba(255,255,255,0.02);">
                        <strong>ESTABILIDADE TOTAL</strong><br><small>Navegação e Profile otimizados.</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Modals ---
function openModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex';
}
function closeModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
}

// --- Handlers ---
function renderClients(filter = '') {
    const clients = DB.get('clients');
    const tbody = document.querySelector('#table-clients tbody');
    if(!tbody) return;
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(c => `
        <tr onclick="window.openClientDetail('${c.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div class="avatar" style="width:40px; height:40px;">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : c.name[0]}</div>
                    <strong style="color:var(--text-primary); text-transform:uppercase;">${c.name}</strong>
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
        <tr onclick="window.openProjectDetail('${p.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:16px">
                    <div style="width:40px; height:40px; background:rgba(255,255,255,0.05); border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${(p.images && p.images[0]) ? `<img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fa-solid fa-drafting-dot" style="opacity:0.2;"></i>'}
                    </div>
                    <div><strong style="color:var(--brand-yellow); text-transform:uppercase;">${p.title}</strong><br><small style="color:var(--text-muted)">${p.client}</small></div>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProjectDetail(id) {
    const projects = DB.get('projects');
    const p = projects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('det-project-id').value = p.id;
    document.getElementById('det-project-title').innerText = p.title.toUpperCase();
    document.getElementById('det-project-client').innerText = p.client;
    document.getElementById('det-project-status').innerText = (p.status || 'Em Aberto').toUpperCase();
    document.getElementById('det-project-obs').innerText = p.obs || 'Nenhuma observação.';
    const container = document.getElementById('det-project-images');
    if(container) container.innerHTML = (p.images || []).map(img => `<div class="project-img-card"><img src="${img}" onclick="window.open('${img}')"></div>`).join('');
    openModal('modal-project-detail');
}
window.openProjectDetail = openProjectDetail;

function openClientDetail(id) {
    const clients = DB.get('clients');
    const c = clients.find(x => x.id === id);
    if (!c) return;
    document.getElementById('det-client-id').value = c.id;
    document.getElementById('det-client-name').innerText = c.name.toUpperCase();
    document.getElementById('det-client-phone').innerText = c.phone || 'Não informado';
    document.getElementById('det-client-insta').innerText = c.insta || 'Não informado';
    const photo = document.getElementById('det-client-photo');
    if(photo) { photo.src = c.photo || ''; photo.style.display = c.photo ? 'block' : 'none'; }
    const wa = document.getElementById('btn-wa-client');
    if(wa && c.phone) wa.onclick = () => window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}`);
    openModal('modal-client-detail');
}
window.openClientDetail = openClientDetail;

function deleteProjectFromDetail() {
    if(confirm('Tem certeza que deseja excluir o projeto?')) {
        const id = document.getElementById('det-project-id').value;
        const all = DB._getAll('projects');
        DB.set('projects', all.filter(x => x.id !== id));
        closeModal('modal-project-detail');
        renderProjects();
        notify('Projeto excluído com sucesso.', 'success');
    }
}
window.deleteProjectFromDetail = deleteProjectFromDetail;

function editProjectFromDetail() {
    const id = document.getElementById('det-project-id').value;
    closeModal('modal-project-detail');
    const projects = DB.get('projects');
    const p = projects.find(x => x.id === id);
    if(p) {
        document.getElementById('project-id').value = p.id;
        document.getElementById('project-title').value = p.title;
        document.getElementById('project-status').value = p.status || 'planejamento';
        document.getElementById('project-progress').value = p.progress || 0;
        document.getElementById('project-deadline').value = p.deadline || '';
        switchModule('form-project');
    }
}
window.editProjectFromDetail = editProjectFromDetail;

function deleteClientFromDetail() {
    if(confirm('Tem certeza que deseja excluir o cliente?')) {
        const id = document.getElementById('det-client-id').value;
        const all = DB._getAll('clients');
        DB.set('clients', all.filter(x => x.id !== id));
        closeModal('modal-client-detail');
        renderClients();
        notify('Cliente excluído com sucesso.', 'success');
    }
}
window.deleteClientFromDetail = deleteClientFromDetail;

function editClientFromDetail() {
    const id = document.getElementById('det-client-id').value;
    closeModal('modal-client-detail');
    const clients = DB.get('clients');
    const c = clients.find(x => x.id === id);
    if(c) {
        document.getElementById('client-id').value = c.id;
        document.getElementById('client-name').value = c.name;
        document.getElementById('client-phone').value = c.phone || '';
        document.getElementById('client-instagram').value = c.insta || '';
        document.getElementById('client-address').value = c.address || '';
        switchModule('form-client');
    }
}
window.editClientFromDetail = editClientFromDetail;


function renderInventory() {
    const items = DB.get('inventory');
    const container = document.getElementById('inventory-list');
    if(!container) return;
    container.innerHTML = items.map(i => `
        <div class="card">
            <div style="height:150px; background:rgba(255,255,255,0.05); overflow:hidden; border-radius:4px; margin-bottom:15px; display:flex; align-items:center; justify-content:center;">
                ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover">` : '<i class="fa-solid fa-box-open" style="font-size:3rem; opacity:0.1"></i>'}
            </div>
            <strong style="color:var(--brand-yellow); text-transform:uppercase;">${i.name}</strong>
            <p style="font-size:0.8rem; margin:10px 0; opacity:0.6;">QUANTIDADE: ${i.qty || 0}</p>
        </div>
    `).join('') || '<p style="text-align:center; padding:40px; opacity:0.5; grid-column:1/-1;">Vazio.</p>';
}

function renderFinance() {
    const data = DB.get('finance');
    const tbody = document.querySelector('#table-finance tbody');
    if(!tbody) return;
    tbody.innerHTML = data.map(f => `<tr><td><strong style="color:${f.type === 'entrada' ? '#4ade80' : '#ef4444'}">${f.type.toUpperCase()}</strong></td><td>${f.desc}</td><td><strong>${f.val}</strong></td><td><small>${f.date}</small></td></tr>`).join('');
}

function renderGallery() {
    const data = DB.get('gallery');
    const container = document.getElementById('gallery-list');
    if(!container) return;
    container.innerHTML = data.map(g => `<div class="card" style="padding:0; overflow:hidden;"><img src="${g.photo}" style="width:100%; height:200px; object-fit:cover;"><div style="padding:15px;"><strong style="color:var(--brand-yellow);">${g.title.toUpperCase()}</strong></div></div>`).join('');
}

function updateTopbarProfile() {
    const user = localStorage.getItem('state_current_user') || 'admin';
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = users.find(x => x.u === user);
    
    const greeting = document.getElementById('topbar-greeting');
    if(greeting) greeting.innerHTML = `OPERADOR: <strong>${user.toUpperCase()}</strong>`;
    
    const avatar = document.querySelector('.topbar-right .avatar');
    if(avatar) {
        if(u && u.avatar) {
            avatar.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatar.style.background = 'transparent';
        } else {
            avatar.innerText = user[0].toUpperCase();
            avatar.style.background = 'var(--brand-yellow)';
        }
    }
}

function loadProfile() {
    const user = localStorage.getItem('state_current_user') || 'admin';
    const users = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = users.find(x => x.u === user);
    if(u) {
        document.getElementById('profile-name').value = u.name || '';
        document.getElementById('profile-bio').value = u.bio || '';
        document.getElementById('profile-avatar').value = u.avatar || '';
        const pb = document.getElementById('avatar-preview-box');
        if(u.avatar && pb) pb.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }
}

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
        notify('Perfil Atualizado com Sucesso! (Sem reload)');
    }
}
window.saveProfile = saveProfile;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    DB.checkSession();
    updateTopbarProfile();
    switchModule('home');

    document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    
    navLinks = document.querySelectorAll('.nav-link[data-mod]');
    navLinks.forEach(l => l.onclick = () => switchModule(l.dataset.mod));

    const pF = document.getElementById('profile-form');
    if(pF) pF.onsubmit = (e) => saveProfile(e);

    // Form Inventory Save Fix
    const invF = document.getElementById('inventory-form-el');
    if(invF) {
        invF.onsubmit = (e) => {
            e.preventDefault();
            const data = {
                id: document.getElementById('item-id').value,
                name: document.getElementById('item-name').value,
                qty: document.getElementById('item-qty').value,
                photo: document.getElementById('item-photo-preview')?.querySelector('img')?.src || ''
            };
            DB.saveItem('inventory', data.id, data);
            notify("Material Salvo!");
            switchModule('inventory');
        };
    }
});

// Exports
window.switchModule = switchModule;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = () => { 
    localStorage.removeItem('state_admin_session'); 
    localStorage.removeItem('state_current_user');
    sessionStorage.removeItem('clubstate_session');
    window.location.href='login.html'; 
};
window.goToClub = () => {
    const user = localStorage.getItem('state_current_user');
    if(user) {
        sessionStorage.setItem('clubstate_session', 'active');
        localStorage.setItem('clubstate_bridge_user', user);
        window.location.href='../club/index.html';
    }
};
