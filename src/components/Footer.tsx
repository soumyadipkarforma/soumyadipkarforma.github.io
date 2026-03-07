import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-8 mt-auto glass">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="gradient-text font-semibold text-sm mb-1"
        >
          © {new Date().getFullYear()} Soumyadip Karforma
        </motion.p>
        <p className="text-gray-600 text-xs">
          Built with React + TypeScript + Framer Motion ·{' '}
          <a
            href="https://github.com/soumyadipkarforma/soumyadipkarforma.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-400 transition-colors"
          >
            View Source
          </a>
        </p>
      </div>
    </footer>
  );
}
