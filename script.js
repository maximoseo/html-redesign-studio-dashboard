// Sample data - replace with actual API calls
const sampleTemplates = [
    {
        id: 1,
        name: 'Landing Page - שירותי SEO',
        status: 'approved',
        improvement: '+45%',
        date: '2026-06-02 13:00:00'
    },
    {
        id: 2,
        name: 'דף אודות - MaximoSEO',
        status: 'in-progress',
        improvement: '+32%',
        date: '2026-06-02 12:45:00'
    },
    {
        id: 3,
        name: 'בלוג - מאמר SEO',
        status: 'redesigned',
        improvement: '+58%',
        date: '2026-06-02 12:30:00'
    },
    {
        id: 4,
        name: 'Contact Page',
        status: 'pending',
        improvement: '0%',
        date: '2026-06-02 12:15:00'
    }
];

// Initialize dashboard
function initDashboard() {
    updateStats();
    renderTemplatesTable();
}

// Update statistics
function updateStats() {
    const stats = {
        total: sampleTemplates.length,
        redesigned: sampleTemplates.filter(t => t.status === 'redesigned' || t.status === 'approved').length,
        inProgress: sampleTemplates.filter(t => t.status === 'in-progress').length,
        approved: sampleTemplates.filter(t => t.status === 'approved').length
    };
    
    document.getElementById('total-templates').textContent = stats.total;
    document.getElementById('redesigned').textContent = stats.redesigned;
    document.getElementById('in-progress').textContent = stats.inProgress;
    document.getElementById('approved').textContent = stats.approved;
}

// Render templates table
function renderTemplatesTable() {
    const tbody = document.getElementById('templates-tbody');
    tbody.innerHTML = sampleTemplates.map(template => `
        <tr>
            <td>${template.name}</td>
            <td><span class="status-badge status-${template.status}">${getStatusText(template.status)}</span></td>
            <td><strong style="color: #28a745;">${template.improvement}</strong></td>
            <td>${template.date}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 8px 15px; font-size: 0.9em;" onclick="viewTemplate(${template.id})">
                    👁️ צפה
                </button>
                <button class="btn btn-secondary" style="padding: 8px 15px; font-size: 0.9em;" onclick="compareTemplate(${template.id})">
                    🔄 השווה
                </button>
            </td>
        </tr>
    `).join('');
}

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'approved': 'אושר',
        'in-progress': 'בתהליך',
        'redesigned': 'עוצב מחדש',
        'pending': 'ממתין'
    };
    return statusMap[status] || status;
}

function viewTemplate(id) {
    const template = sampleTemplates.find(t => t.id === id);
    if (template) {
        alert(`👁️ צופה בתבנית: ${template.name}\n\nסטטוס: ${getStatusText(template.status)}\nשיפור: ${template.improvement}`);
    }
}

function compareTemplate(id) {
    const template = sampleTemplates.find(t => t.id === id);
    if (template) {
        alert(`🔄 משווה גרסאות עבור: ${template.name}\n\nמציג לפני/אחרי...`);
    }
}

function processQueue() {
    const pendingCount = sampleTemplates.filter(t => t.status === 'pending').length;
    alert(`🎨 מעבד תור עיצוב...\n\n${pendingCount} תבניות ממתינות לעיצוב מחדש.\nפעולה זו תיקח כמה דקות.`);
    // Add actual processing logic here
}

function runOptimization() {
    alert('⚡ מריץ אופטימיזציה...\n\nמשפר ביצועים, SEO ונגישות עבור כל התבניות המעוצבות.');
    // Add actual optimization logic here
}

function exportTemplates() {
    alert('📦 מייצא תבניות...\n\nמייצא את כל התבניות המאושרות בחזרה ל-n8n.');
    // Add actual export logic here
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);
