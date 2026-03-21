const LocalDB = {
    get: (key, def = []) => JSON.parse(localStorage.getItem('state_db_' + key)) || def,
    set: (key, val) => localStorage.setItem('state_db_' + key, JSON.stringify(val))
};

// State
let sessionProject = sessionStorage.getItem('clubstate_session') || null;

// Routing
const viewLogin = document.getElementById('view-login');
const viewDashboard = document.getElementById('view-dashboard');

function switchView(view) {
    viewLogin.classList.remove('active');
    viewDashboard.classList.remove('active');
    document.getElementById('view-' + view).classList.add('active');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (sessionProject === 'admin') {
        initDashboard();
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
            sessionStorage.setItem('clubstate_session', validUser.u);
            sessionProject = validUser.u;
            toast(`Conectado ao Hub Corporativo!`, 'success');
            setTimeout(() => {
                initDashboard();
            }, 800);
        } else {
            toast('Credenciais corporativas inválidas.', 'error');
        }
    });
}

function logout() {
    sessionStorage.removeItem('clubstate_session');
    sessionProject = null;
    document.getElementById('login-form').reset();
    switchView('login');
    toast('Sessão encerrada com segurança.', 'success');
}
window.logout = logout;

// Dashboard Hydration
function initDashboard() {
    const projects = LocalDB.get('projects');
    const fin = LocalDB.get('finance');
    
    // Calcula Projetos
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'finalizado').length;
    const progress = totalProjects === 0 ? 0 : Math.round((completedProjects / totalProjects) * 100);

    // Calcula Finanças (Renda)
    const totalRevenue = fin.filter(f => f.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.val||0), 0);

    // Populate Data
    document.getElementById('dash-client-name').innerText = sessionProject ? `Operador: ${sessionProject.toUpperCase()}` : 'Líder Executivo';
    document.getElementById('dash-project-title').innerText = `${completedProjects} obras confirmadas de ${totalProjects}`;
    
    // Status Badge
    document.getElementById('dash-status-badge').innerHTML = `<i class="fa-solid fa-crown"></i> MEMBRO VIP`;
    document.getElementById('dash-status-badge').style.borderColor = 'var(--brand-yellow)';
    document.getElementById('dash-status-badge').style.color = 'var(--brand-yellow)';
    document.getElementById('dash-status-badge').style.background = 'rgba(234, 179, 8, 0.1)';

    // Progress
    document.getElementById('dash-progress-text').innerText = progress + '%';
    const circle = document.getElementById('dash-progress-circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        if (progress === 100) circle.style.stroke = '#4ade80';
    }

    // Benefícios VIP
    document.getElementById('diary-list').innerHTML = `
        <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid var(--border-glass); text-align:center; transition:0.3s; cursor:pointer;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
            <i class="fa-solid fa-bullhorn" style="font-size:1.8rem; color:var(--brand-yellow); margin-bottom:10px;"></i>
            <h4 style="font-size:0.9rem; margin-bottom:5px; color:#fff;">Marketing</h4>
            <p style="font-size:0.75rem; color:var(--text-muted);">Materiais de Venda</p>
        </div>
        <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid var(--border-glass); text-align:center; transition:0.3s; cursor:pointer;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
            <i class="fa-solid fa-boxes-packing" style="font-size:1.8rem; color:var(--brand-yellow); margin-bottom:10px;"></i>
            <h4 style="font-size:0.9rem; margin-bottom:5px; color:#fff;">Fornecedores</h4>
            <p style="font-size:0.75rem; color:var(--text-muted);">Descontos VIP</p>
        </div>
        <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid var(--border-glass); text-align:center; transition:0.3s; cursor:pointer;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
            <i class="fa-solid fa-graduation-cap" style="font-size:1.8rem; color:var(--brand-yellow); margin-bottom:10px;"></i>
            <h4 style="font-size:0.9rem; margin-bottom:5px; color:#fff;">Academy</h4>
            <p style="font-size:0.75rem; color:var(--text-muted);">Treinamentos</p>
        </div>
        <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid var(--border-glass); text-align:center; transition:0.3s; cursor:pointer;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
            <i class="fa-solid fa-chart-line" style="font-size:1.8rem; color:var(--brand-yellow); margin-bottom:10px;"></i>
            <h4 style="font-size:0.9rem; margin-bottom:5px; color:#fff;">Relatórios</h4>
            <p style="font-size:0.75rem; color:var(--text-muted);">Análise Avançada</p>
        </div>
    `;

    // Switch View
    switchView('dashboard');
}

// UI Utilities
function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const div = document.createElement('div');
    div.className = 'toast';
    if(type === 'error') div.style.borderLeft = '4px solid #ef4444';
    else div.style.borderLeft = '4px solid #4ade80';
    
    div.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-xmark'}" style="color:${type === 'success' ? '#4ade80' : '#ef4444'}; margin-right:8px;"></i> ${msg}`;
    container.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 3000);
}
