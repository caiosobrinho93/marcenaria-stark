import re

with open('c:/Users/caio/Documents/Antigravity/site-marcenaria/admin/dashboard.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Stage 1: Fix the mess around line 195 (indexed at 194)
# We want to remove the garbage and re-insert a clean switchModule if it's broken there
# Looking at the view_file:
# 195: "]`);
# 196:     if (target) {
# ...
# 206: }

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Detect the garbage block starting at ~195
    if '"]`);' in line and i > 190 and i < 210:
        skip = True
        continue
    if skip and '}' in line and i < 210:
        skip = False
        continue
    
    if not skip:
        new_lines.append(line)

# Stage 2: Fix the broken switchModule at the end
# 1681:     const nav = document.querySelector(`.nav-link[data-mod="${modId
content = "".join(new_lines)
content = content.replace('const nav = document.querySelector(`.nav-link[data-mod="${modId', 'const nav = document.querySelector(`.nav-link[data-mod="${modId}"]`);')

# Stage 3: Ensure there is only ONE clean switchModule at the end
# (The code we added in the previous turn seems to have some missing lines or extra chars)

# Let's just define the perfect switchModule and replace any broken attempts
clean_switch = """
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

    const span = nav?.querySelector('span');
    if(span && document.getElementById('current-mod-name')) {
        document.getElementById('current-mod-name').innerText = span.innerText;
    }

    if(modId === 'home') {
        const adminStats = document.getElementById('home-admin-stats');
        const socialFeed = document.getElementById('home-social-feed');
        if(currentUser === 'admin') {
            if(adminStats) adminStats.style.display = 'block';
            if(socialFeed) socialFeed.style.display = 'block';
        } else {
            if(adminStats) adminStats.style.display = 'none';
            if(socialFeed) socialFeed.style.display = 'block';
        }
        if(typeof renderFeed === 'function') renderFeed();
        updateStats();
    }
    
    if(modId === 'admsettings' && typeof renderAdminSettings === 'function') renderAdminSettings();
    if(modId === 'friends' && typeof renderFriends === 'function') renderFriends();
    if(modId === 'groups' && typeof renderGroups === 'function') renderGroups();
    
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.remove('open');
}
"""

# Remove any existing switchModule definitions to avoid redeclaration errors
content = re.sub(r'function switchModule\(modId\)\s*\{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('function switchModule(modId) {', '') # Extra safety for partials

content += "\n" + clean_switch

with open('c:/Users/caio/Documents/Antigravity/site-marcenaria/admin/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Sanitization Complete.")
