import { Link } from 'react-router-dom';

const socials = [
  { name: 'GitHub', url: 'https://github.com/soumyadipkarforma', icon: '🐙' },
  { name: 'Instagram', url: 'https://instagram.com/soumyadip_karforma', icon: '📸' },
  { name: 'Twitter / X', url: 'https://x.com/soumyadip_k', icon: '🐦' },
  { name: 'YouTube', url: 'https://youtube.com/@soumyadip_karforma', icon: '▶️' },
  { name: 'Email', url: 'mailto:soumyadipkarforma@gmail.com', icon: '✉️' },
];

const donations = [
  { name: 'Buy Me a Coffee', url: 'https://buymeacoffee.com/soumyadipkarforma', color: 'bg-yellow-400 text-black hover:bg-yellow-300' },
  { name: 'Patreon', url: 'https://patreon.com/SoumyadipKarforma', color: 'bg-orange-600 text-white hover:bg-orange-500' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <div className="mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            👨‍💻
          </div>
          <h1 className="text-5xl font-bold mb-2">
            Hi, I'm <span className="text-cyan-400">Soumyadip</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            AI Agent Developer · Full Stack Engineer · Linux & Database Enthusiast
          </p>
        </div>

        <p className="text-gray-400 max-w-lg text-center mb-8 leading-relaxed">
          I build intelligent systems, web applications, and automation tools.
          Currently exploring the frontier of AI agents and scalable systems.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <Link
            to="/projects"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
          >
            View Projects
          </Link>
          <Link
            to="/blog"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-colors"
          >
            Read Blog
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-colors"
          >
            Contact Me
          </Link>
        </div>

        {/* Socials */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 text-sm text-gray-300 hover:text-white transition-all"
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </a>
          ))}
        </div>

        {/* Donations */}
        <div className="flex flex-wrap gap-3 justify-center">
          <p className="w-full text-center text-gray-500 text-sm mb-1">Support my work 💰</p>
          {donations.map((d) => (
            <a
              key={d.name}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${d.color}`}
            >
              {d.name}
            </a>
          ))}
        </div>
      </section>

      {/* GitHub Stats */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-cyan-400">📊 GitHub Stats</h2>
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://github-readme-stats.vercel.app/api?username=soumyadipkarforma&theme=dark&hide_border=false&include_all_commits=false&count_private=false"
            alt="GitHub Stats"
            className="max-w-full rounded-lg"
          />
          <img
            src="https://nirzak-streak-stats.vercel.app/?user=soumyadipkarforma&theme=dark&hide_border=false"
            alt="GitHub Streak"
            className="max-w-full rounded-lg"
          />
          <img
            src="https://github-readme-stats.vercel.app/api/top-langs/?username=soumyadipkarforma&theme=dark&hide_border=false&include_all_commits=false&count_private=false&layout=compact"
            alt="Top Languages"
            className="max-w-full rounded-lg"
          />
        </div>
      </section>

      {/* Trophy */}
      <section className="py-8 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-cyan-400">🏆 GitHub Trophies</h2>
        <img
          src="https://github-profile-trophy.vercel.app/?username=soumyadipkarforma&theme=radical&no-frame=false&no-bg=false&margin-w=4"
          alt="GitHub Trophies"
          className="max-w-full rounded-lg mx-auto"
        />
      </section>
    </main>
  );
}
