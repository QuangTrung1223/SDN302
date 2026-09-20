/**
 * BookNest Domain Types & Interfaces
 */

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
}

export interface NewBookInput {
  isbn?: string;
  title: string;
  author: string;
  category: string;
  price?: number | string;
  stock?: number | string;
}

export type CallbackFn<T> = (err: Error | null, result?: T | null) => void;
