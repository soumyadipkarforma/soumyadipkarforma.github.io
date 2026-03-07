import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Lab from './pages/Lab';

/** Subtle scanline sweep (decorative) */
function Scanline() {
  return <div className="scanline" aria-hidden="true" />;
}

/** Three drifting aurora gradient orbs that live behind all content */
function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* orb 1 — cyan, top-left */}
      <div
        className="aurora-orb w-[600px] h-[600px] -top-40 -left-40"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.35) 0%, transparent 70%)',
          animation: 'aurora-1 22s ease-in-out infinite',
        }}
      />
      {/* orb 2 — violet, bottom-right */}
      <div
        className="aurora-orb w-[700px] h-[700px] -bottom-60 -right-40"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)',
          animation: 'aurora-2 28s ease-in-out infinite',
        }}
      />
      {/* orb 3 — pink/fuchsia, center-right */}
      <div
        className="aurora-orb w-[500px] h-[500px] top-1/2 right-0"
        style={{
          background: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%)',
          animation: 'aurora-3 18s ease-in-out infinite',
        }}
      />
      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -12, filter: 'blur(4px)' },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/"           element={<Home />} />
          <Route path="/about"      element={<About />} />
          <Route path="/projects"   element={<Projects />} />
          <Route path="/blog"       element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="/lab"        element={<Lab />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen relative" style={{ background: '#050510', fontFamily: "'Inter', sans-serif" }}>
        <AuroraBackground />
        <Scanline />
        <Navbar />
        <div className="flex-1 relative z-10">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
