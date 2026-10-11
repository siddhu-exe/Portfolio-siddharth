import { usePageTransition } from '../PageTransition.jsx';

// Plain left-clicks go through the book-cover transition; modified clicks keep native behaviour.
export const onPlainClick = (fn) => (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  fn();
};

export default function useProjectNav() {
  const transitionTo = usePageTransition();
  return {
    goBack: () =>
      transitionTo('/', { color: '#171717', title: 'Back to the Library', category: 'The Library', landAt: 'shelf' }),
    goTo: (book) =>
      book && transitionTo(`/projects/${book.slug}`, { color: book.spineColor, title: book.title, category: book.category }),
  };
}
