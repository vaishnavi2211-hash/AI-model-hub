import { Brain, Github, Globe, Rocket, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  { icon: Rocket, title: "Innovation First", desc: "Pushing boundaries in AI model discovery and deployment." },
  { icon: Shield, title: "Open & Transparent", desc: "All models are documented with clear benchmarks and limitations." },
  { icon: Users, title: "Community Driven", desc: "Built by researchers and engineers for the global AI community." },
];

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              About <span className="gradient-text">ModelHub</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ModelHub is an open platform for discovering, testing, and deploying machine learning models. We make AI accessible to developers, researchers, and businesses worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-xl p-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite", "Shadcn/UI"].map((tech) => (
                <span key={tech} className="px-4 py-2 rounded-lg bg-muted text-sm font-medium">{tech}</span>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-4 w-4" /> Website
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
