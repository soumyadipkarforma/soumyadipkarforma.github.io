import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralNetwork     = lazy(() => import('./lab/NeuralNetwork'));
const ParticlePhysics   = lazy(() => import('./lab/ParticlePhysics'));
const FourierSynth      = lazy(() => import('./lab/FourierSynth'));
const FractalExplorer   = lazy(() => import('./lab/FractalExplorer'));
const GameOfLife        = lazy(() => import('./lab/GameOfLife'));
const SortingVisualizer = lazy(() => import('./lab/SortingVisualizer'));
const SolarSystem       = lazy(() => import('./lab/SolarSystem'));
const GalaxyFormation   = lazy(() => import('./lab/GalaxyFormation'));
const BlackHole         = lazy(() => import('./lab/BlackHole'));
const NBodyGravity      = lazy(() => import('./lab/NBodyGravity'));
const AsteroidBelt      = lazy(() => import('./lab/AsteroidBelt'));
const DoubleSlit        = lazy(() => import('./lab/DoubleSlit'));
const LorentzAttractor  = lazy(() => import('./lab/LorentzAttractor'));
const ReactionDiffusion = lazy(() => import('./lab/ReactionDiffusion'));
const Boids             = lazy(() => import('./lab/Boids'));

interface Experiment {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tags: string[];
  color: string;
  component: React.ReactNode;
}

const experiments: Experiment[] = [
  {
    id: 'neural',
    title: 'Neural Network',
    subtitle: 'Watch signals fire through a live deep net',
    icon: '🧠',
    tags: ['AI', 'Deep Learning', 'Backprop'],
    color: 'from-cyan-500/20 to-blue-600/10',
    component: <NeuralNetwork />,
  },
  {
    id: 'particles',
    title: 'Particle Physics',
    subtitle: 'Gravity & Coulomb forces in real time',
    icon: '⚛️',
    tags: ['Physics', 'Simulation', 'Forces'],
    color: 'from-violet-500/20 to-indigo-600/10',
    component: <ParticlePhysics />,
  },
  {
    id: 'fourier',
    title: 'Fourier Synthesizer',
    subtitle: 'Build any wave from sine harmonics',
    icon: '〰️',
    tags: ['Signal Processing', 'Math', 'Waves'],
    color: 'from-pink-500/20 to-rose-600/10',
    component: <FourierSynth />,
  },
  {
    id: 'fractal',
    title: 'Mandelbrot Explorer',
    subtitle: 'Infinite complexity from a simple equation',
    icon: '🌀',
    tags: ['Fractals', 'Complex Numbers', 'Zoom'],
    color: 'from-emerald-500/20 to-teal-600/10',
    component: <FractalExplorer />,
  },
  {
    id: 'life',
    title: "Conway's Game of Life",
    subtitle: 'Emergent life from 3 simple rules',
    icon: '🔬',
    tags: ['Cellular Automata', 'Emergence', 'Evolution'],
    color: 'from-amber-500/20 to-yellow-600/10',
    component: <GameOfLife />,
  },
  {
    id: 'sort',
    title: 'Algorithm Visualizer',
    subtitle: 'See sorting algorithms race in real time',
    icon: '📊',
    tags: ['Algorithms', 'CS', 'Complexity'],
    color: 'from-red-500/20 to-orange-600/10',
    component: <SortingVisualizer />,
  },
  {
    id: 'solar',
    title: 'Solar System',
    subtitle: 'All 8 planets orbiting the Sun in real time',
    icon: '🪐',
    tags: ['Astronomy', 'Physics', 'Orbits'],
    color: 'from-yellow-500/20 to-orange-600/10',
    component: <SolarSystem />,
  },
  {
    id: 'galaxy',
    title: 'Galaxy Formation',
    subtitle: 'Spiral galaxy with differential rotation',
    icon: '🌌',
    tags: ['Astrophysics', 'Simulation', 'Gravity'],
    color: 'from-violet-600/20 to-purple-800/10',
    component: <GalaxyFormation />,
  },
  {
    id: 'blackhole',
    title: 'Black Hole',
    subtitle: 'Accretion disk, relativistic jets & lensing',
    icon: '⚫',
    tags: ['Relativity', 'Astrophysics', 'GR'],
    color: 'from-gray-800/40 to-black/40',
    component: <BlackHole />,
  },
  {
    id: 'nbody',
    title: 'N-Body Gravity',
    subtitle: 'Mutual gravitational attraction & collisions',
    icon: '🌑',
    tags: ['Physics', 'Gravity', 'Chaos'],
    color: 'from-blue-600/20 to-indigo-800/10',
    component: <NBodyGravity />,
  },
  {
    id: 'asteroids',
    title: 'Asteroid Belt',
    subtitle: 'Kirkwood gaps, comets & mining explosions',
    icon: '☄️',
    tags: ['Astronomy', 'Orbital Mechanics', 'Simulation'],
    color: 'from-stone-600/20 to-gray-700/10',
    component: <AsteroidBelt />,
  },
  {
    id: 'doubleslit',
    title: 'Double-Slit Experiment',
    subtitle: 'Quantum interference patterns building live',
    icon: '🌊',
    tags: ['Quantum Mechanics', 'Wave Optics', 'Physics'],
    color: 'from-cyan-600/20 to-blue-800/10',
    component: <DoubleSlit />,
  },
  {
    id: 'lorenz',
    title: 'Lorenz Attractor',
    subtitle: 'Chaos theory — the butterfly effect in 3D',
    icon: '🦋',
    tags: ['Chaos Theory', 'Differential Equations', 'Math'],
    color: 'from-pink-600/20 to-rose-800/10',
    component: <LorentzAttractor />,
  },
  {
    id: 'reaction',
    title: 'Reaction Diffusion',
    subtitle: 'Gray-Scott patterns: coral, spots, stripes',
    icon: '🧬',
    tags: ['Chemistry', 'Pattern Formation', 'Biology'],
    color: 'from-teal-600/20 to-cyan-800/10',
    component: <ReactionDiffusion />,
  },
  {
    id: 'boids',
    title: 'Boids Flocking',
    subtitle: 'Emergent flocking from 3 local rules',
    icon: '🐦',
    tags: ['AI', 'Emergence', 'Flocking'],
    color: 'from-green-600/20 to-emerald-800/10',
    component: <Boids />,
  },
];

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-40 gap-3 text-gray-500">
      <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      Loading experiment…
    </div>
  );
}

