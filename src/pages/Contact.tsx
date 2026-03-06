const socials = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/soumyadip_karforma',
    handle: '@soumyadip_karforma',
    icon: '📸',
    color: 'hover:border-pink-500',
  },
  {
    name: 'Twitter / X',
    url: 'https://x.com/soumyadip_k',
    handle: '@soumyadip_k',
    icon: '🐦',
    color: 'hover:border-sky-500',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@soumyadip_karforma',
    handle: '@soumyadip_karforma',
    icon: '▶️',
    color: 'hover:border-red-500',
  },
  {
    name: 'Email',
    url: 'mailto:soumyadipkarforma@gmail.com',
    handle: 'soumyadipkarforma@gmail.com',
    icon: '✉️',
    color: 'hover:border-green-500',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/soumyadipkarforma',
    handle: 'soumyadipkarforma',
    icon: '🐙',
    color: 'hover:border-gray-400',
  },
];

const donations = [
  {
    name: 'Buy Me a Coffee ☕',
    url: 'https://buymeacoffee.com/soumyadipkarforma',
    desc: 'Support my work with a coffee!',
    color: 'bg-yellow-400 hover:bg-yellow-300 text-black',
  },
  {
    name: 'Patreon 🎨',
    url: 'https://patreon.com/SoumyadipKarforma',
    desc: 'Become a patron and get exclusive content.',
    color: 'bg-orange-600 hover:bg-orange-500 text-white',
  },
];

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-950 text-white pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-cyan-400">📬 Contact</h1>
        <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
        <p className="text-gray-400 mb-10 sm:mb-12 text-sm sm:text-base">
          Feel free to reach out through any of these channels!
        </p>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">🌐 Socials</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 sm:gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 transition-all ${s.color}`}
            >
              <span className="text-2xl sm:text-3xl shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm sm:text-base">{s.name}</p>
                <p className="text-gray-400 text-xs sm:text-sm truncate">{s.handle}</p>
              </div>
            </a>
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">💰 Support My Work</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {donations.map((d) => (
            <a
              key={d.name}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col gap-1.5 sm:gap-2 rounded-xl p-5 sm:p-6 font-semibold transition-colors ${d.color} shadow-lg`}
            >
              <span className="text-base sm:text-lg">{d.name}</span>
              <span className="text-xs sm:text-sm font-normal opacity-80">{d.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
