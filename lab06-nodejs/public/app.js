/**
 * BookNest Online Bookstore - Frontend Logic for Lab 06 (Mongoose Population)
 * Handles Population Toggles, Deep Population Views, and Virtual Populate
 */

const API_BASE = '/api';

let isPopulated = true;
let currentBooks = [];
let selectedBook = null;

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const authorsGrid = document.getElementById('authorsGrid');
const categoriesGrid = document.getElementById('categoriesGrid');
const togglePopulate = document.getElementById('togglePopulate');
const toggleStatusText = document.getElementById('toggleStatusText');
const detailModal = document.getElementById('detailModal');
const reviewFilterSelect = document.getElementById('reviewFilterSelect');
const reviewSortSelect = document.getElementById('reviewSortSelect');

document.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  loadBooks();
  setupTabs();

  togglePopulate.addEventListener('change', (e) => {
    isPopulated = e.target.checked;
    toggleStatusText.textContent = isPopulated ? 'Populated (Documents)' : 'Raw ObjectIds (Unpopulated)';
    loadBooks();
  });

  // Modal close handlers
  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      detailModal.classList.remove('active');
      document.getElementById('compareModal').classList.remove('active');
    });
  });

  // Review Filter & Sort in Modal (Requirement 3: match & options)
  reviewFilterSelect.addEventListener('change', () => {
    if (selectedBook) fetchBookReviews(selectedBook._id);
  });
  reviewSortSelect.addEventListener('change', () => {
    if (selectedBook) fetchBookReviews(selectedBook._id);
  });
});

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');

      const target = e.target.dataset.tab;
      document.getElementById('sectionBooks').style.display = target === 'books' ? 'block' : 'none';
      document.getElementById('sectionAuthors').style.display = target === 'authors' ? 'block' : 'none';
      document.getElementById('sectionCategories').style.display = target === 'categories' ? 'block' : 'none';

      if (target === 'authors') loadAuthors();
      if (target === 'categories') loadCategories();
    });
  });
}

async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    document.getElementById('statusText').textContent = `MongoDB Connected • Uptime: ${data.uptime}`;
  } catch {
    document.getElementById('statusText').textContent = 'Server Offline';
  }
}

// Requirement 2: Load Books with / without Population
async function loadBooks() {
  booksGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Fetching books from MongoDB...</div>';

  try {
    const res = await fetch(`${API_BASE}/books?populate=${isPopulated}`);
    const json = await res.json();

    if (json.success) {
      currentBooks = json.data;
      renderBooks(currentBooks);
    }
  } catch (err) {
    booksGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--accent-rose); text-align: center;">Error loading books: ${err.message}</div>`;
  }
}

function renderBooks(books) {
  if (books.length === 0) {
    booksGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No books found.</div>';
    return;
  }

  booksGrid.innerHTML = books
    .map((b) => {
      const isAuthorObj = typeof b.author === 'object';
      const isCategoryObj = typeof b.category === 'object';

      const authorDisplay = isAuthorObj
        ? `<div class="author-pill">✍️ ${b.author.name} (${b.author.nationality || 'Author'})</div>`
        : `<div class="raw-id-pill"><strong>author (ObjectId):</strong> ${b.author}</div>`;

      const categoryDisplay = isCategoryObj
        ? `<span class="badge-category">${b.category.name}</span>`
        : `<span class="raw-id-pill">category: ${b.category}</span>`;

      return `
        <div class="book-card">
          <div>
            <div class="card-header">
              ${categoryDisplay}
              <span style="font-size: 11px; color: var(--text-muted);">ISBN: ${b.isbn}</span>
            </div>
            <h3 class="book-title">${b.title}</h3>
            ${authorDisplay}
            <p class="book-desc">${b.description || 'No description provided.'}</p>
          </div>

          <div class="card-footer">
            <span class="price-tag">${b.formattedPrice || '$' + b.price.toFixed(2)}</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline" onclick="showCompareModal('${b._id}')" title="Compare Raw vs Populated JSON">
                JSON Diff
              </button>
              <button class="btn btn-primary" onclick="openBookDetails('${b._id}')">
                Deep View & Reviews
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// Requirement 3: Deep Nested Population Modal (Book -> Reviews -> User)
window.openBookDetails = async function (id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}`);
    const json = await res.json();

    if (json.success) {
      selectedBook = json.data;
      document.getElementById('modalBookTitle').textContent = selectedBook.title;
      document.getElementById('modalAuthorName').textContent = selectedBook.author?.name || 'Unknown';
      document.getElementById('modalAuthorBio').textContent = selectedBook.author?.bio || '';
      document.getElementById('modalCategoryName').textContent = selectedBook.category?.name || 'General';

      // Load reviews with initial filters
      fetchBookReviews(id);
      detailModal.classList.add('active');
    }
  } catch (err) {
    alert(`Failed to load details: ${err.message}`);
  }
};

