export interface Project {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = [
  {
    title: "AI Agent Framework",
    description: "A modular AI agent framework for building autonomous systems with multi-step reasoning capabilities.",
    tech: ["Python", "TypeScript", "LangChain"],
    github: "https://github.com/soumyadipkarforma",
  },
  {
    title: "Full Stack Web App",
    description: "A full-stack web application with React frontend, Node.js backend, and PostgreSQL database.",
    tech: ["TypeScript", "React", "PostgreSQL", "Nginx"],
    github: "https://github.com/soumyadipkarforma",
  },
  {
    title: "ML Model Pipeline",
    description: "An end-to-end machine learning pipeline for data preprocessing, model training, and deployment.",
    tech: ["Python", "TensorFlow", "Pandas", "NumPy"],
    github: "https://github.com/soumyadipkarforma",
  },
  {
    title: "Linux Automation Scripts",
    description: "A collection of Bash and PowerShell scripts for automating common Linux and Windows tasks.",
    tech: ["Bash", "PowerShell", "Python"],
    github: "https://github.com/soumyadipkarforma",
  },
  {
    title: "Database Management Tool",
    description: "A GUI tool for managing MySQL and PostgreSQL databases with query optimization features.",
    tech: ["Python", "MySQL", "PostgreSQL"],
    github: "https://github.com/soumyadipkarforma",
  },
  {
    title: "Personal Website",
    description: "This very website — a React + TypeScript personal site with blog, projects, and more.",
    tech: ["TypeScript", "React", "Tailwind CSS", "Vite"],
    github: "https://github.com/soumyadipkarforma/soumyadipkarforma.github.io",
    live: "https://soumyadipkarforma.github.io",
  },
];
