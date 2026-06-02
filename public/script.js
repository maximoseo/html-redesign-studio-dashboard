// Authentication
const AUTH_KEY='html_redesign_auth';
const AUTH_PASS='***';
const RESET_EMAIL = 'service@maximo-seo.com';

let currentWorkflow = null;
let currentDesignNode = null;

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
    const refreshBtn = document.getElementById('refreshBtn');

    // Check if already authenticated
    if (isAuthenticated()) {
        authOverlay.style.display = 'none';
        container.classList.add('visible');
        loadWorkflows();
    }

    // Login handler
    function handleLogin() {
        const password = authPassword.value;
        if (authenticate(password)) {
            authOverlay.style.display = 'none';
            container.classList.add('visible');
            loadWorkflows();
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
    
    // Refresh handler
    refreshBtn.addEventListener('click', loadWorkflows);
    
    // Load workflow button
    document.getElementById('loadWorkflowBtn').addEventListener('click', loadSelectedWorkflow);
    
    // Generate improved design button
    document.getElementById('generateImprovedBtn').addEventListener('click', generateImprovedDesign);
    
    // Approve button
    document.getElementById('approveBtn').addEventListener('click', approveAndUpdate);
    
    // Editor tabs
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => switchEditorTab(btn.dataset.tab));
    });
    
    // Preview tabs
    document.querySelectorAll('.tab-btn[data-preview]').forEach(btn => {
        btn.addEventListener('click', () => switchPreviewTab(btn.dataset.preview));
    });
});

// Load all workflows from N8N
async function loadWorkflows() {
    showLoading(true);
    try {
        const response = await fetch('/api/workflows');
        if (!response.ok) throw new Error('Failed to load workflows');
        
        const data = await response.json();
        const select = document.getElementById('workflowSelect');
        
        // Clear existing options
        select.innerHTML = '<option value="">-- בחר Workflow --</option>';
        
        // Add workflows
        (data.data || []).forEach(wf => {
            const option = document.createElement('option');
            option.value = wf.id;
            option.textContent = `${wf.name} (${wf.active ? 'פעיל' : 'לא פעיל'})`;
            select.appendChild(option);
        });
        
        showLoading(false);
    } catch (error) {
        showStatus(`שגיאה בטעינת workflows: ${error.message}`, 'error');
        showLoading(false);
    }
}

// Load selected workflow details
async function loadSelectedWorkflow() {
    const select = document.getElementById('workflowSelect');
    const workflowId = select.value;
    
    if (!workflowId) {
        alert('אנא בחר workflow');
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (!response.ok) throw new Error('Failed to load workflow');
        
        const data = await response.json();
        currentWorkflow = data.workflow;
        
        displayWorkflowInfo(data.workflow);
        displayDesignNodes(data.designNodes);
        
        document.getElementById('workflowDetails').style.display = 'block';
        showLoading(false);
    } catch (error) {
        showStatus(`שגיאה בטעינת workflow: ${error.message}`, 'error');
        showLoading(false);
    }
}

// Display workflow info
function displayWorkflowInfo(workflow) {
    const infoBox = document.getElementById('workflowInfo');
    infoBox.innerHTML = `
        <h3>${workflow.name}</h3>
        <p><strong>ID:</strong> ${workflow.id}</p>
        <p><strong>סטטוס:</strong> ${workflow.active ? '✅ פעיל' : '⏸️ לא פעיל'}</p>
        <p><strong>נוצר:</strong> ${new Date(workflow.createdAt).toLocaleString('he-IL')}</p>
        <p><strong>עודכן:</strong> ${new Date(workflow.updatedAt).toLocaleString('he-IL')}</p>
        <p><strong>סה"כ nodes:</strong> ${(workflow.nodes || []).length}</p>
    `;
}

// Display design nodes
function displayDesignNodes(nodes) {
    const list = document.getElementById('designNodesList');
    list.innerHTML = '';
    
    if (nodes.length === 0) {
        list.innerHTML = '<p style="color: #a0a0a0;">לא נמצאו nodes עם HTML/CSS בworkflow זה</p>';
        return;
    }
    
    nodes.forEach(node => {
        const card = document.createElement('div');
        card.className = 'node-card';
        card.onclick = () => selectDesignNode(node);
        
        let badges = '';
        if (node.hasHTML) badges += '<span class="node-badge badge-html">HTML</span>';
        if (node.hasCSS) badges += '<span class="node-badge badge-css">CSS</span>';
        
        card.innerHTML = `
            <h3>${node.name}</h3>
            <p><strong>סוג:</strong> ${node.type}</p>
            <p><strong>ID:</strong> ${node.id}</p>
            ${badges}
        `;
        
        list.appendChild(card);
    });
}

