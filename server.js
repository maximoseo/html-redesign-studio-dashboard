import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// N8N Configuration
const N8N_BASE_URL = 'https://websiseo.app.n8n.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Get all workflows from N8N
app.get('/api/workflows', async (req, res) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`N8N API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single workflow with all nodes
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${req.params.id}`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`N8N API error: ${response.status}`);
    }
    
    const workflow = await response.json();
    
    // Extract HTML/CSS nodes
    const designNodes = extractDesignNodes(workflow.nodes || []);
    
    res.json({
      workflow,
      designNodes
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update workflow with new design
app.post('/api/workflows/:id', async (req, res) => {
  try {
    const { workflow } = req.body;
    
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${req.params.id}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    
    if (!response.ok) {
      throw new Error(`N8N API error: ${response.status}`);
    }
    
    const updated = await response.json();
    res.json(updated);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Extract HTML/CSS related nodes from workflow
function extractDesignNodes(nodes) {
  const designNodes = [];
  
  nodes.forEach(node => {
    const nodeType = node.type || '';
    const parameters = node.parameters || {};
    
    // Check if node contains HTML/CSS content
    if (
      nodeType.includes('html') ||
      nodeType.includes('http') ||
      nodeType.includes('function') ||
      nodeType.includes('code') ||
      parameters.htmlContent ||
      parameters.css ||
      parameters.template ||
      (parameters.jsCode && (parameters.jsCode.includes('<html') || parameters.jsCode.includes('style')))
    ) {
      designNodes.push({
        id: node.id,
        name: node.name,
        type: nodeType,
        parameters: parameters,
        hasHTML: !!(parameters.htmlContent || (parameters.jsCode && parameters.jsCode.includes('<html'))),
        hasCSS: !!(parameters.css || (parameters.jsCode && parameters.jsCode.includes('style')))
      });
    }
  });
  
  return designNodes;
}

app.listen(PORT, () => {
  console.log(`HTML Redesign Studio server running on port ${PORT}`);
});
