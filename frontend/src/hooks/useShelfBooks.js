import { useEffect, useState } from 'react';
import { fetchProjects } from '../api.js';
import { fallbackProjects } from '../data/fallbackProjects.js';
import { selectShelfBooks } from '../data/shelfBooks.js';

/**
 * The Project Shelf's own list (published books in shelf order). Starts from the
 * offline mirror so the page renders at once, then swaps in the API list — the
 * same source Home gives the shelf — so volume, tag, spine colour and key result
 * always match the book.
 */
export default function useShelfBooks() {
  const [books, setBooks] = useState(() => selectShelfBooks(fallbackProjects));
  useEffect(() => {
    let alive = true;
    fetchProjects()
      .then((list) => alive && setBooks(selectShelfBooks(list)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return books;
}
