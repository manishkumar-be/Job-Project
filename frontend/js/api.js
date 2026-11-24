// Shared helpers for every page: server address, login session, API calls,
// navigation menu and safe HTML output. Load this before the page's own script.

// The backend serves these pages, so API calls go to the same site (works on
// localhost and when hosted online). Only when a page is opened straight from disk
// or from a separate dev server such as VS Code Live Server, call the local backend.
const DEV_SERVER_PORTS = ['5500', '5501', '3000', '5173'];
const API_BASE = window.location.protocol === 'file:' || DEV_SERVER_PORTS.includes(window.location.port)
    ? 'http://localhost:8080'
    : '';

// ---------- Session (stored after login) ----------
const SESSION_KEY = 'jobPortalSession';

const Session = {
    get() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY));
        } catch {
            return null;
        }
    },
    save(token, user) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
        } catch {
            alert('Your browser blocked saving the login. Please allow site storage and try again.');
        }
    },
    clear() {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch { /* nothing to clear */ }
    },
};

// ---------- Helpers ----------

// Escape text before putting it into innerHTML, so user input cannot inject HTML or scripts
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Full link for an uploaded file such as "/uploads/123.pdf"
function fileLink(url) {
    return url ? API_BASE + url : '';
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

// Show a success or error message in an element with the "message" class
function showMessage(element, text, type = 'success') {
    if (!element) return alert(text);
    element.textContent = text;
    element.className = `message ${type}`;
    element.hidden = !text;
}

// Call the backend API. Returns the parsed JSON, or throws an Error with the server's message.
//   api('/job-posts')
//   api('/job-posts', { method: 'POST', body: { postName: 'Developer' } })
//   api('/profile', { method: 'POST', form: new FormData(formElement) })
async function api(path, { method = 'GET', body, form } = {}) {
    const headers = {};
    const session = Session.get();
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;

    let payload;
    if (form) {
        payload = form; // The browser sets the multipart Content-Type itself
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`${API_BASE}/api${path}`, { method, headers, body: payload });
    } catch {
        throw new Error('Cannot reach the server. Make sure the backend is running.');
    }

    let data = null;
    try {
        data = await response.json();
    } catch { /* Not JSON */ }

    // Logged out or session expired: go back to the login page
    if (response.status === 401 && !path.startsWith('/login')) {
        if (!api.redirecting) { // Several requests may fail at once; tell the user only once
            api.redirecting = true;
            Session.clear();
            alert((data && data.message) || 'Your session has expired. Please log in again.');
            window.location.href = 'login.html';
        }
        throw new Error('Not logged in');
    }
    if (!response.ok) {
        throw new Error((data && data.message) || `Request failed (${response.status})`);
    }
    return data;
}

// ---------- Navigation menu for each role ----------
const NAV_LINKS = {
    jobSeeker: [
        ['jobseeker.html', 'Home'],
        ['jobprofile.html', 'Profile'],
        ['joblisting.html', 'Job Listings'],
        ['cr.html', 'Company Reviews'],
        ['qb.html', 'Question Bank'],
        ['at.html', 'Application Tracker'],
        ['jobfeedback.html', 'Feedback'],
        ['jobhelp.html', 'Help'],
    ],
    company: [
        ['company.html', 'Home'],
        ['comprofile.html', 'Profile'],
        ['jobpost.html', 'Job Post'],
        ['applications.html', 'Applications'],
        ['applicationtracker.html', 'Application Tracker'],
    ],
    admin: [
        ['admin.html', 'Home'],
        ['jobpostmanage.html', 'Manage Job Posts'],
        ['usermanage.html', 'Manage Users'],
        ['feedback.html', 'Feedback'],
        ['help.html', 'Help Requests'],
    ],
};

function buildNav(role) {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const currentPage = window.location.pathname.split('/').pop() || '';
    const items = (NAV_LINKS[role] || []).map(([href, label]) =>
        `<li><a href="${href}"${href === currentPage ? ' class="active"' : ''}>${label}</a></li>`
    );
    items.push('<li><a href="login.html" id="logoutLink">Logout</a></li>');
    nav.innerHTML = `<ul>${items.join('')}</ul>`;

    document.getElementById('logoutLink').addEventListener('click', () => Session.clear());
}

// ---------- Page guard ----------
// A page with <body data-role="company"> may only be opened by a logged-in company.
const currentUser = (() => {
    const requiredRole = document.body.dataset.role;
    if (!requiredRole) return Session.get()?.user || null;

    const session = Session.get();
    if (!session?.token || session.user?.role !== requiredRole) {
        Session.clear();
        window.location.replace('login.html');
        return null;
    }
    buildNav(requiredRole);
    document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = session.user.email; });
    document.querySelectorAll('[data-company-name]').forEach(el => { el.textContent = session.user.companyName || ''; });
    return session.user;
})();
