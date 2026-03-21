import re

with open('c:/Users/caio/Documents/Antigravity/site-marcenaria/admin/dashboard.js', 'r', encoding='utf-8') as f:
    js = f.read()

social_logic = """
// --- SOCIAL SYSTEM: FRIENDS ---
function getFriendsData(user) {
    const db = JSON.parse(localStorage.getItem('state_users')) || [];
    const u = db.find(x => x.u === user);
    return {
        friends: u?.friends || [],
        reqIn: u?.friendRequestsIn || [],
        reqOut: u?.friendRequestsOut || []
    };
}

function updateFriendsInDB(user, data) {
    let db = JSON.parse(localStorage.getItem('state_users')) || [];
    const idx = db.findIndex(x => x.u === user);
    if(idx > -1) {
        db[idx] = { ...db[idx], ...data };
        localStorage.setItem('state_users', JSON.stringify(db));
    }
}

window.renderFriends = () => {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const data = getFriendsData(currentUser);
    const db = JSON.parse(localStorage.getItem('state_users')) || [];

    const reqList = document.getElementById('friends-requests-list');
    const fList = document.getElementById('friends-list');

    // Render Requests
    reqList.innerHTML = data.reqIn.map(reqU => {
        const uInfo = db.find(x => x.u === reqU);
        return `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 20px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar" style="width:30px; height:30px; font-size:0.8rem;">${uInfo?.avatar ? `<img src="${uInfo.avatar}" style="width:100%;height:100%;border-radius:50%">` : reqU[0].toUpperCase()}</div>
                    <span><strong>${(uInfo?.name || reqU).toUpperCase()}</strong> quer ser seu parceiro</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-success btn-sm" onclick="acceptFriend('${reqU}')">ACEITAR</button>
                    <button class="btn btn-ghost btn-sm" onclick="rejectFriend('${reqU}')">RECUSAR</button>
                </div>
            </div>
        `;
    }).join('') || '<p style="color:var(--text-muted); font-size:0.8rem;">Nenhuma solicitação nova.</p>';

    // Render Friends
    fList.innerHTML = data.friends.map(fU => {
        const uInfo = db.find(x => x.u === fU);
        return `
            <div class="card" style="text-align:center; padding:20px;">
                <div class="avatar" style="width:60px; height:60px; margin:0 auto 10px; font-size:1.5rem;">${uInfo?.avatar ? `<img src="${uInfo.avatar}" style="width:100%;height:100%;border-radius:50%">` : fU[0].toUpperCase()}</div>
                <h5 style="color:var(--brand-yellow); margin-bottom:5px;">${(uInfo?.name || fU).toUpperCase()}</h5>
                <button class="btn btn-danger btn-sm" style="width:100%;" onclick="removeFriend('${fU}')">REMOVER</button>
            </div>
        `;
    }).join('') || '<p style="color:var(--text-muted); font-size:0.8rem; grid-column:1/-1; text-align:center;">Você ainda não tem amigos na rede.</p>';
    
    // Update profile count if active
    const countEl = document.getElementById('profile-friends-count');
    if(countEl) countEl.innerText = data.friends.length;
};

window.renderGlobalSearch = (val) => {
    if(!val || val.length < 2) { document.getElementById('global-search-results').innerHTML = ''; return; }
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const db = JSON.parse(localStorage.getItem('state_users')) || [];
    const myData = getFriendsData(currentUser);
    
    const results = db.filter(u => u.u !== currentUser && (u.u.toLowerCase().includes(val.toLowerCase()) || (u.name && u.name.toLowerCase().includes(val.toLowerCase()))));
    
    document.getElementById('global-search-results').innerHTML = results.map(u => {
        const isFriend = myData.friends.includes(u.u);
        const isSent = myData.reqOut.includes(u.u);
        const hasReq = myData.reqIn.includes(u.u);

        let btn = `<button class="btn btn-primary btn-sm" onclick="sendFriendRequest('${u.u}')">ADICIONAR</button>`;
        if(isFriend) btn = `<span style="color:var(--brand-yellow); font-size:0.7rem; font-weight:700;">JÁ É AMIGO</span>`;
        else if(isSent) btn = `<span style="color:var(--text-muted); font-size:0.7rem;">CONVITE ENVIADO</span>`;
        else if(hasReq) btn = `<button class="btn btn-success btn-sm" onclick="acceptFriend('${u.u}')">ACEITAR CONVITE</button>`;

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar" style="width:35px; height:35px;">${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%">` : u.u[0].toUpperCase()}</div>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.9rem; font-weight:700;">${(u.name || u.u).toUpperCase()}</span>
                        <span style="font-size:0.7rem; color:var(--text-muted);">${u.u}</span>
                    </div>
                </div>
                ${btn}
            </div>
        `;
    }).join('') || '<p style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum usuário encontrado.</p>';
};

window.sendFriendRequest = (targetU) => {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    let me = getFriendsData(currentUser);
    let target = getFriendsData(targetU);

    if(!me.reqOut.includes(targetU)) me.reqOut.push(targetU);
    if(!target.reqIn.includes(currentUser)) target.reqIn.push(currentUser);

    updateFriendsInDB(currentUser, { friendRequestsOut: me.reqOut });
    updateFriendsInDB(targetU, { friendRequestsIn: target.reqIn });
    
    notify(`Convite enviado para ${targetU}`);
    renderGlobalSearch(document.getElementById('search-global-users').value);
    renderFriends();
};

window.acceptFriend = (targetU) => {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    let me = getFriendsData(currentUser);
    let target = getFriendsData(targetU);

    me.reqIn = me.reqIn.filter(x => x !== targetU);
    target.reqOut = target.reqOut.filter(x => x !== currentUser);

    if(!me.friends.includes(targetU)) me.friends.push(targetU);
    if(!target.friends.includes(currentUser)) target.friends.push(currentUser);

    updateFriendsInDB(currentUser, { friendRequestsIn: me.reqIn, friends: me.friends });
    updateFriendsInDB(targetU, { friendRequestsOut: target.reqOut, friends: target.friends });

    notify(`Agora você é parceiro de ${targetU}!`);
    renderFriends();
};

window.removeFriend = (targetU) => {
    if(!confirm('Deseja remover este parceiro da sua rede?')) return;
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    let me = getFriendsData(currentUser);
    let target = getFriendsData(targetU);

    me.friends = me.friends.filter(x => x !== targetU);
    target.friends = target.friends.filter(x => x !== currentUser);

    updateFriendsInDB(currentUser, { friends: me.friends });
    updateFriendsInDB(targetU, { friends: target.friends });
    renderFriends();
};

// --- SOCIAL SYSTEM: GROUPS ---
window.renderGroups = () => {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const allGroups = DB._getAll('groups', []);
    const myGroups = allGroups.filter(g => g.leader === currentUser || g.members.includes(currentUser));
    
    document.getElementById('groups-list').innerHTML = myGroups.map(g => `
        <div class="card" onclick="openGroupDetail('${g.id}')" style="cursor:pointer; transition:0.3s; position:relative;">
            <div style="position:absolute; top:10px; right:10px; font-size:0.7rem; color:var(--brand-yellow); font-weight:800;">
                ${g.leader === currentUser ? 'LÍDER' : 'MEMBRO'}
            </div>
            <h3 style="font-family:var(--font-head); color:var(--text-primary); margin-bottom:10px;">${g.name.toUpperCase()}</h3>
            <div style="display:flex; gap:10px; font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">
                <span><i class="fa-solid fa-users"></i> ${g.members.length + 1} integrantes</span>
                <span><i class="fa-solid fa-image"></i> ${g.images?.length || 0} fotos</span>
            </div>
            <button class="btn btn-ghost btn-sm" style="width:100%;">ENTRAR NO GRUPO</button>
        </div>
    `).join('') || '<div style="grid-column:1/-1; text-align:center; padding:40px; border:1px dashed var(--border); color:var(--text-muted);">Você não participa de nenhum grupo colaborativo.</div>';
};

let currentGroupId = null;
window.openGroupDetail = (id) => {
    currentGroupId = id;
    const groups = DB._getAll('groups');
    const g = groups.find(x => x.id === id);
    if(!g) return;

    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const isLeader = g.leader === currentUser;

    document.getElementById('group-detail-name').innerText = g.name.toUpperCase();
    document.getElementById('leader-only-upload').style.display = isLeader ? 'block' : 'none';
    document.getElementById('leader-only-invite').style.display = isLeader ? 'block' : 'none';

    // Messages
    const msgList = document.getElementById('group-messages');
    msgList.innerHTML = (g.messages || []).map(m => `
        <div style="margin-bottom:12px; padding:10px; background:${m.user === currentUser ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.02)'}; border-left:2px solid ${m.user === currentUser ? 'var(--brand-yellow)' : 'var(--border)'};">
            <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-muted); margin-bottom:4px;">
                <strong>${m.user.toUpperCase()}</strong><span>${m.time}</span>
            </div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">${m.text}</div>
        </div>
    `).join('') || '<p style="color:var(--text-muted); font-size:0.75rem; text-align:center;">Nenhuma mensagem ainda contextuelizada.</p>';
    msgList.scrollTop = msgList.scrollHeight;

    // Gallery
    document.getElementById('group-gallery').innerHTML = (g.images || []).map(img => `
        <img src="${img}" style="width:100%; height:100px; object-fit:cover; border-radius:4px; cursor:zoom-in;" onclick="window.open('${img}')">
    `).join('') || '<div style="grid-column:1/-1; opacity:0.2; font-size:0.7rem; text-align:center; padding:20px;">Sem fotos.</div>';

    // Members
    const db = JSON.parse(localStorage.getItem('state_users')) || [];
    const leaderInfo = db.find(x => x.u === g.leader);
    let membersHTML = `
        <div style="display:flex; align-items:center; gap:10px; padding:8px; background:rgba(234,179,8,0.1); border:1px solid var(--brand-yellow);">
            <div class="avatar" style="width:25px; height:25px;">${leaderInfo?.avatar ? `<img src="${leaderInfo.avatar}" style="width:100%;height:100%;border-radius:50%">` : g.leader[0].toUpperCase()}</div>
            <span style="font-size:0.8rem; font-weight:800; color:var(--brand-yellow);">${(leaderInfo?.name || g.leader).toUpperCase()} (LÍDER)</span>
        </div>
    `;
    membersHTML += g.members.map(mU => {
        const uInfo = db.find(x => x.u === mU);
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar" style="width:25px; height:25px;">${uInfo?.avatar ? `<img src="${uInfo.avatar}" style="width:100%;height:100%;border-radius:50%">` : mU[0].toUpperCase()}</div>
                    <span style="font-size:0.8rem;">${(uInfo?.name || mU).toUpperCase()}</span>
                </div>
                ${isLeader ? `<button class="btn btn-danger btn-sm" style="padding:2px 6px; font-size:0.6rem;" onclick="removeFromGroup('${mU}')">REMOVER</button>` : ''}
            </div>
        `;
    }).join('');
    document.getElementById('group-members-list').innerHTML = membersHTML;

    switchModule('group-detail');
};

document.getElementById('btn-send-group-msg').onclick = () => {
    const input = document.getElementById('group-msg-input');
    const text = input.value.trim();
    if(!text || !currentGroupId) return;

    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    let groups = DB._getAll('groups');
    const idx = groups.findIndex(x => x.id === currentGroupId);
    if(idx > -1) {
        if(!groups[idx].messages) groups[idx].messages = [];
        groups[idx].messages.push({ user: currentUser, text, time: new Date().toLocaleTimeString() });
        DB.set('groups', groups);
        input.value = '';
        openGroupDetail(currentGroupId);
    }
};

window.handleGroupPhoto = async (input) => {
    if(!input.files[0] || !currentGroupId) return;
    const base64 = await toBase64(input.files[0]);
    let groups = DB._getAll('groups');
    const idx = groups.findIndex(x => x.id === currentGroupId);
    if(idx > -1) {
        if(!groups[idx].images) groups[idx].images = [];
        groups[idx].images.push(base64);
        DB.set('groups', groups);
        openGroupDetail(currentGroupId);
        notify('Foto compartilhada no mural do grupo.');
    }
};

window.openGroupInviteModal = () => {
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const myData = getFriendsData(currentUser);
    const groups = DB._getAll('groups');
    const g = groups.find(x => x.id === currentGroupId);
    const db = JSON.parse(localStorage.getItem('state_users')) || [];

    const inviteList = document.getElementById('group-invite-list');
    inviteList.innerHTML = myData.friends.map(fU => {
        const isAlreadyIn = g.members.includes(fU);
        const uInfo = db.find(x => x.u === fU);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
                 <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar" style="width:30px; height:30px;">${uInfo?.avatar ? `<img src="${uInfo.avatar}" style="width:100%;height:100%;border-radius:50%">` : fU[0].toUpperCase()}</div>
                    <span style="font-size:0.85rem;">${(uInfo?.name || fU).toUpperCase()}</span>
                </div>
                ${isAlreadyIn ? '<span style="color:var(--brand-yellow); font-size:0.7rem;">INCLUSO</span>' : `<button class="btn btn-primary btn-sm" onclick="inviteToGroup('${fU}')">CONVIDAR</button>`}
            </div>
        `;
    }).join('') || '<p style="text-align:center; padding:20px; color:var(--text-muted);">Você precisa ter amigos para convidar.</p>';
    
    openModal('modal-invite-group');
};

window.inviteToGroup = (targetU) => {
    let groups = DB._getAll('groups');
    const idx = groups.findIndex(x => x.id === currentGroupId);
    if(idx > -1) {
        groups[idx].members.push(targetU);
        DB.set('groups', groups);
        notify(`${targetU} adicionado ao grupo.`);
        openGroupInviteModal();
        openGroupDetail(currentGroupId);
    }
};

window.removeFromGroup = (targetU) => {
    if(!confirm('Remover membro do grupo?')) return;
    let groups = DB._getAll('groups');
    const idx = groups.findIndex(x => x.id === currentGroupId);
    if(idx > -1) {
        groups[idx].members = groups[idx].members.filter(x => x !== targetU);
        DB.set('groups', groups);
        openGroupDetail(currentGroupId);
    }
};

document.getElementById('form-create-group-el').onsubmit = (e) => {
    e.preventDefault();
    const currentUser = localStorage.getItem('state_current_user') || 'admin';
    const db = JSON.parse(localStorage.getItem('state_users')) || [];
    const userObj = db.find(x => x.u === currentUser);
    
    // VIP CHECK
    const isVIP = userObj?.isVIP || currentUser === 'admin';
    if(!isVIP) {
        document.getElementById('vip-only-group-msg').style.display = 'block';
        return;
    }

    const name = document.getElementById('new-group-name').value;
    const newGroup = {
        id: 'g' + Date.now(),
        name,
        leader: currentUser,
        members: [],
        messages: [],
        images: []
    };

    let groups = DB._getAll('groups');
    groups.push(newGroup);
    DB.set('groups', groups);
    
    closeAllModals();
    renderGroups();
    notify('Grupo Colaborativo criado! Convide parceiros na tela de gestão.');
    document.getElementById('form-create-group-el').reset();
};
"""

# Inject before loadProfile or any convenient Place
js = js.replace('// --- PROFILE SYSTEM ---', social_logic + '\n// --- PROFILE SYSTEM ---')

# Trigger initial renders in DOMContentLoaded
js = js.replace('renderNotifications();', 'renderNotifications(); renderFriends(); renderGroups();')

# Inject profile field for friends
js = js.replace(
    'Mestre do Sistema / Acesso Total</p>', 
    'Acesso Total | <span id="profile-friends-count" style="color:var(--brand-yellow)">0</span> Conexões</p>'
)

# In changePass, it needs to update the usersDB correctly as well
# The script previously changed js to use DB-style which is fine, but state_users is a separate key usually

with open('c:/Users/caio/Documents/Antigravity/site-marcenaria/admin/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Dashboard Social Engine Injected.")
