/**
 * State Console V6.3 - Professional Business Management
 * Traditional Professional UI with Multi-Media & Team Collaboration
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
            { id: 'p1', title: 'Cozinha Linear Premium', client: 'Ricardo Alberto', provider: 'Marmoraria Rocha', status: 'producao', progress: 65, deadline: nextWeek, date: new Date().toLocaleDateString(), images: [], comments: [{user:'Admin', text:'Material entregue na obra.', date: new Date().toLocaleString()}] },
            { id: 'p2', title: 'Closet Executive Suite', client: 'Fernanda Lima', provider: '', status: 'planejamento', progress: 20, deadline: '', date: new Date().toLocaleDateString(), images: [], comments: [] }
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
    const currentGallery = DB.get('gallery');
    const defaultIds = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
    const hasDefaults = defaultIds.every(id => currentGallery.some(item => item.id === id));
    
    if (!hasDefaults) {
        const seedGallery = [
            { id: 'g1', title: 'Cozinha Gourmet', sub: 'Linha Titanium', photo: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200' },
            { id: 'g2', title: 'Living Integrado', sub: 'Iluminação Smart LED', photo: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800' },
            { id: 'g3', title: 'Dormitório Casal', sub: 'Closet Elegance', photo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800' },
            { id: 'g4', title: 'Home Theater', sub: 'Integração Alexa', photo: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1400' },
            { id: 'g5', title: 'Escritório Executivo', sub: 'Design Corporativo', photo: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800' },
            { id: 'g6', title: 'Painel Acústico', sub: 'Módulos Fonoabsorventes', photo: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=800' }
        ];
        // Combine keeping existing user images but ensuring all defaults are present
        const combined = [...currentGallery];
        seedGallery.forEach(s => {
            if (!combined.some(c => c.id === s.id)) combined.push(s);
        });
        DB.set('gallery', combined);
    }
}

// --- System Utilities ---
function notify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `background:#161311; border-left:4px solid ${type === 'success' ? '#EAB308' : '#ff4d4d'}; padding:16px 24px; color:#F0EBE1; margin-bottom:10px; border-radius:4px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-size:0.9rem; z-index:9999; animation: slideIn 0.3s ease;`;
    toast.innerHTML = `<strong>INFO:</strong> ${msg}`;
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
    // ID mapping for legacy compatibility
    const modalMap = {
        'form-client': 'modal-client-form',
        'form-project': 'modal-project-form',
        'form-inventory': 'modal-inventory-form',
        'form-finance': 'modal-finance-form',
        'form-provider': 'modal-provider-form',
        'form-gallery': 'modal-gallery-form'
    };
    const targetId = modalMap[id] || id;
    if (show) openModal(targetId);
    else closeModal(targetId);
}

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

// --- Navigation ---
let navLinks, sections;

function switchModule(modId) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const target = document.getElementById('mod-' + modId);
    const link = document.querySelector(`.nav-link[data-mod="${modId}"]`);
    if (target) {
        target.classList.add('active');
    }
    if (link) {
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

// --- MODULE: CLIENTS ---
function renderClients(filter = '') {
    const clients = DB.get('clients');
    const tbody = document.querySelector('#table-clients tbody');
    if(!tbody) return;
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || (c.phone && c.phone.includes(filter)));
    tbody.innerHTML = filtered.map(c => `
        <tr onclick="openClientDetail('${c.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:12px">
                    <div class="avatar" style="width:40px; height:40px; flex-shrink:0;">
                        ${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : c.name[0]}
                    </div>
                    <div style="display:flex; flex-direction:column;">
                        <strong style="color:var(--text-primary); font-size:1.1rem;">${c.name}</strong>
                    </div>
                </div>
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
        <div style="text-align:center; padding: 30px; margin-bottom:25px;">
            <div class="avatar" style="width:120px; height:120px; margin:0 auto 15px; font-size:3rem; border-width:4px;">${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : c.name[0]}</div>
            <h2 style="font-family:var(--font-head); font-size:2rem; color:var(--brand-yellow); text-transform:uppercase;">${c.name}</h2>
            <p style="color:var(--text-muted); font-size:0.85rem; letter-spacing:2px; font-weight:700;">REGISTRO ID ${c.id.slice(-4)}</p>
        </div>
        <div style="display:grid; gap:15px; padding: 0 30px 30px 30px;">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-primary" onclick="editClient('${c.id}')" style="flex:1;">EDITAR CLIENTE</button>
                <a href="${waLink}" target="_blank" class="btn btn-success" style="flex:1;"><i class="fa-brands fa-whatsapp"></i> WHATSAPP</a>
            </div>
            ${c.instagram ? `<a href="${c.instagram}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-brands fa-instagram"></i> PERFIL INSTAGRAM</a>` : ''}
            <a href="${mapsLink}" target="_blank" class="btn btn-ghost" style="width:100%;"><i class="fa-solid fa-location-arrow"></i> VER LOCALIZAÇÃO</a>
            <div style="margin-top:15px; padding:18px; background:rgba(255,255,255,0.03); border:1px solid var(--border);">
                <label style="color:var(--brand-yellow); margin-bottom:5px;">ENDEREÇO CADASTRADO</label>
                <div style="color:var(--text-secondary); font-size:0.9rem;">${c.address || 'Não informado'}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('clients', '${c.id}', () => { renderClients(); switchModule('clients'); });" style="width:100%; margin-top:20px;">EXCLUIR CLIENTE</button>
        </div>
    `;
    switchModule('client-detail');
};

window.editClient = (id) => {
    const c = DB.get('clients').find(x => x.id === id);
    if(!c) return;
    document.getElementById('client-id').value = c.id;
    document.getElementById('client-name').value = c.name;
    document.getElementById('client-phone').value = c.phone || '';
    document.getElementById('client-instagram').value = c.instagram || '';
    document.getElementById('client-address').value = c.address || '';
    if(c.photo) document.getElementById('client-photo-preview').innerHTML = `<img src="${c.photo}" style="width:100%;height:100%;object-fit:cover">`;
    switchModule('form-client');
};

// --- MODULE: PROJECTS ---
function renderProjects(filter = '') {
    const projects = DB.get('projects');
    const tbody = document.querySelector('#table-projects tbody');
    if(!tbody) return;
    const filtered = projects.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || p.client.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(p => `
        <tr onclick="openProjectDetail('${p.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:16px">
                    <div style="width:48px; height:48px; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${p.images && p.images[0] ? `<img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '<i class="fa-solid fa-drafting-dot" style="opacity:0.2; font-size:1.5rem;"></i>'}
                    </div>
                    <div style="display:flex; flex-direction:column;">
                        <strong style="color:var(--brand-yellow); text-transform:uppercase; font-size:1.1rem;">${p.title}</strong>
                        <span style="color:var(--text-muted); font-size:0.85rem;">Cliente: ${p.client}</span>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
    updateStats();
}

window.openProjectDetail = (id) => {
    const p = DB.get('projects').find(x => x.id === id);
    if(!p) return;
    const content = document.getElementById('project-view-content');
    const statusMap = { planejamento: 'PLANEJAMENTO', producao: 'EM PRODUÇÃO', montagem: 'EM MONTAGEM', finalizado: 'CONCLUÍDO' };
    
    // Project Media HTML
    const imagesHtml = (p.images || []).map(img => `<img src="${img}" style="width:100px; height:100px; object-fit:cover; border:1px solid var(--border); border-radius:4px;">`).join('');
    // Project Comments HTML
    const commentsHtml = (p.comments || []).map(c => `
        <div style="padding:10px; background:rgba(255,255,255,0.03); border-left:2px solid var(--brand-yellow); margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;">
                <span>${c.user}</span><span>${c.date}</span>
            </div>
            <div style="font-size:0.85rem;">${c.text}</div>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:30px;">
            <div>
                <h2 style="font-family:var(--font-head); color:var(--brand-yellow); margin-bottom:20px;">DETALHES DO PROJETO</h2>
                <div style="display:grid; gap:15px;">
                    <div style="padding:15px; border:1px solid var(--border);">
                        <label>PROJETO</label>
                        <div style="font-size:1.2rem; font-weight:800; color:var(--text-primary);">${p.title}</div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div style="padding:10px; border:1px solid var(--border);">
                            <label>CLIENTE</label>
                            <div style="font-weight:600; font-size:0.85rem;">${p.client}</div>
                        </div>
                        <div style="padding:10px; border:1px solid var(--border);">
                            <label>PARCEIRO</label>
                            <div style="font-weight:600; font-size:0.85rem;">${p.provider || 'Nenhum'}</div>
                        </div>
                    </div>
                    <div style="padding:15px; border:1px solid var(--border-yellow); text-align:center;">
                        <label>STATUS ATUAL</label>
                        <div style="font-size:1.4rem; color:var(--brand-yellow); font-weight:900;">${statusMap[p.status] || p.status.toUpperCase()}</div>
                    </div>
                    <div style="padding:10px; border:1px solid var(--border);">
                        <label>PRAZO DE ENTREGA</label>
                        <div style="font-weight:700; color:var(--brand-yellow);">${p.deadline || 'A definir'}</div>
                    </div>
                </div>
            </div>
            
            <div style="border-left:1px solid var(--border); padding-left:30px;">
                <h3 style="font-family:var(--font-head); font-size:1rem; margin-bottom:15px;">MÍDIA E ARQUIVOS</h3>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
                    ${imagesHtml || '<div style="opacity:0.3; font-size:0.8rem;">Nenhuma imagem anexada.</div>'}
                </div>
                <div class="group">
                    <label>ANEXAR NOVA IMAGEM</label>
                    <input type="file" id="project-media-upload" accept="image/*" onchange="addProjectMedia('${p.id}', this)">
                </div>

                <h3 style="font-family:var(--font-head); font-size:1rem; margin-top:30px; margin-bottom:15px;">COMENTÁRIOS DA EQUIPE</h3>
                <div id="project-comments-list" style="max-height:200px; overflow-y:auto; margin-bottom:15px;">
                    ${commentsHtml || '<div style="opacity:0.3; font-size:0.8rem;">Sem comentários registrados.</div>'}
                </div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="new-comment-text" placeholder="Escreva um comentário..." style="flex:1">
                    <button class="btn btn-primary btn-sm" onclick="addProjectComment('${p.id}')">POSTAR</button>
                </div>
            </div>
        </div>
        <div style="display:flex; gap:10px; margin-top:30px; border-top:1px solid var(--border); padding-top:20px;">
            <button class="btn btn-ghost" style="flex:1" onclick="editProject('${p.id}');">EDITAR CONFIGURAÇÕES</button>
            <button class="btn btn-danger" onclick="deleteItem('projects', '${p.id}', () => { renderProjects(); switchModule('projects'); });"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    switchModule('project-view');
};

window.addProjectMedia = async (id, input) => {
    if(!input.files[0]) return;
    const projects = DB.get('projects');
    const pIdx = projects.findIndex(x => x.id === id);
    if(pIdx === -1) return;
    const base64 = await toBase64(input.files[0]);
    if(!projects[pIdx].images) projects[pIdx].images = [];
    projects[pIdx].images.push(base64);
    DB.set('projects', projects);
    openProjectDetail(id);
    notify('Imagem anexada ao projeto.');
};

window.addProjectComment = (id) => {
    const text = document.getElementById('new-comment-text').value;
    if(!text) return;
    const projects = DB.get('projects');
    const pIdx = projects.findIndex(x => x.id === id);
    if(pIdx === -1) return;
    if(!projects[pIdx].comments) projects[pIdx].comments = [];
    projects[pIdx].comments.push({ user: 'Equipe', text, date: new Date().toLocaleString() });
    DB.set('projects', projects);
    openProjectDetail(id);
    notify('Comentário registrado.');
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
    switchModule('form-project');
};

// --- MODULE: INVENTORY ---
function renderInventory(filter = '') {
    const inv = DB.get('inventory');
    const tbody = document.querySelector('#table-inventory tbody');
    if(!tbody) return;
    const filtered = inv.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
    tbody.innerHTML = filtered.map(i => `
        <tr onclick="openInventoryDetail('${i.id}')" style="cursor:pointer;">
            <td>
                <div style="display:flex; align-items:center; gap:16px">
                    <div style="width:48px; height:48px; background:rgba(0,0,0,0.5); border:1px solid var(--border); overflow:hidden; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                        ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : '<i class="fa-solid fa-box" style="opacity:0.2; font-size:1.5rem;"></i>'}
                    </div>
                    <div style="display:flex; flex-direction:column;">
                        <strong style="color:var(--text-primary); font-size:1.1rem;">${i.name}</strong>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

window.openInventoryDetail = (id) => {
    const i = DB.get('inventory').find(x => x.id === id);
    if(!i) return;
    const content = document.getElementById('inventory-detail-content');
    content.innerHTML = `
        <h2 style="font-family:var(--font-head); color:var(--brand-yellow); text-align:center; margin-bottom:25px;">DADOS DO MATERIAL</h2>
        <div style="display:grid; gap:20px; padding: 0 30px 30px 30px;">
            <div style="text-align:center;">
                <div style="width:180px; height:180px; background:var(--bg-surface-light); margin:0 auto 15px; border:1px solid var(--border); overflow:hidden;">
                    ${i.photo ? `<img src="${i.photo}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fa-solid fa-box-open" style="font-size:4rem; opacity:0.1; line-height:180px;"></i>'}
                </div>
                <h3 style="font-size:1.8rem; color:var(--text-primary); text-transform:uppercase;">${i.name}</h3>
            </div>
            <div style="padding:30px; border:1px solid var(--border-yellow); text-align:center; background:rgba(0,0,0,0.3);">
                <label>SALDO ATUAL</label>
                <div style="font-size:3.5rem; color:var(--brand-yellow); font-weight:900;">${i.qty}</div>
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn btn-primary" style="flex:1; padding:15px;" onclick="editItem('${i.id}');">EDITAR SALDO</button>
                <button class="btn btn-danger" style="padding:15px;" onclick="deleteItem('inventory', '${i.id}', () => { renderInventory(); switchModule('inventory'); });"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
    switchModule('inventory-detail');
};

window.editItem = (id) => {
    const i = DB.get('inventory').find(x => x.id === id);
    if(!i) return;
    document.getElementById('item-id').value = i.id;
    document.getElementById('item-name').value = i.name;
    document.getElementById('item-qty').value = i.qty;
    switchModule('form-inventory');
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
            <tr onclick="editFinance('${f.id}')" style="cursor:pointer;">
                <td style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column;">
                        <div style="font-size:1.1rem; font-weight:600; color:var(--text-primary);">${f.desc}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i> ${f.date}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="color:${f.type === 'income' ? 'var(--brand-yellow)' : '#ef4444'}; font-weight:800; font-family:var(--font-mono); font-size:1.1rem; text-align:right;">
                            ${f.type === 'income' ? '+' : '-'} ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); deleteItem('finance', '${f.id}', renderFinance)"><i class="fa-solid fa-trash" style="color:#ef4444"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    const stIn = document.getElementById('st-income');
    if(stIn) stIn.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

window.editFinance = (id) => {
    const f = DB.get('finance').find(x => x.id === id);
    if(!f) return;
    document.getElementById('trans-id').value = f.id;
    document.getElementById('trans-type').value = f.type;
    document.getElementById('trans-val').value = parseFloat(f.val).toLocaleString('pt-BR', {minimumFractionDigits: 2});
    document.getElementById('trans-desc').value = f.desc;
    document.getElementById('trans-date').value = f.date;
    switchModule('form-finance');
};

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
                   <h4 style="font-family:var(--font-head); color:var(--brand-yellow); font-size:1.1rem;">${p.name}</h4>
                   <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${p.skill}</span>
                </div>
            </div>
            <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:15px;"><i class="fa-solid fa-phone" style="margin-right:8px; color:var(--brand-yellow)"></i> ${p.phone}</div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-ghost btn-sm" style="flex:1" onclick="editProvider('${p.id}')">EDITAR PARCEIRO</button>
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
    document.getElementById('prov-skill').value = p.skill || '';
    document.getElementById('prov-phone').value = p.phone || '';
    if(p.photo) document.getElementById('prov-photo-preview').innerHTML = `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">`;
    switchModule('form-provider');
};

// --- GALLERY MODULE ---
function renderGallery() {
    const gs = DB.get('gallery');
    const grid = document.getElementById('gallery-list');
    if(!grid) return;
    grid.innerHTML = gs.map(g => `
        <div class="card" style="padding:0; box-shadow:none;">
            <img src="${g.photo}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid var(--border);">
            <div style="padding:15px">
                <h5 style="color:var(--brand-yellow); font-family:var(--font-head); font-size:0.9rem; margin-bottom:5px; text-transform:uppercase;">${g.title}</h5>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:15px; height:2.4em; overflow:hidden;">${g.sub}</p>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-ghost" style="flex:1; padding:8px; font-size:0.7rem;" onclick="editGallery('${g.id}')">EDITAR</button>
                    <button class="btn btn-danger" style="flex:1; padding:8px; font-size:0.7rem;" onclick="deleteGalleryItem('${g.id}')"><i class="fa-solid fa-trash-can"></i></button>
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
    document.getElementById('gallery-form-title').innerText = 'EDITAR ARTE/FOTO';
    switchModule('form-gallery');
};

window.deleteGalleryItem = (id) => {
    if(confirm('Excluir imagem do portfólio?')) {
        let gs = DB.get('gallery');
        gs = gs.filter(x => String(x.id).trim() !== String(id).trim());
        DB.set('gallery', gs);
        renderGallery();
        notify('Imagem removida.');
    }
};

// --- NOTIFICATIONS & ALERTS ---
window.clearNotifications = () => {
    DB.set('dismissed_alerts', DB.get('finance').map(f => f.id).concat(DB.get('projects').map(p => p.id)));
    renderNotifications();
    notify('Avisos limpos.');
};

function renderNotifications() {
    const fin = DB.get('finance');
    const projects = DB.get('projects');
    const dismissed = DB.get('dismissed_alerts', []);
    const alerts = [];
    const today = new Date();
    const list = document.getElementById('notifications-list');
    const homeList = document.getElementById('upcoming-deadlines-home');

    fin.forEach(f => {
        if(dismissed.includes(f.id)) return;
        const d = new Date(f.date.split('/').reverse().join('-'));
        if(d >= today && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            alerts.push({ msg: `VENCIMENTO: ${f.desc} (${parseFloat(f.val).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})})`, type: f.type });
        }
    });

    if(list) {
        list.innerHTML = alerts.map(a => `<div style="border-bottom:1px solid var(--border); padding:10px 5px; font-size:0.8rem; border-left:3px solid ${a.type === 'expense' ? '#ef4444' : 'var(--brand-yellow)'}; margin-bottom:5px;">${a.msg}</div>`).join('');
        if(alerts.length === 0) list.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted); font-size:0.8rem;">Sem notificações.</div>';
    }
    const badge = document.getElementById('notif-badge');
    if(badge) {
        if(alerts.length > 0) { badge.style.display = 'flex'; badge.innerText = alerts.length; }
        else { badge.style.display = 'none'; }
    }

    if(homeList) {
        const upcoming = projects.filter(p => p.deadline && p.status !== 'finalizado');
        homeList.innerHTML = upcoming.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding:10px; border-left:2px solid var(--brand-yellow);">
                <div style="font-size:0.85rem;"><strong>${p.title}</strong><br><span style="font-size:0.7rem;">${p.client}</span></div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--brand-yellow);">${p.deadline}</div>
                    <button class="btn btn-success btn-sm" onclick="finishProject('${p.id}')">CONCLUIR OBRA</button>
                </div>
            </div>
        `).join('') || '<div class="prod-placeholder">Sem entregas confirmadas.</div>';
    }
}

window.finishProject = (id) => {
    if(!confirm('Deseja marcar esta obra como concluída antecipadamente?')) return;
    const projects = DB.get('projects');
    const pIdx = projects.findIndex(p => p.id === id);
    if(pIdx > -1) {
        projects[pIdx].status = 'finalizado';
        projects[pIdx].progress = 100;
        DB.set('projects', projects);
        renderProjects();
        renderNotifications();
        notify('Obra concluída e movida para o histórico!', 'success');
    }
};

window.openPriceModal = () => {
    document.getElementById('calc-material').value = '';
    document.getElementById('calc-logistics').value = '';
    document.getElementById('calc-extras').value = '';
    document.getElementById('calc-adv-result').style.display = 'none';
    openModal('modal-calculator');
};

window.runAdvancedCalc = () => {
    const mat = parseBRL(document.getElementById('calc-material').value || '0');
    const log = parseBRL(document.getElementById('calc-logistics').value || '0');
    const ext = parseBRL(document.getElementById('calc-extras').value || '0');
    const mult = parseFloat(document.getElementById('calc-multiplier').value || '2.7');
    
    if (mat === 0) {
        notify('Atenção: Insira o custo de material base.', 'error');
        return;
    }
    
    const cost = mat + log + ext;
    const finalPrice = cost * mult;
    const profit = finalPrice - cost;
    
    document.getElementById('calc-final-price').innerText = finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('calc-profit').innerHTML = `LUCRO BRUTO ESTIMADO: <strong style="color:#4ade80;">${profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>`;
    document.getElementById('calc-adv-result').style.display = 'block';
};

// Global Helpers
window.deleteItem = (key, id, callback) => {
    if(confirm('Confirmar exclusão deste registro?')) {
        let items = DB.get(key);
        items = items.filter(x => String(x.id).trim() !== String(id).trim());
        DB.set(key, items);
        if(callback) callback();
        notify('Registro removido com sucesso.');
    }
};

function updateStats() {
    const projects = DB.get('projects');
    const clients = DB.get('clients');
    const finance = DB.get('finance');
    const inventory = DB.get('inventory');
    const dismissed = DB.get('dismissed_alerts', []);
    const today = new Date();

    const totalIncome = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + parseFloat(f.val || 0), 0);
    const lowStock = inventory.filter(i => i.qty < 5);
    const upcomingFin = finance.filter(f => {
        if(dismissed.includes(f.id)) return false;
        const d = new Date(f.date.split('/').reverse().join('-'));
        return d >= today && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const elProjects = document.getElementById('st-projects');
    const elClients = document.getElementById('st-clients');
    const elIncome = document.getElementById('st-income');
    const elAlerts = document.getElementById('st-alerts');

    if(elProjects) elProjects.innerText = projects.length;
    if(elClients) elClients.innerText = clients.length;
    if(elIncome) elIncome.innerText = totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if(elAlerts) elAlerts.innerText = lowStock.length + upcomingFin.length;
}

function updateSelectors() {
    const cs = DB.get('clients');
    const ps = DB.get('providers');
    const selC = document.getElementById('project-client-select');
    const selP = document.getElementById('project-provider-select');
    if(selC) selC.innerHTML = '<option value="">CLIENTE</option>' + cs.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    if(selP) selP.innerHTML = '<option value="">PARCEIRO</option>' + ps.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}

// --- FORM SUBMISSION HANDLERS ---
async function handleClientSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const clients = DB.get('clients');
    const photoInput = document.getElementById('client-photo');
    let photo = id ? (clients.find(c => c.id === id)?.photo || '') : '';
    if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);
    
    const data = { 
        id: id || Date.now().toString(), 
        name: document.getElementById('client-name').value, 
        phone: document.getElementById('client-phone').value, 
        instagram: document.getElementById('client-instagram').value, 
        address: document.getElementById('client-address').value, 
        photo 
    };

    if(id) clients[clients.findIndex(c => c.id === id)] = data;
    else clients.push(data);
    
    DB.set('clients', clients);
    renderClients();
    switchModule('clients');
    notify('Cliente salvo com sucesso.');
}

function handleProjectSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const projects = DB.get('projects');
    const existing = id ? projects.find(x => x.id === id) : null;

    const data = { 
        id: id || Date.now().toString(), 
        title: document.getElementById('project-title').value, 
        client: document.getElementById('project-client-select').value, 
        provider: document.getElementById('project-provider-select').value, 
        status: document.getElementById('project-status').value, 
        progress: parseInt(document.getElementById('project-progress').value || 0), 
        deadline: document.getElementById('project-deadline').value, 
        date: existing ? existing.date : new Date().toLocaleDateString(),
        images: existing ? (existing.images || []) : [], 
        comments: existing ? (existing.comments || []) : [] 
    };

    if(id) projects[projects.findIndex(p => p.id === id)] = data;
    else projects.push(data);

    DB.set('projects', projects);
    renderProjects();
    switchModule('projects');
    notify('Projeto atualizado.');
}

async function handleInventorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const inv = DB.get('inventory');
    const photoInput = document.getElementById('item-photo');
    let photo = id ? (inv.find(i => i.id === id)?.photo || '') : '';
    if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);

    const data = { 
        id: id || Date.now().toString(), 
        name: document.getElementById('item-name').value, 
        qty: parseInt(document.getElementById('item-qty').value), 
        photo 
    };

    if(id) inv[inv.findIndex(i => i.id === id)] = data;
    else inv.push(data);

    DB.set('inventory', inv);
    renderInventory();
    switchModule('inventory');
    notify('Estoque atualizado.');
}

function handleFinanceSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('trans-id').value;
    const fin = DB.get('finance');
    const data = { 
        id: id || Date.now().toString(), 
        type: document.getElementById('trans-type').value, 
        val: parseBRL(document.getElementById('trans-val').value), 
        desc: document.getElementById('trans-desc').value, 
        date: document.getElementById('trans-date').value 
    };

    if(id) fin[fin.findIndex(f => f.id === id)] = data;
    else fin.push(data);

    DB.set('finance', fin);
    renderFinance();
    renderNotifications();
    switchModule('finance');
    notify('Lançamento realizado.');
}

async function handleProviderSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('prov-id').value;
    const ps = DB.get('providers');
    const photoInput = document.getElementById('prov-photo');
    let photo = id ? (ps.find(p => p.id === id)?.photo || '') : '';
    if(photoInput.files[0]) photo = await toBase64(photoInput.files[0]);

    const data = { 
        id: id || Date.now().toString(), 
        name: document.getElementById('prov-name').value, 
        skill: document.getElementById('prov-skill').value, 
        phone: document.getElementById('prov-phone').value, 
        photo 
    };

    if(id) ps[ps.findIndex(p => p.id === id)] = data;
    else ps.push(data);

    DB.set('providers', ps);
    renderProviders();
    switchModule('providers');
    notify('Parceiro salvo.');
}

async function handleGallerySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('gal-id').value;
    const gallery = DB.get('gallery');
    const fileInput = document.getElementById('gal-file');
    let photo = id ? (gallery.find(g => g.id === id)?.photo || '') : '';
    if(fileInput && fileInput.files[0]) photo = await toBase64(fileInput.files[0]);

    const data = { 
        id: id || Date.now().toString(), 
        title: document.getElementById('gal-title').value, 
        sub: document.getElementById('gal-sub').value, 
        photo 
    };

    if(id) gallery[gallery.findIndex(g => g.id === id)] = data;
    else gallery.push(data);

    DB.set('gallery', gallery);
    renderGallery();
    switchModule('gallery');
    notify('Imagem publicada na web.');
}

// --- Initialization ---
function updateHomeGreeting() {
    const title = document.getElementById('home-greeting-title');
    const dateEl = document.getElementById('home-greeting-date');
    if(!title || !dateEl) return;
    const hr = new Date().getHours();
    let msg = 'BOM DIA';
    if(hr >= 12 && hr < 18) msg = 'BOA TARDE';
    else if(hr >= 18) msg = 'BOA NOITE';
    title.innerText = `${msg}, ADMIN`;
    const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const d = new Date();
    dateEl.innerText = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`.toUpperCase();
}

document.addEventListener('DOMContentLoaded', () => {
    initSeedData();
    updateHomeGreeting();
    
    // Notifications Dropdown Toggle
    const notifTrigger = document.getElementById('notifications-trigger');
    const notifDropdown = document.getElementById('notif-dropdown');
    if(notifTrigger && notifDropdown) {
        notifTrigger.addEventListener('click', (e) => {
            if(e.target.closest('#notif-dropdown') && !e.target.closest('.btn-ghost')) return;
            notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'flex' : 'none';
        });
        document.addEventListener('click', (e) => {
            if(!notifTrigger.contains(e.target)) notifDropdown.style.display = 'none';
        });
    }
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

    const attachSubmit = (id, fn) => { const el = document.getElementById(id); if(el) el.onsubmit = fn; };
    attachSubmit('client-form-el', handleClientSubmit);
    attachSubmit('project-form-el', handleProjectSubmit);
    attachSubmit('inventory-form-el', handleInventorySubmit);
    attachSubmit('finance-form-el', handleFinanceSubmit);
    attachSubmit('provider-form-el', handleProviderSubmit);
    attachSubmit('gallery-form-el', handleGallerySubmit);

    const attachClick = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
    attachClick('btn-add-client-toggle', () => { 
        document.getElementById('client-id').value = ''; 
        document.getElementById('client-form-el').reset(); 
        document.getElementById('client-form-title').innerText = 'NOVO CADASTRO DE CLIENTE';
        openModal('modal-client-form'); 
    });
    attachClick('btn-add-project-toggle', () => { 
        document.getElementById('project-id').value = ''; 
        document.getElementById('project-form-el').reset(); 
        document.getElementById('project-form-title').innerText = 'CONFIGURAR NOVO PROJETO';
        openModal('modal-project-form'); 
    });
    attachClick('btn-add-item-toggle', () => { 
        document.getElementById('item-id').value = ''; 
        document.getElementById('inventory-form-el').reset(); 
        document.getElementById('inventory-form-title').innerText = 'ADICIONAR ITEM AO ESTOQUE';
        openModal('modal-inventory-form'); 
    });
    attachClick('btn-add-trans-toggle', () => { 
        document.getElementById('trans-id').value = ''; 
        document.getElementById('finance-form-el').reset(); 
        document.getElementById('finance-form-title').innerText = 'REGISTRAR NOVA MOVIMENTAÇÃO';
        openModal('modal-finance-form'); 
    });
    attachClick('btn-add-prov-toggle', () => { 
        document.getElementById('prov-id').value = ''; 
        document.getElementById('provider-form-el').reset(); 
        document.getElementById('provider-form-title').innerText = 'CADASTRAR NOVO PARCEIRO';
        openModal('modal-provider-form'); 
    });
    attachClick('btn-add-gallery-toggle', () => { 
        document.getElementById('gal-id').value = ''; 
        document.getElementById('gallery-form-el').reset(); 
        document.getElementById('gallery-form-title').innerText = 'PUBLICAR NOVO PROJETO NO PORTFÓLIO';
        openModal('modal-gallery-form'); 
    });

    if(typeof flatpickr !== 'undefined') flatpickr(".datepicker", { locale: "pt", theme: "dark", dateFormat: "d/m/Y" });
    
    renderClients(); renderProjects(); renderInventory(); renderFinance(); renderProviders(); renderGallery(); renderNotifications(); updateStats();
});
