import { projects } from '../data/projects';

export default function Projects() {
  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">🚀 Projects</h1>
        <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
        <p className="text-gray-400 mb-12">A collection of things I've built and am building.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:border-cyan-700 transition-all hover:shadow-lg hover:shadow-cyan-900/30"
            >
              <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <span key={t} className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded-md font-mono">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    🐙 GitHub
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    🌐 Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