// Requirement 3: Reviews with match and options
async function fetchBookReviews(bookId) {
  const minRating = reviewFilterSelect.value;
  const sort = reviewSortSelect.value;

  const params = new URLSearchParams();
  if (minRating) params.append('minRating', minRating);
  if (sort) params.append('sort', sort);

  const listContainer = document.getElementById('modalReviewsList');
  listContainer.innerHTML = '<div style="color: var(--text-muted);">Loading reviews...</div>';

  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews?${params.toString()}`);
    const json = await res.json();

    if (json.success) {
      const reviews = json.data;
      document.getElementById('modalReviewCount').textContent = `(${reviews.length} reviews satisfying match condition)`;

      if (reviews.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--text-muted); padding: 12px 0;">No reviews match this rating filter.</div>';
        return;
      }

      listContainer.innerHTML = reviews
        .map((r) => {
          const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
          const user = r.user || {};
          return `
            <div class="review-item">
              <div class="review-user-header">
                <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}" class="user-avatar" alt="User">
                <div>
                  <div style="font-size: 13px; font-weight: 700;">${user.fullName || user.username || 'Anonymous User'} <span style="font-size: 11px; color: var(--text-muted);">(@${user.username})</span></div>
                  <div class="stars">${stars} <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${r.rating}/5)</span></div>
                </div>
              </div>
              <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">"${r.comment}"</p>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    listContainer.innerHTML = `<div style="color: var(--accent-rose);">Error: ${err.message}</div>`;
  }
}

// Requirement 3: Virtual Populate on Authors (GET /api/authors?populateBooks=true)
async function loadAuthors() {
  authorsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Fetching authors via Virtual Populate...</div>';

  try {
    const res = await fetch(`${API_BASE}/authors?populateBooks=true`);
    const json = await res.json();

    if (json.success) {
      authorsGrid.innerHTML = json.data
        .map((a) => {
          const books = a.books || [];
          return `
            <div class="book-card">
              <div>
                <div class="card-header">
                  <span class="author-pill">✍️ ${a.nationality}</span>
                  <span style="font-size: 12px; color: var(--accent-cyan); font-weight: 700;">${books.length} Books Written</span>
                </div>
                <h3 class="book-title">${a.name}</h3>
                <p class="book-desc">${a.bio || 'No biography.'}</p>
                <div style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--accent-indigo); margin-bottom: 8px;">
                    Virtual Populated Books:
                  </div>
                  <ul style="list-style: none; padding: 0;">
                    ${books.map((b) => `<li style="font-size: 12px; margin-bottom: 4px; color: #e2e8f0;">📖 <strong>${b.title}</strong> (${b.formattedPrice})</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    authorsGrid.innerHTML = `<div style="color: var(--accent-rose);">Error loading authors: ${err.message}</div>`;
  }
}

// Requirement 3: Virtual Populate on Categories
async function loadCategories() {
  categoriesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Fetching categories via Virtual Populate...</div>';

  try {
    const res = await fetch(`${API_BASE}/categories?populateBooks=true`);
    const json = await res.json();

    if (json.success) {
      categoriesGrid.innerHTML = json.data
        .map((c) => {
          const books = c.books || [];
          return `
            <div class="book-card">
              <div>
                <div class="card-header">
                  <span class="badge-category">${c.slug}</span>
                  <span style="font-size: 12px; color: var(--accent-emerald); font-weight: 700;">${books.length} Catalog Books</span>
                </div>
                <h3 class="book-title">${c.name}</h3>
                <p class="book-desc">${c.description || 'No description.'}</p>
                <div style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--accent-emerald); margin-bottom: 8px;">
                    Virtual Populated Books:
                  </div>
                  <ul style="list-style: none; padding: 0;">
                    ${books.map((b) => `<li style="font-size: 12px; margin-bottom: 4px; color: #e2e8f0;">📖 <strong>${b.title}</strong> (${b.formattedPrice})</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    categoriesGrid.innerHTML = `<div style="color: var(--accent-rose);">Error loading categories: ${err.message}</div>`;
  }
}

// Requirement 2: Compare Raw JSON vs Populated JSON
window.showCompareModal = async function (bookId) {
  try {
    const [rawRes, popRes] = await Promise.all([
      fetch(`${API_BASE}/books?populate=false`),
      fetch(`${API_BASE}/books?populate=true`),
    ]);
    const rawData = await rawRes.json();
    const popData = await popRes.json();

    const rawBook = rawData.data.find((b) => b._id === bookId) || rawData.data[0];
    const popBook = popData.data.find((b) => b._id === bookId) || popData.data[0];

    document.getElementById('rawJsonView').textContent = JSON.stringify(
      {
        _id: rawBook._id,
        title: rawBook.title,
        author: rawBook.author, // Raw ObjectId String
        category: rawBook.category, // Raw ObjectId String
        price: rawBook.price,
      },
      null,
      2
    );

    document.getElementById('popJsonView').textContent = JSON.stringify(
      {
        _id: popBook._id,
        title: popBook.title,
        author: popBook.author, // Hydrated Document Object with select fields!
        category: popBook.category, // Hydrated Document Object!
        price: popBook.price,
      },
      null,
      2
    );

    document.getElementById('compareModal').classList.add('active');
  } catch (err) {
    alert(`Comparison error: ${err.message}`);
  }
};
