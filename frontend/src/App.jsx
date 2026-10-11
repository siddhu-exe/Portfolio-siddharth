import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import FrameLines from './components/FrameLines.jsx';
import PageTransitionProvider from './components/PageTransition.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';

function LegacyProjectRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/projects/${slug}`} replace />;
}

export default function App() {
  return (
    <PageTransitionProvider>
      <SmoothScroll />
      <FrameLines />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/project/:slug" element={<LegacyProjectRedirect />} />
      </Routes>
    </PageTransitionProvider>
  );
}
