import useMediaQuery from '../../hooks/useMediaQuery.js';
import LaptopLayout from './LaptopLayout.jsx';
import MobileLayout from './MobileLayout.jsx';
import './project.css';

/**
 * The single project-page template. `page` is the view-model from
 * buildProjectPage(); every project goes through here, only the data differs.
 * Laptop (>= 1024px) and mobile are separate trees and only one is ever mounted,
 * so their animations never run at the same time.
 */
export default function ProjectPage({ page }) {
  const isLaptop = useMediaQuery('(min-width: 1024px)');
  return isLaptop ? <LaptopLayout key="laptop" page={page} /> : <MobileLayout key="mobile" page={page} />;
}
