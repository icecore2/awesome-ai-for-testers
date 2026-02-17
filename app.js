// Global state
let allResources = [];
let filteredResources = [];
let currentPage = 1;
const itemsPerPage = 6;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
}

// Load all resources from data directory
async function loadResources() {
    try {
        showLoading();
        
        // Define the structure based on the data directory
        const categories = ['test-generation', 'test-automation', 'test-analysis'];
        const resources = [];
        
        for (const category of categories) {
            const categoryResources = await loadCategoryResources(category);
            resources.push(...categoryResources);
        }
        
        allResources = resources;
        filteredResources = [...allResources];
        
        populateCategoryFilter();
        renderResources();
        hideLoading();
    } catch (error) {
        console.error('Error loading resources:', error);
        showError('Failed to load resources. Please try again later.');
    }
}

// Load resources from a specific category
async function loadCategoryResources(category) {
    const resources = [];
    
    // List of known files in each category (in a real scenario, this would be dynamic)
    const fileMap = {
        'test-generation': ['unit-test-generation', 'integration-test-generation'],
        'test-automation': ['selenium-automation', 'api-automation'],
        'test-analysis': ['test-result-analysis', 'code-coverage-analysis']
    };
    
    const files = fileMap[category] || [];
    
    for (const fileName of files) {
        try {
            const manifest = await fetch(`data/${category}/${fileName}.manifest.json`).then(r => r.json());
            const content = await fetch(`data/${category}/${fileName}.md`).then(r => r.text());
            const instructions = await fetch(`data/${category}/${fileName}.instructions.md`).then(r => r.text());
            
            resources.push({
                fileName,
                category,
                manifest,
                content,
                instructions
            });
        } catch (error) {
            console.warn(`Failed to load ${fileName} from ${category}:`, error);
        }
    }
    
    return resources;
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(allResources.map(r => r.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = formatCategoryName(category);
        categoryFilter.appendChild(option);
    });
}

// Format category name for display
function formatCategoryName(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Handle search input
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredResources = [...allResources];
    } else {
        filteredResources = allResources.filter(resource => {
            const titleMatch = resource.manifest.title.toLowerCase().includes(searchTerm);
            const tagsMatch = resource.manifest.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const categoryMatch = resource.category.toLowerCase().includes(searchTerm);
            const contentMatch = resource.content.toLowerCase().includes(searchTerm);
            
            return titleMatch || tagsMatch || categoryMatch || contentMatch;
        });
    }
    
    currentPage = 1;
    renderResources();
}

// Handle category filter
function handleCategoryFilter(e) {
    const selectedCategory = e.target.value;
    
    if (selectedCategory === 'all') {
        filteredResources = [...allResources];
    } else {
        filteredResources = allResources.filter(r => r.category === selectedCategory);
    }
    
    currentPage = 1;
    renderResources();
}

// Render resources with pagination
function renderResources() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    
    if (filteredResources.length === 0) {
        showNoResults();
        updatePagination();
        return;
    }
    
    // Group resources by category
    const groupedByCategory = {};
    filteredResources.forEach(resource => {
        if (!groupedByCategory[resource.category]) {
            groupedByCategory[resource.category] = [];
        }
        groupedByCategory[resource.category].push(resource);
    });
    
    // Calculate pagination
    const categories = Object.keys(groupedByCategory);
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const categoriesToShow = categories.slice(startIndex, endIndex);
    
    // Render each category
    categoriesToShow.forEach(category => {
        const categorySection = createCategorySection(category, groupedByCategory[category]);
        container.appendChild(categorySection);
    });
    
    updatePagination();
}

// Create a category section
function createCategorySection(category, resources) {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const header = document.createElement('div');
    header.className = 'category-header';
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = formatCategoryName(category);
    
    const count = document.createElement('span');
    count.className = 'category-count';
    count.textContent = `${resources.length} resources`;
    
    header.appendChild(title);
    header.appendChild(count);
    section.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'resources-grid';
    
    resources.forEach(resource => {
        const card = createResourceCard(resource);
        grid.appendChild(card);
    });
    
    section.appendChild(grid);
    return section;
}

// Create a resource card
function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.onclick = () => showResourceDetails(resource);
    
    const title = document.createElement('h3');
    title.className = 'resource-title';
    title.textContent = resource.manifest.title;
    card.appendChild(title);
    
    const meta = document.createElement('div');
    meta.className = 'resource-meta';
    
    // Add tags
    resource.manifest.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        meta.appendChild(tagSpan);
    });
    
    // Add difficulty
    const difficulty = document.createElement('span');
    difficulty.className = `difficulty ${resource.manifest.difficulty}`;
    difficulty.textContent = resource.manifest.difficulty;
    meta.appendChild(difficulty);
    
    card.appendChild(meta);
    
    // Add resource info
    const info = document.createElement('div');
    info.className = 'resource-info';
    info.innerHTML = `
        <span>📖 ${resource.manifest.readTime}</span>
        <span>📅 ${resource.manifest.lastUpdated}</span>
    `;
    card.appendChild(info);
    
    return card;
}

// Show resource details in a modal
function showResourceDetails(resource) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('resourceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resourceModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal on click outside or on close button
        modal.querySelector('.close').onclick = () => modal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }
    
    // Populate modal content
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${resource.manifest.title}</h2>
        <div class="resource-meta" style="margin: 1rem 0;">
            ${resource.manifest.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            <span class="difficulty ${resource.manifest.difficulty}">${resource.manifest.difficulty}</span>
        </div>
        <div style="margin: 1rem 0;">
            <strong>📖 Read Time:</strong> ${resource.manifest.readTime} | 
            <strong>📅 Last Updated:</strong> ${resource.manifest.lastUpdated}
        </div>
        <hr style="margin: 1.5rem 0;">
        <div class="content">
            ${markdownToHTML(resource.content)}
        </div>
        <hr style="margin: 1.5rem 0;">
        <h3>📝 Instructions</h3>
        <div class="instructions">
            ${markdownToHTML(resource.instructions)}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Simple markdown to HTML converter
function markdownToHTML(markdown) {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gim, '<p>$1</p>')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h([1-3])><\/p>/g, '</h$1>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>');
}

// Change page
function changePage(direction) {
    const categories = [...new Set(filteredResources.map(r => r.category))];
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    
    currentPage += direction;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    renderResources();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update pagination controls
function updatePagination() {
    const categories = [...new Set(filteredResources.map(r => r.category))];
    const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

// Show loading state
function showLoading() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '<div class="loading"><h3>Loading resources...</h3></div>';
}

// Hide loading state
function hideLoading() {
    // Loading state is replaced by content
}

// Show error message
function showError(message) {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = `<div class="no-results"><h3>Error</h3><p>${message}</p></div>`;
}

// Show no results message
function showNoResults() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = `
        <div class="no-results">
            <h3>No resources found</h3>
            <p>Try adjusting your search or filter criteria</p>
        </div>
    `;
}
