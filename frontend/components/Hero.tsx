"use client";

import { motion } from "framer-motion";
import { easeInOut } from "framer-motion";
import {
  ArrowRight,
  Users,
  MessageCircle,
  Briefcase,
  BookOpen,
} from "lucide-react";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
  };

  const stats = [
    { icon: Users, label: "Active Professionals", value: "2,500+" },
    { icon: MessageCircle, label: "Discussion Forums", value: "150+" },
    { icon: Briefcase, label: "Job Opportunities", value: "300+" },
    { icon: BookOpen, label: "Knowledge Resources", value: "1,000+" },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full backdrop-blur-sm">
              <span className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Empowering Ghana's Telecom Industry
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="block text-white">Connect. Collaborate.</span>
            <span className="block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Ghana's premier digital networking platform for telecommunication
            professionals. Share knowledge, discover opportunities, and build
            meaningful connections.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <button className="group px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:-translate-y-1 flex items-center gap-2 w-full sm:w-auto justify-center">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-lg font-semibold text-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-all w-full sm:w-auto">
              Learn More
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <stat.icon className="w-8 h-8 text-cyan-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1.5,
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