export default function Lab() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = experiments.find(e => e.id === activeId);

  return (
    <main className="min-h-screen text-white pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl sm:text-4xl">🔭</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight gradient-text">The Lab</h1>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-4" />
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Fifteen interactive scientific experiments — pure code, zero plugins. 
            Click any experiment to open it full-width. Every simulation runs entirely in your browser.
          </p>
        </motion.div>

        {/* Experiment cards grid */}
        <AnimatePresence mode="wait">
          {!activeId && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            >
              {experiments.map((exp, i) => (
                <motion.button
                  key={exp.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveId(exp.id)}
                  className={`text-left p-6 rounded-2xl glass border border-white/10 hover:border-white/20 bg-gradient-to-br ${exp.color} transition-all group relative overflow-hidden`}
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08), transparent 70%)' }} />

                  <div className="text-4xl mb-4">{exp.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{exp.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{exp.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-full font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-5 text-cyan-500/50 group-hover:text-cyan-400 transition-colors text-sm font-medium">
                    Open →
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Full-width experiment view */}
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-5"
            >
              {/* Back + title bar */}
              <div className="flex items-center gap-4 flex-wrap">
                <motion.button
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveId(null)}
                  className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  ← All Experiments
                </motion.button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{active.icon}</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{active.title}</h2>
                </div>
                <p className="text-gray-500 text-sm hidden sm:block">{active.subtitle}</p>
                {/* Jump to other experiments */}
                <div className="ml-auto hidden sm:flex gap-1">
                  {experiments.filter(e => e.id !== active.id).map(e => (
                    <motion.button
                      key={e.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveId(e.id)}
                      title={e.title}
                      className="w-9 h-9 rounded-xl glass border border-white/10 hover:border-white/20 text-lg transition-all flex items-center justify-center"
                    >
                      {e.icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Experiment canvas */}
              <div
                className={`rounded-2xl glass border border-white/10 p-4 sm:p-6 bg-gradient-to-br ${active.color}`}
                style={{ minHeight: 480 }}
              >
                <Suspense fallback={<LoadingFallback />}>
                  <div className="h-full" style={{ minHeight: 440 }}>
                    {active.component}
                  </div>
                </Suspense>
              </div>

              {/* Mobile jump bar */}
              <div className="flex sm:hidden gap-2 justify-center flex-wrap">
                {experiments.filter(e => e.id !== active.id).map(e => (
                  <button key={e.id} onClick={() => setActiveId(e.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs text-gray-400 hover:text-white transition-colors">
                    {e.icon} {e.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
