const techStack = [
  { name: 'C++', color: 'bg-blue-700' },
  { name: 'C#', color: 'bg-green-700' },
  { name: 'CSS3', color: 'bg-blue-500' },
  { name: 'Java', color: 'bg-orange-600' },
  { name: 'HTML5', color: 'bg-red-600' },
  { name: 'JavaScript', color: 'bg-yellow-500 text-black' },
  { name: 'TypeScript', color: 'bg-blue-600' },
  { name: 'Python', color: 'bg-blue-800' },
  { name: 'Bash Script', color: 'bg-gray-700' },
  { name: 'PowerShell', color: 'bg-blue-900' },
  { name: 'Nginx', color: 'bg-green-600' },
  { name: 'MySQL', color: 'bg-blue-700' },
  { name: 'PostgreSQL', color: 'bg-indigo-700' },
  { name: 'TensorFlow', color: 'bg-orange-500' },
  { name: 'PyTorch', color: 'bg-red-700' },
  { name: 'Keras', color: 'bg-red-800' },
  { name: 'Pandas', color: 'bg-indigo-600' },
  { name: 'NumPy', color: 'bg-cyan-800' },
  { name: 'Matplotlib', color: 'bg-gray-600' },
  { name: 'Plotly', color: 'bg-indigo-500' },
  { name: 'Vercel', color: 'bg-gray-900 border border-gray-600' },
  { name: 'Render', color: 'bg-teal-700' },
  { name: 'Canva', color: 'bg-teal-500' },
];

export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 px-4">
      <div className="max-w-4xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">💫 About Me</h1>
        <div className="w-16 h-1 bg-cyan-500 mb-8 rounded-full" />

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-10 shadow-xl">
          <p className="text-lg text-gray-300 leading-relaxed">
            I am currently working with <span className="text-cyan-400 font-semibold">AI agents</span> and{' '}
            <span className="text-cyan-400 font-semibold">full-stack web development</span> along with{' '}
            <span className="text-cyan-400 font-semibold">Linux</span> and{' '}
            <span className="text-cyan-400 font-semibold">databases</span>.
          </p>
          <p className="text-gray-400 mt-4 leading-relaxed">
            I'm passionate about building intelligent systems that solve real-world problems.
            My journey spans from low-level programming in C++ to high-level machine learning pipelines,
            from database optimization to cloud deployments. I love automating everything and exploring
            the cutting edge of AI research.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-cyan-400">💻 Tech Stack</h2>
        <div className="flex flex-wrap gap-3 mb-12">
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6 text-cyan-400">🎯 What I Do</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: '🤖',
              title: 'AI & Machine Learning',
              desc: 'Building AI agents, training ML models with TensorFlow/PyTorch, and deploying intelligent systems.',
            },
            {
              icon: '🌐',
              title: 'Full Stack Development',
              desc: 'Crafting modern web apps with React/TypeScript frontends and robust backend APIs.',
            },
            {
              icon: '🐧',
              title: 'Linux & DevOps',
              desc: 'Automating infrastructure, managing servers with Nginx, and scripting in Bash.',
            },
            {
              icon: '🗄️',
              title: 'Database Engineering',
              desc: 'Designing and optimizing relational databases with MySQL and PostgreSQL.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-800 transition-colors">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