// Select a design node to edit
function selectDesignNode(node) {
    currentDesignNode = node;
    
    // Extract code from node parameters
    let code = '';
    if (node.parameters.htmlContent) {
        code = node.parameters.htmlContent;
    } else if (node.parameters.jsCode) {
        code = node.parameters.jsCode;
    } else if (node.parameters.css) {
        code = node.parameters.css;
    } else {
        code = JSON.stringify(node.parameters, null, 2);
    }
    
    // Show editor
    document.getElementById('editorSection').style.display = 'block';
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('originalCode').value = code;
    document.getElementById('improvedCode').value = '';
    document.getElementById('generateImprovedBtn').style.display = 'block';
    document.getElementById('approveBtn').style.display = 'none';
    
    // Update preview
    updatePreview('original', code);
    
    // Scroll to editor
    document.getElementById('editorSection').scrollIntoView({ behavior: 'smooth' });
}

// Generate improved design
async function generateImprovedDesign() {
    const originalCode = document.getElementById('originalCode').value;
    
    showLoading(true);
    showStatus('יוצר עיצוב משופר...', 'success');
    
    // Simulate AI improvement (in real app, this would call an AI service)
    setTimeout(() => {
        let improved = originalCode;
        
        // Simple improvements for demo
        if (improved.includes('<html')) {
            // Add modern CSS
            const modernCSS = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  h1, h2, h3 { color: #6c5ce7; margin-bottom: 15px; }
  a { color: #9b59b6; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .container { padding: 20px; }
  .btn { 
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #9b59b6, #6c5ce7);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.2s;
  }
  .btn:hover { transform: translateY(-2px); }
</style>`;
            
            if (improved.includes('</head>')) {
                improved = improved.replace('</head>', modernCSS + '\n</head>');
            } else {
                improved = modernCSS + '\n' + improved;
            }
        }
        
        document.getElementById('improvedCode').value = improved;
        updatePreview('improved', improved);
        
        showStatus('עיצוב משופר נוצר בהצלחה!', 'success');
        document.getElementById('generateImprovedBtn').style.display = 'none';
        document.getElementById('approveBtn').style.display = 'block';
        showLoading(false);
    }, 2000);
}

// Approve and update N8N
async function approveAndUpdate() {
    if (!currentWorkflow || !currentDesignNode) {
        alert('אין workflow או node נבחר');
        return;
    }
    
    const improvedCode = document.getElementById('improvedCode').value;
    if (!improvedCode) {
        alert('אין קוד משופר');
        return;
    }
    
    showLoading(true);
    showStatus('מעדכן workflow ב-N8N...', 'success');
    
    try {
        // Update the node parameters
        const nodeIndex = currentWorkflow.nodes.findIndex(n => n.id === currentDesignNode.id);
        if (nodeIndex === -1) throw new Error('Node not found in workflow');
        
        // Update based on parameter type
        if (currentWorkflow.nodes[nodeIndex].parameters.htmlContent !== undefined) {
            currentWorkflow.nodes[nodeIndex].parameters.htmlContent = improvedCode;
        } else if (currentWorkflow.nodes[nodeIndex].parameters.jsCode !== undefined) {
            currentWorkflow.nodes[nodeIndex].parameters.jsCode = improvedCode;
        } else if (currentWorkflow.nodes[nodeIndex].parameters.css !== undefined) {
            currentWorkflow.nodes[nodeIndex].parameters.css = improvedCode;
        }
        
        // Send to backend
        const response = await fetch(`/api/workflows/${currentWorkflow.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflow: currentWorkflow })
        });
        
        if (!response.ok) throw new Error('Failed to update workflow');
        
        showStatus('✅ Workflow עודכן בהצלחה ב-N8N!', 'success');
        setTimeout(() => {
            showStatus('', '');
            loadWorkflows(); // Refresh list
        }, 3000);
        
    } catch (error) {
        showStatus(`שגיאה בעדכון workflow: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Switch editor tabs
function switchEditorTab(tab) {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.getElementById('originalCode').style.display = tab === 'original' ? 'block' : 'none';
    document.getElementById('improvedCode').style.display = tab === 'improved' ? 'block' : 'none';
}

// Switch preview tabs
function switchPreviewTab(preview) {
    document.querySelectorAll('.tab-btn[data-preview]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preview === preview);
    });
    
    document.getElementById('originalPreview').style.display = preview === 'original' ? 'block' : 'none';
    document.getElementById('improvedPreview').style.display = preview === 'improved' ? 'block' : 'none';
}

// Update preview iframe
function updatePreview(type, code) {
    const iframe = document.getElementById(type + 'Preview');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
}

// Show/hide loading overlay
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    if (!message) {
        statusDiv.style.display = 'none';
        return;
    }
    
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';
}
