/**
 * State Console V6.2 - Professional Refinement
 * Technical Dark UI with Premium Features
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
    }
};

// --- Seed Data Initialization ---
function initSeedData() {
    if (DB.get('clients').length === 0) {
        const seedClients = [
            { id: 'c1', name: 'Ricardo Alberto', phone: '11988887766', instagram: 'https://instagram.com/ricardo_alberto', address: 'Av. Paulista, 1000 - SP', photo: '' },
            { id: 'c2', name: 'Fernanda Lima', phone: '11977776655', instagram: '', address: 'Rua Oscar Freire, 500 - SP', photo: '' }
        ];
        DB.set('clients', seedClients);
    }
    if (DB.get('projects').length === 0) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
        const seedProjects = [
            { id: 'p1', title: 'Cozinha Linear Premium', client: 'Ricardo Alberto', provider: 'Marmoraria Rocha', status: 'producao', progress: 65, deadline: nextWeek, date: new Date().toLocaleDateString() },
            { id: 'p2', title: 'Closet Executive Suite', client: 'Fernanda Lima', provider: '', status: 'planejamento', progress: 20, deadline: '', date: new Date().toLocaleDateString() }
        ];
        DB.set('projects', seedProjects);
    }
    if (DB.get('finance').length === 0) {
        const todayStr = new Date().toLocaleDateString();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 3);
        const seedFinance = [
            { id: 'f1', type: 'income', val: 15000, desc: 'Entrada Projeto Cozinha Ricardo', date: todayStr },
            { id: 'f2', type: 'expense', val: 4200, desc: 'Compra de Ferragens - Blum', date: todayStr },
            { id: 'f3', type: 'expense', val: 850, desc: 'Pagamento Marmoraria (Saldo)', date: futureDate.toLocaleDateString() }
        ];
        DB.set('finance', seedFinance);
    }
    if (DB.get('inventory').length === 0) {
        const seedInv = [
            { id: 'i1', name: 'MDF Grafite Chess 18mm', qty: 12, photo: '' },
            { id: 'i2', name: 'MDF Branco TX 15mm', qty: 25, photo: '' },
            { id: 'i3', name: 'Fita de Borda Grafite', qty: 5, photo: '' }
        ];
        DB.set('inventory', seedInv);
    }
    if (DB.get('providers').length === 0) {
        const seedProviders = [
            { id: 'p1', name: 'Marmoraria Rocha', skill: 'Mármores e Granitos', phone: '11 91234-5678', photo: '' },
            { id: 'p2', name: 'Serralheria Ferro Art', skill: 'Estruturas Metálicas', phone: '11 98765-4321', photo: '' }
        ];
        DB.set('providers', seedProviders);
    }
    if (DB.get('gallery').length === 0) {
        const seedGallery = [
            { id: 'g1', title: 'Cozinha Industrial Grey', sub: 'Finalizado em Janeiro/2026', photo: 'https://images.unsplash.com/photo-1556911227-41cc57297e6b?q=80&w=600&auto=format&fit=crop' },
            { id: 'g2', title: 'Painel Home Minimalista', sub: 'MDF Ripado Nogueira', photo: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=600&auto=format&fit=crop' }
        ];
        DB.set('gallery', seedGallery);
    }
}

// --- System Utilities ---
function notify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `background:#161311; border-left:4px solid ${type === 'success' ? '#EAB308' : '#ff4d4d'}; padding:16px 24px; color:#F0EBE1; margin-bottom:10px; border-radius:4px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-size:0.9rem; z-index:9999; animation: slideIn 0.3s ease;`;
    toast.innerHTML = `<strong>SYSTEM_V6.2:</strong> ${msg}`;
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
    if(value === "") return;
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

function openModal(id) { 
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex'; 
}
function closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }

// --- CALCULATOR ---
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
    document.getElementById('calc-profit').innerText = `Lucro Bruto: ${profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    document.getElementById('calc-adv-result').style.display = 'block';
    DB.log(`Cálculo de Preço: ${final.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
};

// --- MODULE: CLIENTS ---
function renderClients(filter = '') {
    const clients = DB.get('clients');
    const tbody = document.querySelector('#table-clients tbody');
    if(!tbody) return;
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || (c.phone && c.phone.includes(filter)));
    
    tbody.innerHTML = filtered.map(c => `
        <tr onclick="openClientDetail('${c.id}')">
            <td><code style="color:var(--brand-yellow)">#${c.id.slice(-4)}</code></td>
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div class="avatar" style="width:32px; height:32px; font-size:0.75rem">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%">` : c.name[0]}</div>
                    <strong>${c.name}</strong>
                </div>
            </td>
            <td><span style="font-size:0.85rem">${c.phone || '---'}</span></td>
            <td style="text-align:right">
                <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="event.stopPropagation(); editClient('${c.id}')"><i class="fa-solid fa-pen"></i></button>
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
    const waLink = `https://wa.me/${(c.phone || '').replace(/\D/g,'')}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address || '')}`;
    
    content.innerHTML = `
        <span class="modal-close" onclick="closeAllModals()">&times;</span>
        <div style="text-align:center; margin-bottom:25px;">
            <div class="avatar" style="width:100px; height:100px; margin:0 auto 15px; font-size:2.5rem; border-width:4px;">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%">` : c.name[0]}</div>
            <h2 style="font-family:var(--font-head); font-size:1.8rem; color:var(--brand-yellow); text-transform:uppercase;">${c.name}</h2>
            <p style="color:var(--text-muted); font-size:0.75rem; letter-spacing:2px; font-weight:700;">SYSTEM_RECORD_ID_${c.id.slice(-4)}</p>
        </div>
        <div style="display:grid; gap:12px;">
            <a href="${waLink}" target="_blank" class="btn btn-success" style="width:100%;"><i class="fa-brands fa-whatsapp"></i> CONECTAR WHATSAPP</a>
            ${c.instagram ? `<a href="${c.instagram}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-brands fa-instagram"></i> PERFIL INSTAGRAM</a>` : ''}
            <a href="${mapsLink}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-solid fa-location-arrow"></i> ENDEREÇO NO MAPS</a>
            <div style="margin-top:15px; padding:18px; background:rgba(255,255,255,0.03); border:1px solid var(--border);">
                <label style="color:var(--brand-yellow); margin-bottom:5px;">ENDEREÇO TÉCNICO</label>
                <div style="color:var(--text-secondary); font-size:0.9rem;">${c.address || 'Não informado no cadastro'}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('clients', '${c.id}', renderClients); closeAllModals();" style="width:100%; margin-top:20px;">EXCLUIR REGISTRO DEFINITIVAMENTE</button>
        </div>
    `;
    openModal('modal-client-detail');
};

window.editClient = (id) => {
    const c = DB.get('clients').find(x => x.id === id);
    if(!c) return;
    document.getElementById('client-id').value = c.id;
    document.getElementById('client-name').value = c.name;
    document.getElementById('client-phone').value = c.phone || '';
    document.getElementById('client-instagram').value = c.instagram || '';
    document.getElementById('client-address').value = c.address || '';
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
            <td><strong style="font-size:1rem">${p.title}</strong></td>
            <td style="font-size:0.85rem; color:var(--text-secondary)">${p.client}</td>
            <td>
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:6px; font-weight:700">
                    <span style="color:var(--brand-yellow)">${p.status.toUpperCase()}</span>
                    <span>${p.progress}%</span>
                </div>
                <div style="height:6px; background:var(--bg-surface-light); width:100%; border-radius:10px">
                    <div style="height:6px; background:var(--brand-yellow); width:${p.progress}%; border-radius:10px; box-shadow:0 0 5px var(--brand-yellow-glow)"></div>
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
    if(!p) return;
    const content = document.getElementById('project-detail-content');
    if(!content) return;
    const statusMap = { planejamento: 'PLANEJAMENTO', producao: 'EM PRODUÇÃO', montagem: 'EM MONTAGEM', finalizado: 'CONCLUÍDO' };
    
    content.innerHTML = `
        <span class="modal-close" onclick="closeAllModals()">&times;</span>
        <h2 style="font-family:var(--font-head); color:var(--brand-yellow); margin-bottom:25px; border-bottom:1px solid var(--border); padding-bottom:12px;">DADOS DO PROJETO</h2>
        <div style="display:grid; gap:15px;">
            <div style="padding:18px; background:rgba(0,0,0,0.5); border:1px solid var(--border);">
                <label>SISTEMA / INSTALAÇÃO</label>
                <div style="font-size:1.3rem; font-weight:800; color:var(--text-primary);">${p.title}</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div style="padding:12px; border:1px solid var(--border);">
                    <label>CLIENTE_OWNER</label>
                    <div style="font-weight:600; font-size:0.9rem;">${p.client}</div>
                </div>
                <div style="padding:12px; border:1px solid var(--border);">
                    <label>PARCEIRO_SYNC</label>
                    <div style="font-weight:600; font-size:0.9rem;">${p.provider || 'Nenhum'}</div>
                </div>
            </div>
            <div style="padding:20px; border:1px solid var(--border-yellow); text-align:center; background:rgba(234, 179, 8, 0.02);">
                <label>STATUS_ATUAL</label>
                <div style="font-size:1.6rem; color:var(--brand-yellow); font-weight:900; letter-spacing:1px;">${statusMap[p.status] || p.status.toUpperCase()}</div>
                <div style="margin-top:10px; height:8px; background:rgba(255,255,255,0.05); width:100%; border-radius:10px">
                    <div style="height:8px; background:var(--brand-yellow); width:${p.progress}%; border-radius:10px; box-shadow:0 0 10px var(--brand-yellow-glow)"></div>
                </div>
            </div>
            <div style="padding:12px; border:1px solid var(--border);">
                <label>ENTREGA ESTIMADA</label>
                <div style="font-weight:700; color:var(--brand-yellow);">${p.deadline || 'A definir'}</div>
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn btn-primary" style="flex:1" onclick="editProject('${p.id}'); closeAllModals();">EDITAR PROJETO</button>
                <button class="btn btn-danger" onclick="deleteItem('projects', '${p.id}', renderProjects); closeAllModals();"><i class="fa-solid fa-trash"></i></button>
            </div>
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
        mdf3: { name: 'Chapa MDF 3mm', qty: 10 },
        mdf15: { name: 'Chapa MDF 15mm', qty: 10 },
        mdf18: { name: 'Chapa MDF 18mm', qty: 10 },
        fita22: { name: 'Fita 22mm', qty: 5 },
        fita60: { name: 'Fita 60mm', qty: 2 }
    };
    if(map[type]) {
        document.getElementById('item-name').value = map[type].name;
        document.getElementById('item-qty').value = map[type].qty;
        notify(`Padrão técnico carregado.`);
    }
};

function renderInventory(filter = '') {
    const inv = DB.get('inventory');
    const tbody = document.querySelector('#table-inventory tbody');
    if(!tbody) return;
    const filtered = inv.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(i => `
        <tr onclick="openInventoryDetail('${i.id}')">
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div style="width:36px; height:36px; background:rgba(0,0,0,0.5); border:1px solid var(--border)">
                        ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover">` : '<i class="fa-solid fa-layer-group" style="opacity:0.2; margin:8px"></i>'}
                    </div>
                    <strong>${i.name}</strong>
                </div>
            </td>
            <td><strong>${i.qty}</strong> <span style="font-size:0.7rem; color:var(--text-muted)">UNID</span></td>
            <td><span style="color:#4ade80; font-size:0.75rem; font-weight:700">EM_ESTOQUE</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); editItem('${i.id}')"><i class="fa-solid fa-pen"></i></button></td>
        </tr>
    `).join('');
}

window.openInventoryDetail = (id) => {
    const i = DB.get('inventory').find(x => x.id === id);
    if(!i) return;
    const content = document.getElementById('inventory-detail-content');
    content.innerHTML = `
        <span class="modal-close" onclick="closeAllModals()">&times;</span>
        <h2 style="font-family:var(--font-head); color:var(--brand-yellow); margin-bottom:25px; border-bottom:1px solid var(--border); padding-bottom:12px;">DADOS DO MATERIAL</h2>
        <div style="display:grid; gap:20px;">
            <div style="text-align:center;">
                <div style="width:150px; height:150px; background:var(--bg-surface-light); margin:0 auto 15px; border:1px solid var(--border); overflow:hidden;">
                    ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fa-solid fa-box-open" style="font-size:4rem; opacity:0.1; line-height:150px;"></i>'}
                </div>
                <h3 style="font-size:1.5rem; color:var(--text-primary);">${i.name}</h3>
            </div>
            <div style="padding:20px; border:1px solid var(--border-yellow); text-align:center; background:rgba(0,0,0,0.3);">
                <label>SALDO ATUAL</label>
                <div style="font-size:2.5rem; color:var(--brand-yellow); font-weight:900;">${i.qty}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Unidades em depósito</div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-primary" style="flex:1" onclick="editItem('${i.id}'); closeAllModals();">ATUALIZAR ESTOQUE</button>
                <button class="btn btn-danger" onclick="deleteItem('inventory', '${i.id}', renderInventory); closeAllModals();"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
    openModal('modal-inventory-detail');
};

window.editItem = (id) => {
    const i = DB.get('inventory').find(x => x.id === id);
    if(!i) return;
    document.getElementById('item-id').value = i.id;
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
        const val = parseFloat(f.val || 0);
        if(f.type === 'income') total += val; else total -= val;
        return `
            <tr>
                <td style="font-size:0.85rem">${f.date}</td>
                <td style="font-size:0.95rem; font-weight:500;">${f.desc}</td>
                <td style="color:${f.type === 'income' ? 'var(--brand-yellow)' : '#ef4444'}; font-weight:800; font-family:var(--font-mono)">
                    ${f.type === 'income' ? '+' : '-'} ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="deleteItem('finance', '${f.id}', renderFinance)"><i class="fa-solid fa-trash"></i></button></td>
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
                <div class="avatar" style="width:48px; height:48px;">${p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;border-radius:50%">` : p.name[0]}</div>
                <div>
                   <h4 style="font-family:var(--font-head); color:var(--brand-yellow); font-size:1.1rem;">${p.name.toUpperCase()}</h4>
                   <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${p.skill}</span>
                </div>
            </div>
            <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:15px;"><i class="fa-solid fa-phone" style="margin-right:8px; color:var(--brand-yellow)"></i> ${p.phone}</div>
            <div style="display:flex; gap:10px;">
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
    document.getElementById('prov-phone').value = p.phone || '';
    if(p.photo) document.getElementById('prov-photo-preview').innerHTML = `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">`;
    toggleForm('form-provider', true);
};

// --- GALLERY SYNC ---
function renderGallery() {
    const gs = DB.get('gallery');
    const grid = document.getElementById('gallery-list');
    if(!grid) return;
    if(gs.length === 0) {
        grid.innerHTML = '<div class="prod-placeholder" style="grid-column:1/-1">Nenhum projeto exposto na galeria web.</div>';
        return;
    }
    grid.innerHTML = gs.map(g => `
        <div class="card" style="padding:0">
            <img src="${g.photo}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid var(--border);">
            <div style="padding:20px">
                <h5 style="color:var(--brand-yellow); font-family:var(--font-head); font-size:1.1rem; margin-bottom:5px;">${g.title}</h5>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">${g.sub}</p>
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

// --- NOTIFICATIONS & DEADLINES ---
function checkNotifications() {
    const fin = DB.get('finance');
    const projects = DB.get('projects');
    const alerts = [];
    const today = new Date();
    const list = document.getElementById('notifications-list');
    const homeList = document.getElementById('upcoming-deadlines-home');

    // Populate alerts (finance mostly)
    fin.forEach(f => {
        if(!f.date) return;
        const d = new Date(f.date.split('/').reverse().join('-'));
        if(d >= today && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            alerts.push({ msg: `VENCIMENTO: ${f.desc} (${parseFloat(f.val).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})})`, type: f.type });
        }
    });

    if(list) {
        list.innerHTML = alerts.map(a => `<div class="card" style="border-left:4px solid ${a.type === 'expense' ? '#ef4444' : 'var(--brand-yellow)'}; padding:15px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:10px; color:var(--brand-yellow);"></i> ${a.msg}</div>`).join('');
        if(alerts.length === 0) list.innerHTML = '<div class="prod-placeholder">Tudo em dia. Sem alertas financeiros críticos.</div>';
    }

    // Populate Home Deadlines
    if(homeList) {
        const upcoming = projects.filter(p => p.deadline && p.status !== 'finalizado');
        if(upcoming.length === 0) {
            homeList.innerHTML = '<div class="prod-placeholder" style="padding:10px;">Sem prazos próximos.</div>';
        } else {
            homeList.innerHTML = upcoming.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding:10px; border-left:2px solid var(--brand-yellow);">
                    <div style="font-size:0.85rem;">
                        <span style="display:block; font-weight:700;">${p.title}</span>
                        <span style="font-size:0.7rem; color:var(--text-muted);">${p.client}</span>
                    </div>
                    <div style="text-align:right">
                        <span style="display:block; font-family:var(--font-mono); font-size:0.75rem; color:var(--brand-yellow);">${p.deadline}</span>
                        <span style="font-size:0.6rem; color:var(--text-muted);">${p.progress}%</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Global Delete
window.deleteItem = (key, id, callback) => {
    if(confirm('Confirmar exclusão permanente?')) {
        let items = DB.get(key);
        items = items.filter(x => x.id !== id);
        DB.set(key, items);
        callback();
        notify('Registro excluído do banco de dados.');
    }
};

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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initSeedData();
    navLinks = document.querySelectorAll('.nav-link[data-mod]');
    sections = document.querySelectorAll('.module-section');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const logoutBtn = document.getElementById('logout-trigger');

    navLinks.forEach(l => l.onclick = () => switchModule(l.dataset.mod));
    if(menuToggle) menuToggle.onclick = () => sidebar.classList.toggle('open');
    if(logoutBtn) logoutBtn.onclick = () => { localStorage.removeItem('state_admin_session'); window.location.href = 'login.html'; };

    const attachSearch = (id, fn) => { const el = document.getElementById(id); if(el) el.oninput = (e) => fn(e.target.value); };
    attachSearch('search-clients', renderClients);
    attachSearch('search-projects', renderProjects);
    attachSearch('search-inventory', renderInventory);
    attachSearch('search-finance', renderFinance);

    const attachClick = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
    attachClick('btn-add-client-toggle', () => { document.getElementById('client-id').value = ''; document.getElementById('client-form-el').reset(); document.getElementById('photo-preview').innerHTML = '<i class="fa-solid fa-image" style="opacity:0.2"></i>'; toggleForm('form-client', true); });
    attachClick('btn-add-project-toggle', () => { document.getElementById('project-id').value = ''; document.getElementById('project-form-el').reset(); toggleForm('form-project', true); });
    attachClick('btn-add-item-toggle', () => { document.getElementById('item-id').value = ''; document.getElementById('inventory-form-el').reset(); document.getElementById('item-photo-preview').innerHTML = '<i class="fa-solid fa-box"></i>'; toggleForm('form-inventory', true); });
    attachClick('btn-add-trans-toggle', () => { document.getElementById('trans-id').value = ''; document.getElementById('finance-form-el').reset(); toggleForm('form-finance', true); });
    attachClick('btn-add-prov-toggle', () => { document.getElementById('prov-id').value = ''; document.getElementById('provider-form-el').reset(); document.getElementById('prov-photo-preview').innerHTML = '<i class="fa-solid fa-users"></i>'; toggleForm('form-provider', true); });
    attachClick('btn-add-gallery-toggle', () => { document.getElementById('gal-id').value = ''; document.getElementById('gallery-form-el').reset(); toggleForm('form-gallery', true); });

    const attachSubmit = (id, fn) => { const el = document.getElementById(id); if(el) el.onsubmit = fn; };
    attachSubmit('client-form-el', async (e) => { e.preventDefault(); const id = document.getElementById('client-id').value; const clients = DB.get('clients'); const photoInput = document.getElementById('client-photo'); let photo = id ? (clients.find(c => c.id === id)?.photo || '') : ''; if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]); const data = { id: id || Date.now().toString(), name: document.getElementById('client-name').value, phone: document.getElementById('client-phone').value, instagram: document.getElementById('client-instagram').value, address: document.getElementById('client-address').value, photo }; if(id) clients[clients.findIndex(c => c.id === id)] = data; else clients.push(data); DB.set('clients', clients); renderClients(); toggleForm('form-client', false); notify('Registro salvo.'); });
    attachSubmit('project-form-el', (e) => { e.preventDefault(); const id = document.getElementById('project-id').value; const projects = DB.get('projects'); const data = { id: id || Date.now().toString(), title: document.getElementById('project-title').value, client: document.getElementById('project-client-select').value, provider: document.getElementById('project-provider-select').value, status: document.getElementById('project-status').value, progress: parseInt(document.getElementById('project-progress').value || 0), deadline: document.getElementById('project-deadline').value, date: new Date().toLocaleDateString() }; if(id) projects[projects.findIndex(p => p.id === id)] = data; else projects.push(data); DB.set('projects', projects); renderProjects(); toggleForm('form-project', false); notify('Projeto atualizado.'); });
    attachSubmit('inventory-form-el', async (e) => { e.preventDefault(); const id = document.getElementById('item-id').value; const inv = DB.get('inventory'); const photoInput = document.getElementById('item-photo'); let photo = id ? (inv.find(i => i.id === id)?.photo || '') : ''; if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]); const data = { id: id || Date.now().toString(), name: document.getElementById('item-name').value, qty: parseInt(document.getElementById('item-qty').value), photo }; if(id) inv[inv.findIndex(i => i.id === id)] = data; else inv.push(data); DB.set('inventory', inv); renderInventory(); toggleForm('form-inventory', false); notify('Estoque sincronizado.'); });
    attachSubmit('finance-form-el', (e) => { e.preventDefault(); const id = document.getElementById('trans-id').value; const fin = DB.get('finance'); const data = { id: id || Date.now().toString(), type: document.getElementById('trans-type').value, val: parseBRL(document.getElementById('trans-val').value), desc: document.getElementById('trans-desc').value, date: document.getElementById('trans-date').value }; if(id) fin[fin.findIndex(f => f.id === id)] = data; else fin.push(data); DB.set('finance', fin); renderFinance(); toggleForm('form-finance', false); checkNotifications(); notify('Lançamento processado.'); });
    attachSubmit('provider-form-el', async (e) => { e.preventDefault(); const id = document.getElementById('prov-id').value; const ps = DB.get('providers'); const photoInput = document.getElementById('prov-photo'); let photo = id ? (ps.find(p => p.id === id)?.photo || '') : ''; if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]); const data = { id: id || Date.now().toString(), name: document.getElementById('prov-name').value, skill: document.getElementById('prov-skill').value, phone: document.getElementById('prov-phone').value, photo }; if(id) ps[ps.findIndex(p => p.id === id)] = data; else ps.push(data); DB.set('providers', ps); renderProviders(); toggleForm('form-provider', false); notify('Parceiro credenciado.'); });
    attachSubmit('gallery-form-el', async (e) => { e.preventDefault(); const id = document.getElementById('gal-id').value; const gallery = DB.get('gallery'); const fileInput = document.getElementById('gal-file'); let photo = id ? (gallery.find(g => g.id === id)?.photo || '') : ''; if(fileInput && fileInput.files[0]) photo = await toBase64(fileInput.files[0]); const data = { id: id || Date.now().toString(), title: document.getElementById('gal-title').value, sub: document.getElementById('gal-sub').value, photo }; if(id) gallery[gallery.findIndex(g => g.id === id)] = data; else gallery.push(data); DB.set('gallery', gallery); renderGallery(); toggleForm('form-gallery', false); notify('Mídia publicada na web.'); });

    if(typeof flatpickr !== 'undefined') flatpickr(".datepicker", { locale: "pt", theme: "dark", dateFormat: "d/m/Y" });
    renderClients(); renderProjects(); renderInventory(); renderFinance(); renderProviders(); renderGallery(); checkNotifications(); updateStats();
});
