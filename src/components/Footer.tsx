export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Soumyadip Karforma. Built with React + TypeScript.</p>
        <p className="mt-1">
          <a
            href="https://github.com/soumyadipkarforma/soumyadipkarforma.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            View Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
