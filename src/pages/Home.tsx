import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import config from '../config';

const socials = [
  { name: 'GitHub',      url: 'https://github.com/soumyadipkarforma',         icon: '🐙', glow: 'hover:shadow-white/20' },
  { name: 'Instagram',   url: 'https://instagram.com/soumyadip_karforma',      icon: '📸', glow: 'hover:shadow-pink-500/30' },
  { name: 'Twitter / X', url: 'https://x.com/soumyadip_k',                     icon: '🐦', glow: 'hover:shadow-sky-500/30' },
  { name: 'YouTube',     url: 'https://youtube.com/@soumyadip_karforma',        icon: '▶️', glow: 'hover:shadow-red-500/30' },
  { name: 'Email',       url: 'mailto:soumyadipkarforma@gmail.com',             icon: '✉️', glow: 'hover:shadow-green-500/30' },
];

const donations = [
  { name: 'Buy Me a Coffee ☕', url: 'https://buymeacoffee.com/soumyadipkarforma', color: 'bg-yellow-400 text-black hover:bg-yellow-300' },
  { name: 'Patreon 🎨',        url: 'https://patreon.com/SoumyadipKarforma',      color: 'bg-orange-600 text-white hover:bg-orange-500' },
  { name: 'GitHub Sponsor 💖', url: 'https://github.com/sponsors/soumyadipkarforma', color: 'bg-pink-600 text-white hover:bg-pink-500' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  const statsRef  = useRef(null);
  const trophyRef = useRef(null);
  const statsInView  = useInView(statsRef,  { once: true, margin: '-80px' });
  const trophyInView = useInView(trophyRef, { once: true, margin: '-80px' });

  return (
    <main className="min-h-screen text-white">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 pt-16 sm:pt-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full max-w-2xl"
        >
          {/* Avatar */}
          <motion.div variants={item} className="mb-6 sm:mb-8">
            <div
              style={{
                background: 'conic-gradient(from 0deg, #00d4ff, #8b5cf6, #f472b6, #00d4ff)',
                padding: 3,
                borderRadius: '50%',
                animation: 'border-spin 3s linear infinite',
                display: 'inline-block',
              }}
            >
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl"
                style={{
                  background: '#050510',
                  boxShadow: '0 0 30px rgba(0,212,255,0.4)',
                }}
              >
                👨‍💻
              </div>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3 leading-tight"
          >
            Hi, I&apos;m <span className="gradient-text">Soumyadip</span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div variants={item} className="mb-4 h-8 flex items-center justify-center">
            <TypeAnimation
              sequence={[
                'AI Agent Developer',   2000,
                'Full Stack Engineer',  2000,
                'Linux Enthusiast',     2000,
                'Database Architect',   2000,
                'Open Source Builder',  2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-xl text-cyan-400 font-mono"
            />
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={item}
            className="text-gray-400 text-sm sm:text-base max-w-lg text-center mb-8 leading-relaxed"
          >
            I build intelligent systems, web applications, and automation tools.
            Currently exploring the frontier of AI agents and scalable systems.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 w-full"
          >
            {[
              { to: '/projects', label: 'View Projects',  cls: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/30' },
              { to: '/lab',      label: '🔭 The Lab',      cls: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30' },
              { to: '/blog',     label: 'Read Blog',       cls: 'glass border border-white/20 hover:border-cyan-400/50 text-white' },
              { to: '/contact',  label: 'Contact Me',      cls: 'glass border border-white/20 hover:border-cyan-400/50 text-white' },
            ].map(({ to, label, cls }) => (
              <motion.div key={to} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={to}
                  className={`block px-5 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${cls}`}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Pills */}
          <motion.div
            variants={item}
            className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8"
          >
            {socials.map((s) => (
              <motion.a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass border border-white/10 hover:border-cyan-400/40 rounded-full text-xs sm:text-sm text-gray-300 hover:text-white transition-all shadow-lg ${s.glow}`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Donations */}
          <motion.div variants={item} className="flex flex-col items-center gap-3 w-full">
            <p className="text-gray-500 text-xs sm:text-sm">Support my work 💰</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {donations.map((d) => (
                <motion.a
                  key={d.name}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-lg ${d.color}`}
                >
                  {d.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── GitHub Stats ── */}
      <section
        ref={statsRef}
        className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="gradient-text">📊 GitHub Stats</span>
          </h2>
          <div className="w-12 h-0.5 bg-cyan-500 mx-auto mb-8 rounded-full" />
          <div className="flex flex-col items-center gap-4">
            <img
              src={`https://github-readme-stats.vercel.app/api?username=${config.githubUsername}&theme=dark&hide_border=false&include_all_commits=false&count_private=false`}
              alt="GitHub Stats"
              className="w-full max-w-md rounded-lg"
            />
            <img
              src={`https://nirzak-streak-stats.vercel.app/?user=${config.githubUsername}&theme=dark&hide_border=false`}
              alt="GitHub Streak"
              className="w-full max-w-md rounded-lg"
            />
            <img
              src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${config.githubUsername}&theme=dark&hide_border=false&include_all_commits=false&count_private=false&layout=compact`}
              alt="Top Languages"
              className="w-full max-w-xs rounded-lg"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Trophies ── */}
      <section
        ref={trophyRef}
        className="py-6 sm:py-8 px-4 sm:px-6 max-w-4xl mx-auto text-center pb-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={trophyInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="gradient-text">🏆 Trophies</span>
          </h2>
          <div className="w-12 h-0.5 bg-cyan-500 mx-auto mb-8 rounded-full" />
          <div className="overflow-x-auto">
            <img
              src={`https://github-profile-trophy.vercel.app/?username=${config.githubUsername}&theme=radical&no-frame=false&no-bg=false&margin-w=4`}
              alt="GitHub Trophies"
              className="max-w-full rounded-lg mx-auto"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

