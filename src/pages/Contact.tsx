import { motion, type Variants } from 'framer-motion';

const socials = [
  { name: 'Instagram',   url: 'https://instagram.com/soumyadip_karforma',      handle: '@soumyadip_karforma',        icon: '📸', glowColor: 'rgba(236,72,153,0.35)' },
  { name: 'Twitter / X', url: 'https://x.com/soumyadip_k',                     handle: '@soumyadip_k',               icon: '🐦', glowColor: 'rgba(14,165,233,0.35)' },
  { name: 'YouTube',     url: 'https://youtube.com/@soumyadip_karforma',        handle: '@soumyadip_karforma',        icon: '▶️', glowColor: 'rgba(239,68,68,0.35)' },
  { name: 'Email',       url: 'mailto:soumyadipkarforma@gmail.com',             handle: 'soumyadipkarforma@gmail.com',icon: '✉️', glowColor: 'rgba(34,197,94,0.35)' },
  { name: 'GitHub',      url: 'https://github.com/soumyadipkarforma',           handle: 'soumyadipkarforma',          icon: '🐙', glowColor: 'rgba(255,255,255,0.15)' },
];

const donations = [
  { name: 'Buy Me a Coffee ☕', url: 'https://buymeacoffee.com/soumyadipkarforma', desc: 'Support my work with a coffee!',          gradient: 'from-yellow-400 to-amber-500 text-black' },
  { name: 'Patreon 🎨',        url: 'https://patreon.com/SoumyadipKarforma',      desc: 'Become a patron and get exclusive content.', gradient: 'from-orange-500 to-red-600 text-white' },
  { name: 'GitHub Sponsor 💖', url: 'https://github.com/sponsors/soumyadipkarforma', desc: 'Sponsor me directly on GitHub.',          gradient: 'from-pink-500 to-rose-600 text-white' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Contact() {
  return (
    <main className="min-h-screen text-white pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">📬 Contact</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
          <p className="text-gray-400 mb-10 sm:mb-12 text-sm sm:text-base">
            Feel free to reach out through any of these channels!
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h2 variants={item} className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
            🌐 Socials
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
            {socials.map((s) => (
              <motion.a
                key={s.name}
                variants={item}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, borderColor: s.glowColor }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 sm:gap-4 glass border border-white/10 rounded-xl p-4 sm:p-5 transition-all hover:shadow-lg"
              >
                <span className="text-2xl sm:text-3xl shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm sm:text-base">{s.name}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{s.handle}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.h2 variants={item} className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
            💰 Support My Work
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {donations.map((d) => (
              <motion.a
                key={d.name}
                variants={item}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col gap-1.5 sm:gap-2 rounded-xl p-5 sm:p-6 font-semibold transition-all shadow-lg bg-gradient-to-br ${d.gradient}`}
              >
                <span className="text-base sm:text-lg">{d.name}</span>
                <span className="text-xs sm:text-sm font-normal opacity-80">{d.desc}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
