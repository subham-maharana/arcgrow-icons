// Arcgrow Icons Website - Main JavaScript

let allIcons = [];
let filteredIcons = [];
let currentIcon = null;

// GitHub repo details
const GITHUB_USER = 'subham-maharana';
const GITHUB_REPO = 'arcgrow-icons';
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main`;

// Load icons on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadIcons();
    setupEventListeners();
});

// Load icons from GitHub via jsDelivr
async function loadIcons() {
    try {
        // Fetch metadata
        const metadataUrl = `${CDN_BASE}/icons/metadata.json`;
        const response = await fetch(metadataUrl);

        if (!response.ok) {
            throw new Error('Failed to load icons metadata');
        }

        const metadata = await response.json();

        // Convert metadata to array
        allIcons = Object.keys(metadata).map(name => ({
            name,
            ...metadata[name],
            svgUrl: `${CDN_BASE}/icons/${name}.svg`
        }));

        filteredIcons = [...allIcons];

        // Populate categories
        populateCategories();

        // Render icons
        renderIcons();

        // Update count
        updateIconCount();

    } catch (error) {
        console.error('Error loading icons:', error);
        document.getElementById('icon-grid').innerHTML = `
      <div class="error-state">
        <p>Failed to load icons. Please try again later.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
    }
}

// Populate category filter
function populateCategories() {
    const categories = [...new Set(allIcons.map(icon => icon.category))];
    const select = document.getElementById('category-filter');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        select.appendChild(option);
    });
}

// Render icon grid
function renderIcons() {
    const grid = document.getElementById('icon-grid');

    if (filteredIcons.length === 0) {
        grid.innerHTML = '<div class="empty-state">No icons found</div>';
        return;
    }

    grid.innerHTML = filteredIcons.map(icon => `
    <div class="icon-card" onclick="openIconModal('${icon.name}')">
      <div class="icon-preview">
        <img src="${icon.svgUrl}" alt="${icon.name}" />
      </div>
      <div class="icon-name">${icon.name}</div>
      ${icon.category ? `<div class="icon-category">${icon.category}</div>` : ''}
    </div>
  `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('search').addEventListener('input', (e) => {
        filterIcons(e.target.value, document.getElementById('category-filter').value);
    });

    // Category filter
    document.getElementById('category-filter').addEventListener('change', (e) => {
        filterIcons(document.getElementById('search').value, e.target.value);
    });
}

// Filter icons
function filterIcons(searchTerm, category) {
    filteredIcons = allIcons.filter(icon => {
        const matchesSearch = !searchTerm ||
            icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (icon.tags && icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesCategory = category === 'all' || icon.category === category;

        return matchesSearch && matchesCategory;
    });

    renderIcons();
    updateIconCount();
}

// Update icon count
function updateIconCount() {
    document.getElementById('icon-count').textContent =
        `${filteredIcons.length} icon${filteredIcons.length !== 1 ? 's' : ''}`;
}

// Open icon modal
async function openIconModal(iconName) {
    currentIcon = allIcons.find(icon => icon.name === iconName);
    if (!currentIcon) return;

    // Fetch SVG content
    const response = await fetch(currentIcon.svgUrl);
    const svgContent = await response.text();

    // Update modal
    const componentName = toPascalCase(iconName);

    document.getElementById('modal-icon-preview').innerHTML = svgContent;
    document.getElementById('modal-icon-name').textContent = iconName;

    // React code
    document.getElementById('react-code').textContent =
        `import { ${componentName} } from '@arcgrow/icons/react';

function App() {
  return <${componentName} size={24} color="#000" />;
}`;

    // Vue code
    document.getElementById('vue-code').textContent =
        `<template>
  <${componentName} :size="24" color="#000" />
</template>

<script>
import { ${componentName} } from '@arcgrow/icons/vue';
export default {
  components: { ${componentName} }
};
</script>`;

    // SVG code
    document.getElementById('svg-code').textContent = svgContent;

    // Show modal
    document.getElementById('icon-modal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('icon-modal').style.display = 'none';
    currentIcon = null;
}

// Copy code
function copyCode(type) {
    const codeElement = document.getElementById(`${type}-code`);
    const code = codeElement.textContent;

    navigator.clipboard.writeText(code).then(() => {
        // Show feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Download icon
async function downloadIcon() {
    if (!currentIcon) return;

    const response = await fetch(currentIcon.svgUrl);
    const svgContent = await response.text();

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentIcon.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper: Convert to PascalCase
function toPascalCase(str) {
    return str
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
