/**
 * State Console V6.1 - Emergency Patch
 * Fixed missing listeners and logout/auth issues
 */

const DB_PREFIX = 'state_db_';
const DB = {
    get: (key, defaultVal = []) => {
        try {
            const data = localStorage.getItem(DB_PREFIX + key);
            return data ? JSON.parse(data) : defaultVal;
        } catch(e) { console.error("DB Error", e); return defaultVal; }
    },
    set: (key, val) => localStorage.setItem(DB_PREFIX + key, JSON.stringify(val)),
    log: (msg) => {
        const logs = DB.get('logs', []);
        logs.unshift({ time: new Date().toLocaleTimeString(), msg });
        DB.set('logs', logs.slice(0, 50));
        renderLogs();
    }
};

// --- System Utilities ---
function notify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `background:#161311; border-left:4px solid ${type === 'success' ? '#EAB308' : '#ff4d4d'}; padding:16px 24px; color:#F0EBE1; margin-bottom:10px; border-radius:2px; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-size:0.85rem; z-index:9999; position:relative; animation: slideIn 0.3s ease;`;
    toast.innerHTML = `<strong>SYSTEM:</strong> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 4000);
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function previewImage(input, targetId) {
    const preview = document.getElementById(targetId);
    if (preview && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function formatBRL(input) {
    let value = input.value.replace(/\D/g, "");
    value = (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    input.value = value;
}

function parseBRL(value) {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}

function toggleForm(id, show) { 
    const el = document.getElementById(id); 
    if(el) {
        el.style.display = show ? 'block' : 'none'; 
        if(show) window.scrollTo({top:0, behavior:'smooth'}); 
    }
}

// --- Navigation ---
let navLinks, sections;

function switchModule(modId) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const target = document.getElementById('mod-' + modId);
    const link = document.querySelector(`.nav-link[data-mod="${modId}"]`);
    if (target && link) {
        target.classList.add('active');
        link.classList.add('active');
        const span = link.querySelector('span');
        if(span) document.getElementById('current-mod-name').innerText = span.innerText;
    }
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.remove('open');
}

// Modals
function openModal(id) { 
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex'; 
}
function closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }

// --- ADVANCED CALCULATOR ---
window.openPriceModal = () => openModal('modal-calculator');
window.runAdvancedCalc = () => {
    const mat = parseBRL(document.getElementById('calc-material').value);
    const log = parseBRL(document.getElementById('calc-logistics').value);
    const ext = parseBRL(document.getElementById('calc-extras').value);
    const K = parseFloat(document.getElementById('calc-multiplier').value || 1);
    
    const base = mat + log + ext;
    const final = base * K;
    const profit = final - base;

    document.getElementById('calc-final-price').innerText = final.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('calc-profit').innerText = `Margem Bruta Estimada: ${profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    document.getElementById('calc-adv-result').style.display = 'block';
    DB.log(`Cálculo de Engenharia: ${final.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
};

// --- MODULE: CLIENTS ---
function renderClients(filter = '') {
    const clients = DB.get('clients');
    const tbody = document.querySelector('#table-clients tbody');
    if(!tbody) return;
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.phone.includes(filter));
    
    tbody.innerHTML = filtered.map(c => `
        <tr onclick="openClientDetail('${c.id}')">
            <td><code style="color:var(--brand-yellow)">#${c.id.slice(-4)}</code></td>
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div class="avatar" style="width:30px; height:30px; font-size:0.7rem">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%">` : c.name[0]}</div>
                    <strong>${c.name}</strong>
                </div>
            </td>
            <td><span style="font-size:0.8rem">${c.phone}</span></td>
            <td style="text-align:right">
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); editClient('${c.id}')"><i class="fa-solid fa-pen"></i></button>
            </td>
        </tr>
    `).join('');
    updateSelectors();
}

window.openClientDetail = (id) => {
    const c = DB.get('clients').find(x => x.id === id);
    if(!c) return;
    const content = document.getElementById('client-detail-content');
    if(!content) return;
    
    const waLink = `https://wa.me/${c.phone.replace(/\D/g,'')}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
    
    content.innerHTML = `
        <span class="modal-close" onclick="closeAllModals()">&times;</span>
        <div style="text-align:center; margin-bottom:30px;">
            <div class="avatar" style="width:100px; height:100px; margin:0 auto 15px; font-size:2rem; border-width:4px;">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%">` : c.name[0]}</div>
            <h2 style="font-family:var(--font-head); font-size:1.8rem; color:var(--brand-yellow);">${c.name}</h2>
            <p style="color:var(--text-muted); font-size:0.8rem; letter-spacing:1px;">FICHA_CLIENTE_ID_${c.id.slice(-4)}</p>
        </div>
        <div style="display:grid; gap:16px;">
            <a href="${waLink}" target="_blank" class="btn btn-primary" style="width:100%; background:#25D366; color:#fff;"><i class="fa-brands fa-whatsapp"></i> CONECTAR WHATSAPP</a>
            ${c.instagram ? `<a href="${c.instagram}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-brands fa-instagram"></i> VER NO INSTAGRAM</a>` : ''}
            <a href="${mapsLink}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-solid fa-map-location-dot"></i> VER LOCALIZAÇÃO NO MAPS</a>
            <div style="margin-top:20px; padding:20px; background:#000; border:1px solid var(--border);">
                <label>ENDEREÇO TÉCNICO</label>
                <div style="color:var(--text-secondary)">${c.address || 'Não informado'}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('clients', '${c.id}', renderClients); closeAllModals();" style="margin-top:10px; border-color:#ff4d4d; color:#ff4d4d; background:none;">DELETAR REGISTRO</button>
        </div>
    `;
    openModal('modal-client-detail');
};

window.editClient = (id) => {
    const c = DB.get('clients').find(x => x.id === id);
    if(!c) return;
    document.getElementById('client-id').value = c.id;
    document.getElementById('client-name').value = c.name;
    document.getElementById('client-phone').value = c.phone;
    document.getElementById('client-instagram').value = c.instagram || '';
    document.getElementById('client-address').value = c.address;
    if(c.photo) document.getElementById('photo-preview').innerHTML = `<img src="${c.photo}" style="width:100%;height:100%;object-fit:cover">`;
    toggleForm('form-client', true);
};

// --- MODULE: PROJECTS ---
function renderProjects(filter = '') {
    const projects = DB.get('projects');
    const tbody = document.querySelector('#table-projects tbody');
    if(!tbody) return;
    const filtered = projects.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || p.client.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(p => `
        <tr onclick="openProjectDetail('${p.id}')">
            <td><strong>${p.title}</strong></td>
            <td style="font-size:0.8rem; color:var(--text-secondary)">${p.client}</td>
            <td>
                <div style="display:flex; justify-content:space-between; font-size:0.6rem; margin-bottom:4px">
                    <span>${p.status.toUpperCase()}</span>
                    <span>${p.progress}%</span>
                </div>
                <div style="height:4px; background:var(--border); width:100%; border-radius:10px">
                    <div style="height:4px; background:var(--brand-yellow); width:${p.progress}%; border-radius:10px"></div>
                </div>
            </td>
            <td style="text-align:right">
                 <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); editProject('${p.id}')"><i class="fa-solid fa-pen"></i></button>
            </td>
        </tr>
    `).join('');
    updateStats();
}

window.openProjectDetail = (id) => {
    const p = DB.get('projects').find(x => x.id === id);
    const content = document.getElementById('project-detail-content');
    if(!content) return;
    content.innerHTML = `
        <span class="modal-close" onclick="closeAllModals()">&times;</span>
        <h2 style="font-family:var(--font-head); color:var(--brand-yellow); margin-bottom:20px;">DETALHES DO PROJETO</h2>
        <div style="display:grid; gap:20px;">
            <div style="padding:20px; background:#000; border:1px solid var(--border);">
                <label>INSTALAÇÃO / SISTEMA</label>
                <div style="font-size:1.2rem; font-weight:700;">${p.title}</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div style="padding:15px; border:1px solid var(--border);">
                    <label>CLIENTE</label>
                    <div style="font-weight:600;">${p.client}</div>
                </div>
                <div style="padding:15px; border:1px solid var(--border);">
                    <label>PARCEIRO RESPONSÁVEL</label>
                    <div style="font-weight:600;">${p.provider || 'Nenhum'}</div>
                </div>
            </div>
            <div style="padding:15px; border:1px solid var(--border-yellow); text-align:center;">
                <label>STATUS ATUAL</label>
                <div style="font-size:1.5rem; color:var(--brand-yellow); font-weight:800;">${p.status.toUpperCase()} (${p.progress}%)</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('projects', '${p.id}', renderProjects); closeAllModals();">REMOVER PROJETO</button>
        </div>
    `;
    openModal('modal-project-detail');
};

window.editProject = (id) => {
    const p = DB.get('projects').find(x => x.id === id);
    if(!p) return;
    document.getElementById('project-id').value = p.id;
    document.getElementById('project-title').value = p.title;
    document.getElementById('project-client-select').value = p.client;
    document.getElementById('project-provider-select').value = p.provider || '';
    document.getElementById('project-status').value = p.status;
    document.getElementById('project-progress').value = p.progress;
    document.getElementById('project-deadline').value = p.deadline || '';
    toggleForm('form-project', true);
};

// --- MODULE: INVENTORY ---
window.setInvDefaults = (type) => {
    const map = {
        mdf3: { name: 'Chapa MDF 3mm', qty: 10, min: 5 },
        mdf6: { name: 'Chapa MDF 6mm', qty: 10, min: 5 },
        mdf15: { name: 'Chapa MDF 15mm', qty: 10, min: 5 },
        mdf18: { name: 'Chapa MDF 18mm', qty: 10, min: 5 },
        fita22: { name: 'Fita de Borda 22mm (Rolo)', qty: 5, min: 2 },
        fita35: { name: 'Fita de Borda 35mm (Rolo)', qty: 5, min: 1 },
        fita60: { name: 'Fita de Borda 60mm (Rolo)', qty: 2, min: 1 }
    };
    if(map[type]) {
        document.getElementById('item-name').value = map[type].name;
        document.getElementById('item-qty').value = map[type].qty;
        notify(`Carregado padrão: ${map[type].name}`);
    }
};

function renderInventory(filter = '') {
    const inv = DB.get('inventory');
    const tbody = document.querySelector('#table-inventory tbody');
    if(!tbody) return;
    const filtered = inv.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(i => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div style="width:40px; height:40px; background:#000; border:1px solid var(--border)">
                        ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover">` : ''}
                    </div>
                    <strong>${i.name}</strong>
                </div>
            </td>
            <td>${i.qty} UNIDADES</td>
            <td><span style="color:var(--brand-yellow); font-size:0.7rem;">ESTÁVEL</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="editItem('${i.id}')"><i class="fa-solid fa-pen"></i></button></td>
        </tr>
    `).join('');
}

window.editItem = (id) => {
    const i = DB.get('inventory').find(x => x.id === id);
    if(!i) return;
    const mid = document.getElementById('item-id');
    if(mid) mid.value = i.id;
    document.getElementById('item-name').value = i.name;
    document.getElementById('item-qty').value = i.qty;
    toggleForm('form-inventory', true);
};

// --- MODULE: FINANCE ---
function renderFinance(filter = '') {
    const fin = DB.get('finance');
    const tbody = document.querySelector('#table-finance tbody');
    if(!tbody) return;
    const filtered = fin.filter(f => f.desc.toLowerCase().includes(filter.toLowerCase()));
    let total = 0;
    tbody.innerHTML = filtered.map(f => {
        if(f.type === 'income') total += f.val; else total -= f.val;
        return `
            <tr>
                <td style="font-size:0.8rem">${f.date}</td>
                <td>${f.desc}</td>
                <td style="color:${f.type === 'income' ? 'var(--brand-yellow)' : '#ff4d4d'}; font-weight:800">
                    ${f.type === 'income' ? '+' : '-'} ${f.val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td><button class="btn btn-ghost btn-sm" onclick="deleteItem('finance', '${f.id}', renderFinance)"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('');
    const stIn = document.getElementById('st-income');
    if(stIn) stIn.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// --- MODULE: PROVIDERS ---
function renderProviders() {
    const ps = DB.get('providers');
    const grid = document.getElementById('providers-grid');
    if(!grid) return;
    grid.innerHTML = ps.map(p => `
        <div class="card">
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:15px;">
                <div class="avatar" style="width:50px; height:50px;">${p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;border-radius:50%">` : p.name[0]}</div>
                <div>
                   <h4 style="font-family:var(--font-head); color:var(--brand-yellow)">${p.name.toUpperCase()}</h4>
                   <span style="font-size:0.7rem; color:var(--text-muted)">${p.skill}</span>
                </div>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:15px;"><i class="fa-solid fa-phone"></i> ${p.phone}</div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-ghost btn-sm" style="flex:1" onclick="editProvider('${p.id}')">EDITAR</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('providers', '${p.id}', renderProviders)"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    updateSelectors();
}

window.editProvider = (id) => {
    const p = DB.get('providers').find(x => x.id === id);
    if(!p) return;
    document.getElementById('prov-id').value = p.id;
    document.getElementById('prov-name').value = p.name;
    document.getElementById('prov-skill').value = p.skill;
    document.getElementById('prov-phone').value = p.phone;
    if(p.photo) document.getElementById('prov-photo-preview').innerHTML = `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">`;
    toggleForm('form-provider', true);
};

// --- MODULE: GALLERY ---
function renderGallery() {
    const gs = DB.get('gallery');
    const grid = document.getElementById('gallery-list');
    if(!grid) return;
    grid.innerHTML = gs.map(g => `
        <div class="card" style="padding:0">
            <img src="${g.photo}" style="width:100%; height:180px; object-fit:cover">
            <div style="padding:20px">
                <h5 style="color:var(--brand-yellow); font-family:var(--font-head);">${g.title}</h5>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:15px;">${g.sub}</p>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-ghost btn-sm" style="flex:1" onclick="editGallery('${g.id}')">EDITAR</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteItem('gallery', '${g.id}', renderGallery)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

window.editGallery = (id) => {
    const g = DB.get('gallery').find(x => x.id === id);
    if(!g) return;
    document.getElementById('gal-id').value = g.id;
    document.getElementById('gal-title').value = g.title;
    document.getElementById('gal-sub').value = g.sub;
    toggleForm('form-gallery', true);
};

// --- NOTIFICATIONS & LOGS ---
function checkNotifications() {
    const fin = DB.get('finance');
    const ps = DB.get('projects');
    const alerts = [];
    const today = new Date();

    fin.forEach(f => {
        if(!f.date) return;
        const d = new Date(f.date.split('/').reverse().join('-'));
        if(d >= today && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            alerts.push({ msg: `VENCIMENTO PRÓXIMO: ${f.desc} (R$ ${f.val.toLocaleString()})`, type: f.type });
        }
    });

    ps.forEach(p => {
        if(!p.deadline) return;
        const d = new Date(p.deadline.split('/').reverse().join('-'));
        if(d >= today && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            alerts.push({ msg: `POUPUP_ALERTA: Entrega do projeto [${p.title}] em breve!`, type: 'project' });
        }
    });

    const list = document.getElementById('notifications-list');
    if(!list) return;
    list.innerHTML = alerts.map(a => `
        <div class="card" style="border-left:4px solid ${a.type === 'expense' ? '#ff4d4d' : 'var(--brand-yellow)'}; padding:15px;">
           <i class="fa-solid fa-triangle-exclamation" style="margin-right:10px;"></i> ${a.msg}
        </div>
    `).join('');
    if(alerts.length === 0) list.innerHTML = '<div class="prod-placeholder">Tudo em dia. Sem alertas críticos.</div>';
}

function renderLogs() {
    const logs = DB.get('logs');
    const el = document.getElementById('recent-logs');
    if(el) el.innerHTML = logs.map(l => `<div style="margin-bottom:5px;"><span style="color:var(--brand-yellow)">[${l.time}]</span> ${l.msg}</div>`).join('');
}

// Global Delete
window.deleteItem = (key, id, callback) => {
    if(confirm('Confirmar deleção permanente?')) {
        let items = DB.get(key);
        items = items.filter(x => x.id !== id);
        DB.set(key, items);
        callback();
        notify('Excluído do banco de dados.');
    }
};

// Data Sync
function updateStats() {
    const sp = document.getElementById('st-projects');
    const sc = document.getElementById('st-clients');
    if(sp) sp.innerText = DB.get('projects').length;
    if(sc) sc.innerText = DB.get('clients').length;
}

function updateSelectors() {
    const cs = DB.get('clients');
    const ps = DB.get('providers');
    const selC = document.getElementById('project-client-select');
    const selP = document.getElementById('project-provider-select');
    if(selC) selC.innerHTML = '<option value="">SELECIONE UM CLIENTE</option>' + cs.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    if(selP) selP.innerHTML = '<option value="">OPCIONAL: PARCEIRO</option>' + ps.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}

// --- Initialization & Event Binding ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Selector Assignments
    navLinks = document.querySelectorAll('.nav-link[data-mod]');
    sections = document.querySelectorAll('.module-section');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const logoutBtn = document.getElementById('logout-trigger');

    // 2. Navigation
    navLinks.forEach(l => l.onclick = () => switchModule(l.dataset.mod));
    if(menuToggle) menuToggle.onclick = () => sidebar.classList.toggle('open');
    if(logoutBtn) logoutBtn.onclick = () => { localStorage.removeItem('state_admin_session'); window.location.href = 'login.html'; };

    // 3. Search Filters
    const attachSearch = (id, fn) => {
        const el = document.getElementById(id);
        if(el) el.oninput = (e) => fn(e.target.value);
    };
    attachSearch('search-clients', renderClients);
    attachSearch('search-projects', renderProjects);
    attachSearch('search-inventory', renderInventory);
    attachSearch('search-finance', renderFinance);

    // 4. Action Buttons (The missing ones)
    const attachClick = (id, fn) => {
        const el = document.getElementById(id);
        if(el) el.onclick = fn;
    };

    attachClick('btn-add-client-toggle', () => {
        document.getElementById('client-id').value = '';
        document.getElementById('client-form-el').reset();
        document.getElementById('photo-preview').innerHTML = '<i class="fa-solid fa-image" opacity="0.2"></i>';
        toggleForm('form-client', true);
    });

    attachClick('btn-add-project-toggle', () => {
        document.getElementById('project-id').value = '';
        document.getElementById('project-form-el').reset();
        toggleForm('form-project', true);
    });

    attachClick('btn-add-item-toggle', () => {
        document.getElementById('item-id').value = '';
        document.getElementById('inventory-form-el').reset();
        document.getElementById('item-photo-preview').innerHTML = '<i class="fa-solid fa-box"></i>';
        toggleForm('form-inventory', true);
    });

    attachClick('btn-add-trans-toggle', () => {
        document.getElementById('trans-id').value = '';
        document.getElementById('finance-form-el').reset();
        toggleForm('form-finance', true);
    });

    attachClick('btn-add-prov-toggle', () => {
        document.getElementById('prov-id').value = '';
        document.getElementById('provider-form-el').reset();
        document.getElementById('prov-photo-preview').innerHTML = '<i class="fa-solid fa-users"></i>';
        toggleForm('form-provider', true);
    });

    attachClick('btn-add-gallery-toggle', () => {
        document.getElementById('gal-id').value = '';
        document.getElementById('gallery-form-el').reset();
        toggleForm('form-gallery', true);
    });

    // 5. Submit Handlers
    const attachSubmit = (id, fn) => {
        const el = document.getElementById(id);
        if(el) el.onsubmit = fn;
    };

    attachSubmit('client-form-el', async (e) => {
        e.preventDefault();
        const id = document.getElementById('client-id').value;
        const clients = DB.get('clients');
        const photoInput = document.getElementById('client-photo');
        let photo = id ? (clients.find(c => c.id === id)?.photo || '') : '';
        if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);
        const data = { id: id || Date.now().toString(), name: document.getElementById('client-name').value, phone: document.getElementById('client-phone').value, instagram: document.getElementById('client-instagram').value, address: document.getElementById('client-address').value, photo };
        if(id) clients[clients.findIndex(c => c.id === id)] = data; else clients.push(data);
        DB.set('clients', clients); renderClients(); toggleForm('form-client', false); notify('Cliente salvo.');
    });

    attachSubmit('project-form-el', (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const projects = DB.get('projects');
        const data = { id: id || Date.now().toString(), title: document.getElementById('project-title').value, client: document.getElementById('project-client-select').value, provider: document.getElementById('project-provider-select').value, status: document.getElementById('project-status').value, progress: parseInt(document.getElementById('project-progress').value || 0), deadline: document.getElementById('project-deadline').value, date: new Date().toLocaleDateString() };
        if(id) projects[projects.findIndex(p => p.id === id)] = data; else projects.push(data);
        DB.set('projects', projects); renderProjects(); toggleForm('form-project', false); notify('Projeto atualizado.');
    });

    attachSubmit('inventory-form-el', async (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const inv = DB.get('inventory');
        const photoInput = document.getElementById('item-photo');
        let photo = id ? (inv.find(i => i.id === id)?.photo || '') : '';
        if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);
        const data = { id: id || Date.now().toString(), name: document.getElementById('item-name').value, qty: parseInt(document.getElementById('item-qty').value), photo };
        if(id) inv[inv.findIndex(i => i.id === id)] = data; else inv.push(data);
        DB.set('inventory', inv); renderInventory(); toggleForm('form-inventory', false); notify('Estoque atualizado.');
    });

    attachSubmit('finance-form-el', (e) => {
        e.preventDefault();
        const id = document.getElementById('trans-id').value;
        const fin = DB.get('finance');
        const data = { id: id || Date.now().toString(), type: document.getElementById('trans-type').value, val: parseBRL(document.getElementById('trans-val').value), desc: document.getElementById('trans-desc').value, date: document.getElementById('trans-date').value };
        if(id) fin[fin.findIndex(f => f.id === id)] = data; else fin.push(data);
        DB.set('finance', fin); renderFinance(); toggleForm('form-finance', false); checkNotifications(); notify('Lançamento realizado.');
    });

    attachSubmit('provider-form-el', async (e) => {
        e.preventDefault();
        const id = document.getElementById('prov-id').value;
        const ps = DB.get('providers');
        const photoInput = document.getElementById('prov-photo');
        let photo = id ? (ps.find(p => p.id === id)?.photo || '') : '';
        if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);
        const data = { id: id || Date.now().toString(), name: document.getElementById('prov-name').value, skill: document.getElementById('prov-skill').value, phone: document.getElementById('prov-phone').value, photo };
        if(id) ps[ps.findIndex(p => p.id === id)] = data; else ps.push(data);
        DB.set('providers', ps); renderProviders(); toggleForm('form-provider', false); notify('Parceiro salvo.');
    });

    attachSubmit('gallery-form-el', async (e) => {
        e.preventDefault();
        const id = document.getElementById('gal-id').value;
        const gallery = DB.get('gallery');
        const fileInput = document.getElementById('gal-file');
        let photo = id ? (gallery.find(g => g.id === id)?.photo || '') : '';
        if(fileInput && fileInput.files[0]) photo = await toBase64(fileInput.files[0]);
        const data = { id: id || Date.now().toString(), title: document.getElementById('gal-title').value, sub: document.getElementById('gal-sub').value, photo };
        if(id) gallery[gallery.findIndex(g => g.id === id)] = data; else gallery.push(data);
        DB.set('gallery', gallery); renderGallery(); toggleForm('form-gallery', false); notify('Galeria atualizada.');
    });

    // 6. Final Initialization
    if(typeof flatpickr !== 'undefined') flatpickr(".datepicker", { locale: "pt", theme: "dark" });
    renderClients(); renderProjects(); renderInventory(); renderFinance(); renderProviders(); renderGallery(); renderLogs(); checkNotifications(); updateStats();
    DB.log("SYSTEM_EMERGENCY_PATCH_V6.1_ACTIVE");
});
