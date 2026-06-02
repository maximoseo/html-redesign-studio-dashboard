// Authentication
const AUTH_KEY='***';
const AUTH_PASS='***';
const RESET_EMAIL = 'service@maximo-seo.com';

function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function authenticate(password) {
    if (password === AUTH_PASS) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
}

// Auth UI
document.addEventListener('DOMContentLoaded', function() {
    const authOverlay = document.getElementById('authOverlay');
    const container = document.querySelector('.container');
    const loginForm = document.getElementById('loginForm');
    const resetForm = document.getElementById('resetForm');
    const authPassword = document.getElementById('authPassword');
    const authSubmit = document.getElementById('authSubmit');
    const authError = document.getElementById('authError');
    const forgotPassword = document.getElementById('forgotPassword');
    const resetSubmit = document.getElementById('resetSubmit');
    const resetEmail = document.getElementById('resetEmail');
    const resetSuccess = document.getElementById('resetSuccess');
    const backToLogin = document.getElementById('backToLogin');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if already authenticated
    if (isAuthenticated()) {
        authOverlay.style.display = 'none';
        container.classList.add('visible');
        loadDashboard();
    }

    // Login handler
    function handleLogin() {
        const password = authPassword.value;
        if (authenticate(password)) {
            authOverlay.style.display = 'none';
            container.classList.add('visible');
            loadDashboard();
        } else {
            authError.style.display = 'block';
            setTimeout(() => authError.style.display = 'none', 3000);
        }
    }

    authSubmit.addEventListener('click', handleLogin);
    authPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Forgot password handler
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        resetForm.style.display = 'block';
    });

    // Reset password handler
    resetSubmit.addEventListener('click', () => {
        const email = resetEmail.value;
        if (email === RESET_EMAIL) {
            // Simulate sending reset code
            resetSuccess.style.display = 'block';
            setTimeout(() => {
                resetSuccess.style.display = 'none';
                resetForm.style.display = 'none';
                loginForm.style.display = 'block';
            }, 3000);
        } else {
            alert('כתובת מייל לא נכונה');
        }
    });

    // Back to login
    backToLogin.addEventListener('click', () => {
        resetForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Logout handler
    logoutBtn.addEventListener('click', logout);
});

// Dashboard Functions
function loadDashboard() {
    loadTemplates();
    updateStats();
}

function loadTemplates() {
    const sampleTemplates = [
        { name: 'Landing Page - שירותי SEO', status: 'approved', improvement: '+45%', date: '2026-06-02 13:00:00' },
        { name: 'דף אודות - MaximoSEO', status: 'in-progress', improvement: '+32%', date: '2026-06-02 12:45:00' },
        { name: 'בלוג - מאמר SEO', status: 'redesigned', improvement: '+58%', date: '2026-06-02 12:30:00' },
        { name: 'Contact Page', status: 'pending', improvement: '0%', date: '2026-06-02 12:15:00' }
    ];

    const tbody = document.getElementById('templates-tbody');
    tbody.innerHTML = '';

    sampleTemplates.forEach(template => {
        const row = document.createElement('tr');
        const statusClass = `status-${template.status}`;
        const statusText = template.status === 'approved' ? 'אושר' : 
                          template.status === 'in-progress' ? 'בתהליך' : 
                          template.status === 'redesigned' ? 'עוצב מחדש' : 'ממתין';
        
        row.innerHTML = `
            <td>${template.name}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="color: #51cf66; font-weight: 600;">${template.improvement}</td>
            <td>${template.date}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewTemplate('${template.name}')" style="padding: 8px 16px; font-size: 0.9em; margin-left: 5px;">👁️ צפה</button>
                <button class="btn btn-secondary" onclick="compareTemplate('${template.name}')" style="padding: 8px 16px; font-size: 0.9em;">🔄 השווה</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    document.getElementById('total-templates').textContent = '4';
    document.getElementById('redesigned').textContent = '1';
    document.getElementById('in-progress').textContent = '1';
    document.getElementById('approved').textContent = '1';
}

function processQueue() {
    alert('🎨 מעבד תור עיצוב...');
}

function runOptimization() {
    alert('⚡ מריץ אופטימיזציה...');
}

function exportTemplates() {
    alert('📦 מייצא תבניות...');
}

function viewTemplate(name) {
    alert(`👁️ צופה בתבנית: ${name}`);
}

function compareTemplate(name) {
    alert(`🔄 משווה תבנית: ${name}`);
}
