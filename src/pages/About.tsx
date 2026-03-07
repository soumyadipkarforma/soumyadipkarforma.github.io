import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useGitHubOrgs, type GitHubOrg } from '../hooks/useGitHubOrgs';
import config from '../config';

const techStack = [
  { name: 'C++',          color: 'bg-blue-700' },
  { name: 'C#',           color: 'bg-green-700' },
  { name: 'CSS3',         color: 'bg-blue-500' },
  { name: 'Java',         color: 'bg-orange-600' },
  { name: 'HTML5',        color: 'bg-red-600' },
  { name: 'JavaScript',   color: 'bg-yellow-500 text-black' },
  { name: 'TypeScript',   color: 'bg-blue-600' },
  { name: 'Python',       color: 'bg-blue-800' },
  { name: 'Bash Script',  color: 'bg-gray-700' },
  { name: 'PowerShell',   color: 'bg-blue-900' },
  { name: 'Nginx',        color: 'bg-green-600' },
  { name: 'MySQL',        color: 'bg-blue-700' },
  { name: 'PostgreSQL',   color: 'bg-indigo-700' },
  { name: 'TensorFlow',   color: 'bg-orange-500' },
  { name: 'PyTorch',      color: 'bg-red-700' },
  { name: 'Keras',        color: 'bg-red-800' },
  { name: 'Pandas',       color: 'bg-indigo-600' },
  { name: 'NumPy',        color: 'bg-cyan-800' },
  { name: 'Matplotlib',   color: 'bg-gray-600' },
  { name: 'Plotly',       color: 'bg-indigo-500' },
  { name: 'Vercel',       color: 'bg-gray-900 border border-gray-600' },
  { name: 'Render',       color: 'bg-teal-700' },
  { name: 'Canva',        color: 'bg-teal-500' },
];

const whatIDo = [
  { icon: '🤖', title: 'AI & Machine Learning',  desc: 'Building AI agents, training ML models with TensorFlow/PyTorch, and deploying intelligent systems.' },
  { icon: '🌐', title: 'Full Stack Development',  desc: 'Crafting modern web apps with React/TypeScript frontends and robust backend APIs.' },
  { icon: '🐧', title: 'Linux & DevOps',          desc: 'Automating infrastructure, managing servers with Nginx, and scripting in Bash.' },
  { icon: '🗄️', title: 'Database Engineering',    desc: 'Designing and optimizing relational databases with MySQL and PostgreSQL.' },
];

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const orgsState = useGitHubOrgs(config.githubUsername);

  return (
    <main className="min-h-screen text-white pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Page header */}
        <Section>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">💫 About Me</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-500 mb-6 sm:mb-8 rounded-full" />
        </Section>

        {/* Bio card */}
        <Section className="mb-8 sm:mb-10">
          <div className="glass border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              I am currently working with <span className="text-cyan-400 font-semibold">AI agents</span> and{' '}
              <span className="text-cyan-400 font-semibold">full-stack web development</span> along with{' '}
              <span className="text-cyan-400 font-semibold">Linux</span> and{' '}
              <span className="text-cyan-400 font-semibold">databases</span>.
            </p>
            <p className="text-gray-400 mt-4 leading-relaxed text-sm sm:text-base">
              I'm passionate about building intelligent systems that solve real-world problems.
              My journey spans from low-level programming in C++ to high-level machine learning pipelines,
              from database optimization to cloud deployments. I love automating everything and exploring
              the cutting edge of AI research.
            </p>
          </div>
        </Section>

        {/* Tech Stack */}
        <Section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">💻 Tech Stack</span>
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.03 }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white ${tech.color}`}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </Section>

        {/* What I Do */}
        <Section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">🎯 What I Do</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {whatIDo.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4, borderColor: 'rgba(0,212,255,0.4)' }}
                transition={{ duration: 0.2 }}
                className="glass border border-white/10 rounded-xl p-5 sm:p-6"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* GitHub Organizations */}
        <Section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">🏢 GitHub Organizations</span>
          </h2>

          {orgsState.status === 'loading' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer glass border border-white/10 rounded-xl p-5 h-28" />
              ))}
            </div>
          )}

          {orgsState.status === 'error' && (
            <p className="text-gray-500 text-sm">
              Could not load organizations.{' '}
              <a
                href={`https://github.com/${config.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                View on GitHub →
              </a>
            </p>
          )}

          {orgsState.status === 'success' && orgsState.data.length === 0 && (
            <p className="text-gray-500 text-sm">No public organizations found.</p>
          )}

          {orgsState.status === 'success' && orgsState.data.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgsState.data.map((org: GitHubOrg, i) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.07 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="glass border border-white/10 hover:border-cyan-500/40 rounded-xl p-4 sm:p-5 flex flex-col gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={org.avatar_url}
                      alt={org.login}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <a
                        href={`https://github.com/${org.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-cyan-400 transition-colors text-sm sm:text-base break-all"
                      >
                        {org.login}
                      </a>
                    </div>
                  </div>
                  {org.description && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{org.description}</p>
                  )}
                  <a
                    href={`https://github.com/${org.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors mt-auto"
                  >
                    View on GitHub →
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </main>
  );
}
