import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/layout/Container";
import ThemeToggle from "@/components/ThemeToggle";
import { MessageCircle, Shield, Users, LockKeyhole, BookOpen, Heart, Eye, EyeOff, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [hovered, setHovered] = useState(null);
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-primary/15 via-background to-secondary/10 min-h-screen">
        {/* Navigation */}
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/60 sticky top-0 z-10">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Unsaid</h1>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {isAuthenticated ? (
                  <Link to="/feed">
                    <Button variant="default" size="sm" className="text-sm">Go to Feed</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" size="sm" className="text-sm">Sign In</Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="text-sm">Join Now</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Container>
        </header>

        {/* Hero Content */}
        <div className="flex flex-col justify-center min-h-[calc(100vh-4rem)]">
          <Container className="pt-12 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="space-y-6 order-2 md:order-1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Share Your <span className="text-primary">IITR Story</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  A safe space where you're known by your <span className="text-primary font-medium">unique username</span>, with the option to go <span className="font-medium italic">fully anonymous</span> anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {isAuthenticated ? (
                    <Link to="/feed">
                      <Button size="lg" className="w-full sm:w-auto font-medium group">
                        <span>Go to Your Feed</span>
                        <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button size="lg" className="w-full sm:w-auto font-medium group">
                        <span>Join Unsaid</span>
                        <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="order-1 md:order-2 relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                {/* Animated bubbles in the background */}
                <motion.div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/20 dark:bg-primary/30 blur-3xl -z-10"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }} 
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                  }}
                />
                <motion.div 
                  className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/30 dark:bg-violet-500/20 blur-3xl -z-10"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }} 
                  transition={{ 
                    duration: 6,
                    delay: 0.5,
                    repeat: Infinity,
                  }}
                />
                
                {/* Colorful post illustrations */}
                <div className="relative h-[400px] mx-auto">
                  {/* Anonymous Post */}
                  <motion.div 
                    className="absolute right-0 top-0 w-[280px] p-5 rounded-2xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 dark:from-zinc-800 dark:to-zinc-900 shadow-xl border border-zinc-700/50 dark:border-zinc-700/50"
                    initial={{ rotate: 5 }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                        <EyeOff className="h-5 w-5 text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-zinc-300 font-medium">Anonymous</p>
                        <p className="text-xs text-zinc-500">Just now</p>
                      </div>
                      <div className="ml-auto flex">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-2 w-2 rounded-full mx-0.5 ${i <= 3 ? "bg-red-500" : "bg-zinc-700"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-300 mb-4">nd friends who truly get me until I joined the astronomy club. Best decision ever! 🌠</p>
                    <div className="grid grid-cols-4 gap-1 h-32 overflow-hidden rounded-lg bg-zinc-800">
                      <div className="col-span-4 h-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40"></div>
                    </div>
                  </motion.div>
                  
                  {/* Regular Post */}
                  <motion.div 
                    className="absolute left-0 bottom-0 w-[280px] p-5 rounded-2xl bg-gradient-to-br from-card to-muted dark:from-zinc-900 dark:to-zinc-800 shadow-xl border border-border dark:border-zinc-800"
                    initial={{ rotate: -5 }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">MR</span>
                      </div>
                      <div>
                        <p className="font-medium">MountainRider</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                      <div className="ml-auto flex">
                        {[1, 2].map(i => (
                          <div key={i} className={`h-2 w-2 rounded-full mx-0.5 ${i <= 2 ? "bg-amber-500" : "bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mb-4">Kisi ko pata hai Divine mein kal kiski kiski ladai hui thi. sunne mein aaya hai 3rd year pil gya</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> 12</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> 8</span>
                    </div>
                  </motion.div>
                  
                  {/* Anonymity explanation */}
                  <motion.div 
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-xl bg-primary/10 text-primary backdrop-blur-md border border-primary/20 dark:bg-primary/20"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Eye className="h-4 w-4" /> Default: Unique username
                    </div>
                    <div className="w-full h-px bg-primary/20 my-2"></div>
                    <div className="flex items-center gap-2 font-medium">
                      <EyeOff className="h-4 w-4" /> Optional: Fully anonymous
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Container>
        </div>
      </div>

      {/* Features Section with Interactive Cards */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/5 to-background">
        <Container>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Why Unsaid?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LockKeyhole className="h-6 w-6 text-primary" />,
                title: "Privacy First",
                description: "Post with your username or go completely anonymous - you decide how visible you want to be.",
                color: "from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10",
                index: 0
              },
              {
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                title: "Campus Stories",
                description: "Share and discover real IITR experiences without fear of judgment.",
                color: "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
                index: 1
              },
              {
                icon: <Heart className="h-6 w-6 text-primary" />,
                title: "Supportive Space",
                description: "Find your community within IITR's diverse student body.",
                color: "from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10",
                index: 2
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                className={`rounded-xl overflow-hidden transform transition-all duration-300 ease-in-out`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
              >
                <div className={`p-8 rounded-xl bg-gradient-to-br ${feature.color} border border-primary/10 h-full`}>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Container>
          <motion.div 
            className="glass-card py-12 px-8 rounded-2xl text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Ready to join the conversation?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {isAuthenticated ? (
                <Link to="/feed">
                  <Button size="lg" className="font-medium px-8 group">
                    Go to Your Feed
                    <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="font-medium px-8 group">
                    Join Unsaid Now
                    <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Unsaid. For IITR students only.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Guidelines</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
