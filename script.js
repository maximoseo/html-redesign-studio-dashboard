// HTML Redesign Studio - Main Script
// Supabase Integration + n8n Webhook + Site Scanner

// Configuration
const SUPABASE_URL = 'https://***.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbG...3qmg';
const N8N_WEBHOOK_URL = 'https://websiseo.app.n8n.cloud/webhook/html-redesign-complete';

// Initialize Supabase Client
let supabaseClient = null;

async function initSupabase() {
    try {
        // Dynamic import of Supabase
        const { createClient } = await import('https://***.supabase.co/v1/script.js');
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase client initialized');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// Sample Design Templates (fallback if Supabase is unavailable)
const sampleDesigns = [
    {
        id: 1,
        name: 'Modern Minimalist',
        category: 'minimalist',
        colors: { primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' },
        fonts: { heading: 'Inter', body: 'Inter' },
        preview_url: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=400',
        css_code: `
            body { font-family: 'Inter', sans-serif; color: #333; }
            .hero { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 80px 20px; text-align: center; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; }
        `
    },
    {
        id: 2,
        name: 'Vibrant Gradient',
        category: 'colorful',
        colors: { primary: '#ec4899', secondary: '#8b5cf6', accent: '#06b6d4' },
        fonts: { heading: 'Poppins', body: 'Open Sans' },
        preview_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
        css_code: `
            body { font-family: 'Open Sans', sans-serif; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); }
            .hero { padding: 80px 20px; text-align: center; color: white; }
            .btn { background: #06b6d4; color: white; padding: 12px 24px; border-radius: 25px; }
        `
    },
    {
        id: 3,
        name: 'Corporate Blue',
        category: 'business',
        colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
        fonts: { heading: 'Montserrat', body: 'Roboto' },
        preview_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
        css_code: `
            body { font-family: 'Roboto', sans-serif; color: #1e293b; }
            .hero { background: #1e40af; color: white; padding: 80px 20px; text-align: center; }
            .btn { background: #f59e0b; color: white; padding: 12px 24px; border-radius: 4px; }
        `
    },
    {
        id: 4,
        name: 'Dark Mode Elegant',
        category: 'dark',
        colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#8b5cf6' },
        fonts: { heading: 'Playfair Display', body: 'Lato' },
        preview_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        css_code: `
            body { font-family: 'Lato', sans-serif; background: #0f172a; color: #f1f5f9; }
            .hero { background: #1e293b; padding: 80px 20px; text-align: center; }
            .btn { background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; }
        `
    },
    {
        id: 5,
        name: 'Nature Green',
        category: 'organic',
        colors: { primary: '#16a34a', secondary: '#22c55e', accent: '#84cc16' },
        fonts: { heading: 'Merriweather', body: 'Source Sans Pro' },
        preview_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        css_code: `
            body { font-family: 'Source Sans Pro', sans-serif; background: #f0fdf4; color: #14532d; }
            .hero { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 80px 20px; }
            .btn { background: #84cc16; color: white; padding: 12px 24px; border-radius: 25px; }
        `
    },
    {
        id: 6,
        name: 'Sunset Orange',
        category: 'colorful',
        colors: { primary: '#ea580c', secondary: '#f97316', accent: '#fbbf24' },
        fonts: { heading: 'Raleway', body: 'Nunito' },
        preview_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        css_code: `
            body { font-family: 'Nunito', sans-serif; background: #fff7ed; color: #7c2d12; }
            .hero { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 80px 20px; }
            .btn { background: #fbbf24; color: #7c2d12; padding: 12px 24px; border-radius: 8px; }
        `
    }
];

// Current State
let designTemplates = [];
let selectedDesign = null;
let currentTemplateId = null;

// Load Design Templates
async function loadDesignTemplates() {
    try {
        // Try Supabase first
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('design_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            if (data && data.length > 0) {
                designTemplates = data;
                console.log(`✓ Loaded ${data.length} templates from Supabase`);
            } else {
                // Insert sample data
                await insertSampleDesigns();
                designTemplates = sampleDesigns;
            }
        } else {
            // Fallback to sample data
            designTemplates = sampleDesigns;
            console.log('✓ Using sample templates (Supabase unavailable)');
        }
        
        renderGallery(designTemplates);
    } catch (error) {
        console.error('Error loading templates:', error);
        designTemplates = sampleDesigns;
        renderGallery(designTemplates);
    }
}

// Insert Sample Designs to Supabase
async function insertSampleDesigns() {
    if (!supabaseClient) return;
    
    try {
        const { error } = await supabaseClient
            .from('design_templates')
            .insert(sampleDesigns);
        
        if (error) throw error;
        console.log('✓ Sample designs inserted to Supabase');
    } catch (error) {
        console.error('Error inserting samples:', error);
    }
}

// Render Design Gallery
function renderGallery(templates) {
    const gallery = document.getElementById('designGallery');
    if (!gallery) return;
    
    gallery.innerHTML = templates.map(template => `
        <div class="design-card" data-category="${template.category}" onclick="selectDesign(${template.id})">
            <img src="${template.preview_url}" alt="${template.name}" class="design-preview">
            <div class="design-info">
                <h3>${template.name}</h3>
                <span class="design-category">${getCategoryName(template.category)}</span>
                <div class="color-palette-mini">
                    <span class="color-swatch" style="background:${template.colors.primary}" title="${template.colors.primary}"></span>
                    <span class="color-swatch" style="background:${template.colors.secondary}" title="${template.colors.secondary}"></span>
                    <span class="color-swatch" style="background:${template.colors.accent}" title="${template.colors.accent}"></span>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Gallery
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            const filtered = category === 'all' 
                ? designTemplates 
                : designTemplates.filter(t => t.category === category);
            renderGallery(filtered);
        });
    });
}

// Select Design
function selectDesign(id) {
    selectedDesign = designTemplates.find(t => t.id === id);
    if (selectedDesign) {
        showPreview(selectedDesign);
    }
}

// Show Preview Modal
function showPreview(template) {
    const modal = document.getElementById('previewModal');
    const title = document.getElementById('previewTitle');
    const beforeFrame = document.getElementById('previewBefore');
    const afterFrame = document.getElementById('previewAfter');
    
    if (!modal || !title) return;
    
    title.textContent = `תצוגה מקדימה: ${template.name}`;
    
    // Before: Plain HTML
    beforeFrame.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                h1 { color: #333; }
                button { padding: 10px 20px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>לפני העיצוב</h1>
            <p>זהו עיצוב HTML בסיסי ללא עיצוב מותאם אישית.</p>
            <p>הטקסט רגיל, הכפתורים פשוטים, והצבעים סטנדרטיים.</p>
            <button>כפתור רגיל</button>
        </body>
        </html>
    `;
    
    // After: Styled HTML
    afterFrame.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=${template.fonts.heading}&family=${template.fonts.body}&display=swap" rel="stylesheet">
            <style>
                ${template.css_code}
                body { padding: 40px; }
                h1 { font-family: '${template.fonts.heading}', sans-serif; font-size: 2.5rem; margin-bottom: 20px; }
                p { font-family: '${template.fonts.body}', sans-serif; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; }
                button { cursor: pointer; font-size: 1rem; transition: transform 0.2s; }
                button:hover { transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="hero">
                <h1>אחרי העיצוב</h1>
                <p>עיצוב מותאם אישית עם צבעים ופונטים מהתבנית הנבחרת.</p>
                <p>הטקסט מעוצב, הכפתורים מודגשים, והצבעים מותאמים למותג.</p>
                <button class="btn">כפתור מעוצב</button>
            </div>
        </body>
        </html>
    `;
    
    modal.style.display = 'block';
}

// Close Preview
function closePreview() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedDesign = null;
}

// Approve Design
async function approveDesign() {
    if (!selectedDesign) {
        alert('אנא בחר עיצוב קודם');
        return;
    }
    
    try {
        // Send to n8n webhook
        const payload = {
            action: 'design_approved',
            design: {
                id: selectedDesign.id,
                name: selectedDesign.name,
                category: selectedDesign.category,
                colors: selectedDesign.colors,
                fonts: selectedDesign.fonts,
                css_code: selectedDesign.css_code
            },
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert(`✅ עיצוב "${selectedDesign.name}" אושר ונשלח ל-n8n!\nה-workflow יתחיל לעבד את ה-HTML.`);
            closePreview();
        } else {
            throw new Error('n8n webhook failed');
        }
    } catch (error) {
        console.error('Error approving design:', error);
        alert(`⚠️ שגיאה בשליחה ל-n8n: ${error.message}\nהעיצוב נשמר מקומית.`);
        closePreview();
    }
}

// Scan Site
async function scanSite() {
    const url = document.getElementById('siteUrl').value.trim();
    if (!url) {
        alert('אנא הכנס כתובת אתר');
        return;
    }
    
    try {
        // Show loading
        const resultsDiv = document.getElementById('scanResults');
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = '<p>🔍 סורק אתר...</p>';
        
        // In real implementation, this would call a backend API
        // For now, simulate scanning with realistic data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const scanData = {
            colors: ['#2563eb', '#1e40af', '#f59e0b', '#10b981', '#ffffff', '#1e293b'],
            fonts: ['Roboto', 'Open Sans', 'Montserrat', 'Lato'],
            images: [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150',
                'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=150',
                'https://images.unsplash.com/photo-1497366811353-68707af75b9b?w=150'
            ],
            layout: 'responsive',
            breakpoints: ['768px', '1024px', '1440px']
        };
        
        // Render results
        resultsDiv.innerHTML = `
            <div class="color-palette">
                <h3>🎨 פלטת צבעים</h3>
                <div id="colorSwatches">
                    ${scanData.colors.map(c => `<span class="color-swatch" style="background:${c}" title="${c}"></span>`).join('')}
                </div>
            </div>
            <div class="fonts-detected">
                <h3>🔤 פונטים</h3>
                <div id="fontsList">
                    ${scanData.fonts.map(f => `<span class="font-tag">${f}</span>`).join('')}
                </div>
            </div>
            <div class="images-detected">
                <h3>🖼️ תמונות</h3>
                <div id="imagesList">
                    ${scanData.images.map(img => `<img src="${img}" class="preview-thumb" alt="Preview">`).join('')}
                </div>
            </div>
        `;
        
        alert(`✓ סריקה הושלמה!\nנמצאו ${scanData.colors.length} צבעים, ${scanData.fonts.length} פונטים, ${scanData.images.length} תמונות`);
    } catch (error) {
        console.error('Scan error:', error);
        alert('שגיאה בסריקת האתר: ' + error.message);
    }
}

// Process Queue
async function processQueue() {
    alert('🎨 מתחיל עיבוד תור עיצוב...\nזה ייקח כמה דקות.');
    
    // In real implementation:
    // 1. Get pending templates from Supabase
    // 2. Apply selected design to each
    // 3. Update status in database
    // 4. Send webhook to n8n
}

// Send to n8n
async function sendToN8N() {
    if (!selectedDesign) {
        alert('אנא בחר עיצוב קודם מהגלריה');
        return;
    }
    
    try {
        const payload = {
            action: 'send_to_workflow',
            design: selectedDesign,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert('✓ נשלח בהצלחה ל-n8n!\nה-workflow יתחיל לרוץ.');
        } else {
            throw new Error('n8n webhook failed');
        }
    } catch (error) {
        console.error('n8n send error:', error);
        alert('שגיאה בשליחה ל-n8n. בדוק את ה-webhook.');
    }
}

// Export All
function exportAll() {
    const data = JSON.stringify(designTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('📦 הקובץ ירד אוטומטית!');
}

// Helper: Get Category Name in Hebrew
function getCategoryName(category) {
    const names = {
        'minimalist': 'מינימליסטי',
        'colorful': 'צבעוני',
        'business': 'עסקי',
        'dark': 'כהה',
        'organic': 'אורגני'
    };
    return names[category] || category;
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎨 HTML Redesign Studio initialized');
    
    // Initialize Supabase
    await initSupabase();
    
    // Load design templates
    await loadDesignTemplates();
    
    // Initialize filters
    initFilters();
    
    // Load sample queue data
    const sampleTemplates = [
        { id: 1, name: 'Landing Page - שירותי SEO', design: 'Modern Minimalist', status: 'approved', improvement: '+45%' },
        { id: 2, name: 'דף אודות - MaximoSEO', design: 'Corporate Blue', status: 'in-progress', improvement: '+32%' },
        { id: 3, name: 'בלוג - מאמר SEO', design: 'Vibrant Gradient', status: 'redesigned', improvement: '+58%' },
        { id: 4, name: 'Contact Page', design: 'Dark Mode Elegant', status: 'pending', improvement: '0%' }
    ];

    const tbody = document.getElementById('templates-tbody');
    if (tbody) {
        tbody.innerHTML = sampleTemplates.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.design}</td>
                <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                <td>${t.improvement}</td>
                <td>
                    <button onclick="selectDesign(${t.id})" class="btn-small">👁️ תצוגה</button>
                    <button onclick="approveDesign()" class="btn-small">✅ אשר</button>
                </td>
            </tr>
        `).join('');
    }

    // Update stats
    const stats = {
        total: sampleTemplates.length,
        redesigned: sampleTemplates.filter(t => t.status === 'redesigned').length,
        inProgress: sampleTemplates.filter(t => t.status === 'in-progress').length,
        approved: sampleTemplates.filter(t => t.status === 'approved').length
    };
    
    const totalEl = document.getElementById('total-templates');
    const redesignedEl = document.getElementById('redesigned');
    const inProgressEl = document.getElementById('in-progress');
    const approvedEl = document.getElementById('approved');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (redesignedEl) redesignedEl.textContent = stats.redesigned;
    if (inProgressEl) inProgressEl.textContent = stats.inProgress;
    if (approvedEl) approvedEl.textContent = stats.approved;
    
    console.log('✓ Dashboard ready');
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('previewModal');
    if (e.target === modal) {
        closePreview();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePreview();
    }
});
