import { useState, useEffect, useRef } from "react";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import unsaidLogo from '../assets/unsaidLogo.png';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll animations
  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse parallax effect for hero section
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-white overflow-hidden antialiased relative">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden"
      >
        {/* Background gradient elements with parallax effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[10%] left-[25%] w-[30rem] h-[30rem] bg-red-500/20 rounded-full filter blur-[150px] opacity-60 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />
          <div
            className="absolute bottom-[5%] right-[20%] w-[35rem] h-[35rem] bg-orange-400/15 rounded-full filter blur-[150px] opacity-60 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />
          <div
            className="absolute top-[40%] right-[10%] w-[20rem] h-[20rem] bg-purple-500/15 rounded-full filter blur-[120px] opacity-50 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full relative">
            <div className="absolute w-24 h-24 top-1/4 left-[15%] opacity-20 animate-float-slow">
              <div className="w-full h-full rounded-full border border-white/20 backdrop-blur-sm"></div>
            </div>
            <div className="absolute w-16 h-16 top-2/3 right-[20%] opacity-20 animate-float-medium">
              <div className="w-full h-full rounded-full border border-white/20 backdrop-blur-sm"></div>
            </div>
            <div className="absolute w-32 h-32 bottom-1/4 left-[30%] opacity-20 animate-float-fast">
              <div className="w-full h-full rounded-full border border-white/20 backdrop-blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="max-w-7xl mx-auto relative z-10 px-4">
          <motion.div
            className="text-center"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <div className="relative inline-block">
                <div className="relative bg-gradient-to-b from-gray-700/40 to-red-700/20 p-3 rounded-full backdrop-blur-md ">
                  <img src={unsaidLogo} alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="absolute -right-2 -bottom-1 animate-pulse">
                    <Sparkles className="w-5 h-5 text-orange-300" />
                  </div>
                </div>
              </div>

            </motion.div>


            <motion.div>


            </motion.div>

            <h1>
              <span className="bg-gradient-to-r from-red-400 via-orange-300 to-red-500 bg-clip-text text-transparent">
                Where Secrets
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-orange-300 to-red-500 bg-clip-text text-transparent">
                Find Their Voice
              </span>
            </h1>







            <motion.p
              className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
              variants={itemVariants}
            >
              A safe haven for IITR students to share untold stories, thoughts, and experiences anonymously.
              Let your voice be heard without revealing who you are.
            </motion.p>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <button
                  onClick={() => (window.location.href = "/posts")}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 text-base font-medium transition transform duration-300 shadow-md hover:-translate-y-1 flex items-center justify-center mx-auto gap-2 group"
                  style={{ borderRadius: "9999px" }} // forces rounded-full
                >
                  Join Unsaid
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                </button>

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/50">
                  For IITR students only
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scrolling indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
          <div className="w-8 h-12 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
          </div>
          <span className="text-white/40 text-xs mt-2">Scroll</span>
        </div>
      </section>

      {/* Custom Cursor (optional) */}
      <div
        className="fixed w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 pointer-events-none z-50 opacity-70 hidden md:block"
        style={{
          left: `${mousePosition.x * window.innerWidth + window.innerWidth / 2}px`,
          top: `${mousePosition.y * window.innerHeight + window.innerHeight / 2}px`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s cubic-bezier(0.11, 0, 0.5, 0)"
        }}
      ></div>
    </main>
  );
};

export default HomePage;
