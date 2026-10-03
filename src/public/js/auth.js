// ===== Manejo de sesión en el navegador =====
const TOKEN_KEY = 'token';
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
function setToken(token) { sessionStorage.setItem(TOKEN_KEY, token); }

function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.replace('/signIn');
}

// Lee el payload del JWT (la firma la valida el servidor)
function decodeToken(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

// Devuelve la sesión solo si el token existe y no ha expirado
function getSession() {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
        sessionStorage.removeItem(TOKEN_KEY);
        return null;
    }
    return { token, userId: payload.sub, roles: payload.roles || [], exp: payload.exp };
}

function dashboardFor(roles) {
    return roles.includes('admin') ? '/admin' : '/dashboard';
}

// Protege una página: sin token -> /signIn, sin rol -> /403
function requireAuth(requiredRoles = []) {
    const session = getSession();
    if (!session) {
        window.location.replace('/signIn');
        return null;
    }
    if (requiredRoles.length && !session.roles.some(r => requiredRoles.includes(r))) {
        window.location.replace('/403');
        return null;
    }

    // Cierre de sesión automático cuando el token expire
    const msLeft = session.exp * 1000 - Date.now();
    setTimeout(() => {
        alert('Tu sesión ha expirado. Vuelve a iniciar sesión.');
        logout();
    }, msLeft);

    setupNavbar(session);
    document.querySelectorAll('.hidden-until-auth').forEach(el => el.classList.remove('hidden-until-auth'));
    return session;
}

// Llamadas a la API con el token JWT
async function apiFetch(url, options = {}) {
    const session = getSession();
    if (!session) {
        logout();
        throw new Error('Sesión expirada');
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
        }
    });

    if (res.status === 401) {
        logout();
        throw new Error('Sesión expirada');
    }
    if (res.status === 403) {
        window.location.replace('/403');
        throw new Error('Acceso denegado');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Ocurrió un error');
    return data;
}

function setupNavbar(session) {
    if (session.roles.includes('admin')) {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hide'));
    }
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            logout();
        });
    });
}

// ===== Utilidades =====
function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(message, type = 'error') {
    M.toast({ html: esc(message), classes: type === 'ok' ? 'green darken-1' : 'red darken-1' });
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('es-PE', { timeZone: 'UTC' });
}

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('es-PE');
}

function avatarHtml(user) {
    const url = user.url_profile || '';
    if (/^https?:\/\//i.test(url)) {
        return `<img src="${esc(url)}" alt="Foto de perfil" class="avatar">`;
    }
    const initials = `${(user.name || ' ')[0]}${(user.lastName || ' ')[0]}`.trim().toUpperCase();
    return `<div class="avatar avatar-initials">${esc(initials)}</div>`;
}

function rolesHtml(roles) {
    return roles.map(r => `<span class="chip ${r === 'admin' ? 'amber lighten-3' : 'teal lighten-4'}">${esc(r)}</span>`).join('');
}