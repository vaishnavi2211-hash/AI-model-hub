import { Link } from "react-router-dom";
import { ArrowRight, Brain, Cpu, Zap, Layers, Sparkles, TrendingUp, Users, Download, Crown } from "lucide-react";
import { ModelCard } from "@/components/ModelCard";
import { models } from "@/lib/models";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Brain, title: "State-of-the-Art Models", desc: "Access cutting-edge AI models across text, image, and audio domains." },
  { icon: Zap, title: "Instant Playground", desc: "Test any model with custom prompts in our interactive playground." },
  { icon: Cpu, title: "API-Ready", desc: "Production-ready endpoints for seamless integration into your stack." },
  { icon: Layers, title: "Multi-Modal", desc: "Combine text, vision, and audio models for complex AI pipelines." },
];


export default function Index() {
  const { user } = useAuth();
  const featuredModels = models.filter((m) => m.isFeatured).slice(0, 3);
  const trendingModels = models.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-36 text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> The #1 Open AI Model Platform
            </div>
            <h1 className="mb-6">
              Explore Powerful <span className="highlight">AI Models</span>
            </h1>
            <p className="mx-auto max-w-2xl mb-10">
              Generate text, create images, and interact with AI tools in one unified hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/models" className="primary-btn">
                Explore Models <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link to="/signup" className="secondary-btn">
                  Get Started Free
                </Link>
              )}
              {user && (
                <Link to="/playground" className="secondary-btn">
                  Open Playground
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>


      {/* Featured Models */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-warning" />
            <h2 className="text-2xl md:text-3xl font-display font-bold">Featured Models</h2>
          </div>
          <p className="text-muted-foreground mb-8">Hand-picked top models for you</p>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredModels.map((model, i) => (
              <motion.div 
                key={model.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
              >
                <ModelCard model={model} index={i} featured />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Why ModelHub?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to discover, test, and deploy AI models</p>
          </div>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
                }}
                className="rounded-xl p-6 border border-border bg-card hover:border-primary/30 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Models</h2>
              </div>
              <p className="text-muted-foreground">Most popular models this week</p>
            </div>
            <Link to="/models" className="secondary-btn text-sm">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {trendingModels.map((model, i) => (
              <motion.div
                key={model.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
              >
                <ModelCard model={model} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl p-12 text-center border border-border bg-card">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">Unlock Unlimited AI Power</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Upgrade to Premium for unlimited generations, priority processing, and exclusive model access.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/pricing" className="primary-btn">
                <Crown className="h-4 w-4" /> View Plans
              </Link>
              <Link to="/models" className="secondary-btn">
                Browse Models
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
