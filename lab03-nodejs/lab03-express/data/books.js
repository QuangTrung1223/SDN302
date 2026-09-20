/**
 * In-Memory Data Store for BookNest Online Bookstore (SDN302 Lab 03)
 */

export const ALLOWED_CATEGORIES = [
  'IT',
  'Business',
  'Literature',
  'Fiction',
  'Science'
];

let books = [
  {
    id: 1,
    isbn: '978-0132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'IT',
    price: 35.99,
    stock: 15
  },
  {
    id: 2,
    isbn: '978-0201616224',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    category: 'IT',
    price: 42.5,
    stock: 20
  },
  {
    id: 3,
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'IT',
    price: 49.99,
    stock: 10
  },
  {
    id: 4,
    isbn: '978-0804139298',
    title: 'Zero to One',
    author: 'Peter Thiel, Blake Masters',
    category: 'Business',
    price: 22.0,
    stock: 25
  },
  {
    id: 5,
    isbn: '978-0743273565',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Literature',
    price: 15.5,
    stock: 30
  },
  {
    id: 6,
    isbn: '978-4422890283',
    title: 'Node.js Design Patterns',
    author: 'Mario Casciaro',
    category: 'IT',
    price: 44.99,
    stock: 8
  },
  {
    id: 7,
    isbn: '978-6370239806',
    title: 'Node.js TypeScript Patterns',
    author: 'Mario Casciaro',
    category: 'IT',
    price: 49.99,
    stock: 12
  }
];

/**
 * Get all books
 * @returns {Array} List of all books
 */
export const getAllBooks = () => {
  return [...books];
};

/**
 * Get book by ID
 * @param {number} id
 * @returns {Object|null}
 */
export const getBookById = (id) => {
  const numericId = Number(id);
  const book = books.find((b) => b.id === numericId);
  return book ? { ...book } : null;
};

/**
 * Create a new book with auto-generated ID
 * @param {Object} bookData
 * @returns {Object} Newly created book
 */
export const createBook = (bookData) => {
  const nextId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
  const newBook = {
    id: nextId,
    isbn: bookData.isbn || `978-000000000${nextId}`,
    title: bookData.title.trim(),
    author: bookData.author ? bookData.author.trim() : 'Unknown Author',
    category: bookData.category,
    price: parseFloat(bookData.price),
    stock: bookData.stock !== undefined ? parseInt(bookData.stock, 10) : 0
  };

  books.push(newBook);
  return { ...newBook };
};

/**
 * Update an existing book
 * @param {number} id
 * @param {Object} updateData
 * @returns {Object|null} Updated book or null if not found
 */
export const updateBook = (id, updateData) => {
  const numericId = Number(id);
  const index = books.findIndex((b) => b.id === numericId);
  if (index === -1) {
    return null;
  }

  const existing = books[index];
  const updatedBook = {
    ...existing,
    ...(updateData.title && { title: updateData.title.trim() }),
    ...(updateData.author && { author: updateData.author.trim() }),
    ...(updateData.category && { category: updateData.category }),
    ...(updateData.price !== undefined && { price: parseFloat(updateData.price) }),
    ...(updateData.stock !== undefined && { stock: parseInt(updateData.stock, 10) }),
    ...(updateData.isbn && { isbn: updateData.isbn.trim() })
  };

  books[index] = updatedBook;
  return { ...updatedBook };
};

/**
 * Delete a book by ID
 * @param {number} id
 * @returns {Object|null} Deleted book or null if not found
 */
export const deleteBook = (id) => {
  const numericId = Number(id);
  const index = books.findIndex((b) => b.id === numericId);
  if (index === -1) {
    return null;
  }

  const [deleted] = books.splice(index, 1);
  return deleted;
};
