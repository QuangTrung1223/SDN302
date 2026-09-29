/**
 * BookNest Online Bookstore - Client Application Logic (Lab 05)
 * Interacts with Mongoose-driven Express REST API endpoints
 */

const API_BASE = '/api';

// State
let allBooks = [];
let allCategories = [];

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const btnRefresh = document.getElementById('btnRefresh');
const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
const createModal = document.getElementById('createModal');
const summaryModal = document.getElementById('summaryModal');
const bookForm = document.getElementById('bookForm');
const formAlert = document.getElementById('formAlert');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  fetchCategories();
  fetchBooks();
  setupEventListeners();
  setInterval(fetchHealth, 15000);
});

// Event Listeners
function setupEventListeners() {
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchBooks, 300);
  });

  categoryFilter.addEventListener('change', fetchBooks);
  sortFilter.addEventListener('change', fetchBooks);
  btnRefresh.addEventListener('click', () => {
    fetchCategories();
    fetchBooks();
  });

  btnOpenCreateModal.addEventListener('click', () => {
    bookForm.reset();
    formAlert.classList.remove('active');
    createModal.classList.add('active');
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close, .btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      createModal.classList.remove('active');
      summaryModal.classList.remove('active');
    });
  });

  // Handle Book Creation (Triggers Mongoose Validation & Pre/Post Hooks)
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formAlert.classList.remove('active');

    const rawTags = document.getElementById('bookTags').value;
    const tags = rawTags
      ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: document.getElementById('bookTitle').value.trim(),
      author: document.getElementById('bookAuthor').value.trim(),
      isbn: document.getElementById('bookIsbn').value.trim(),
      category: document.getElementById('bookCategory').value,
      price: parseFloat(document.getElementById('bookPrice').value),
      quantity: parseInt(document.getElementById('bookQuantity').value, 10) || 0,
      publishedYear: parseInt(document.getElementById('bookYear').value, 10),
      description: document.getElementById('bookDescription').value.trim(),
      tags,
    };

    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Display Mongoose Central Error Handler details
        let errorMsg = data.message || 'Validation error occurred';
        if (data.invalidFields) {
          errorMsg = Object.entries(data.invalidFields)
            .map(([field, msg]) => `<strong>${field}</strong>: ${msg}`)
            .join('<br>');
        }
        formAlert.innerHTML = errorMsg;
        formAlert.classList.add('active');
        return;
      }

      // Success
      createModal.classList.remove('active');
      fetchBooks();
      alert(`✔ Book created successfully! Auto-generated slug: "${data.data.slug}"`);
    } catch (err) {
      formAlert.textContent = `Network error: ${err.message}`;
      formAlert.classList.add('active');
    }
  });
}

// Fetch Server & Database Health
async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    const statusText = document.getElementById('statusText');
    if (data.status === 'UP') {
      statusText.textContent = `Online • Uptime: ${data.uptime}`;
    }
  } catch {
    document.getElementById('statusText').textContent = 'Server Offline';
  }
}

// Fetch Categories
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    if (data.success) {
      allCategories = data.data;
      document.getElementById('statCategories').textContent = allCategories.length;

      // Populate filter dropdown
      const currentSelected = categoryFilter.value;
      categoryFilter.innerHTML = '<option value="">All Categories</option>';
      allCategories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.name} (${cat.slug})`;
        categoryFilter.appendChild(opt);
      });
      categoryFilter.value = currentSelected;

      // Populate form category select
      const formCat = document.getElementById('bookCategory');
      formCat.innerHTML = '';
      allCategories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = cat.name;
        formCat.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// Fetch Books with Query Parameters
async function fetchBooks() {
  const keyword = searchInput.value.trim();
  const category = categoryFilter.value;
  const sort = sortFilter.value;

  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);

  booksGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
      Loading books catalog from MongoDB...
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/books?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      allBooks = data.data;
      updateStats(data.total || allBooks.length);
      renderBooks(allBooks);
    }
  } catch (err) {
    booksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--accent-rose);">
        Failed to load books: ${err.message}. Make sure MongoDB is connected.
      </div>
    `;
  }
}

// Update Stats Banner
function updateStats(total) {
  document.getElementById('statTotalBooks').textContent = total;
  const inStockCount = allBooks.filter((b) => b.inStock).length;
  document.getElementById('statInStock').textContent = inStockCount;

  const avgPrice = allBooks.length
    ? (allBooks.reduce((sum, b) => sum + (b.price || 0), 0) / allBooks.length).toFixed(2)
    : '0.00';
  document.getElementById('statAvgPrice').textContent = `$${avgPrice}`;
}

// Render Books Grid
function renderBooks(books) {
  if (books.length === 0) {
    booksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
        No books match your current filter criteria.
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = books
    .map(
      (b) => `
    <div class="book-card" data-id="${b._id}">
      <div>
        <div class="card-header">
          <span class="cat-badge">${b.category}</span>
          <span class="stock-pill ${b.inStock ? 'stock-in' : 'stock-out'}">
            ${b.inStock ? '● In Stock (' + b.quantity + ')' : '○ Out of Stock'}
          </span>
        </div>
        <h3 class="book-title">${b.title}</h3>
        <p class="book-author">By <strong>${b.author}</strong> • Year: ${b.publishedYear || 'N/A'}</p>
        <p class="book-desc">${b.description || 'No description provided.'}</p>
        
        <div class="meta-pills">
          <span class="pill">ISBN: ${b.isbn}</span>
          <span class="pill pill-slug">/${b.slug}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="price-display">
          <span class="price-label">Price (Virtual)</span>
          <span class="price-virtual">${b.formattedPrice || '$' + b.price.toFixed(2)}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm" onclick="showBookSummary('${b._id}')" title="Call Instance Method">
            Summary
          </button>
          <button class="btn btn-outline btn-sm" onclick="deleteBook('${b._id}', '${b.title.replace(/'/g, "\\'")}')" style="color: var(--accent-rose);" title="Delete Book">
            ✕
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// Call Instance Method: getSummary()
window.showBookSummary = async function (id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}/summary`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('summaryModalTitle').textContent = data.title;
      document.getElementById('summaryModalText').textContent = data.summary;
      document.getElementById('summaryVirtualPrice').textContent = data.virtualFormattedPrice;
      summaryModal.classList.add('active');
    }
  } catch (err) {
    alert(`Failed to fetch summary: ${err.message}`);
  }
};

// Delete Book
window.deleteBook = async function (id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  try {
    const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchBooks();
    } else {
      alert(`Delete failed: ${data.message}`);
    }
  } catch (err) {
    alert(`Delete error: ${err.message}`);
  }
};

// Test Static Method findByCategory
window.testStaticMethod = async function (catName) {
  categoryFilter.value = catName;
  fetchBooks();
};
