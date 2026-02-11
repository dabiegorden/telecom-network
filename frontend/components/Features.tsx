"use client";

import React, { useRef } from "react";
import { motion, useInView, easeInOut } from "framer-motion";
import {
  User,
  MessageSquare,
  Briefcase,
  BookOpen,
  Shield,
  Users,
  Bell,
  Search,
  BarChart3,
  Calendar,
} from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const features = [
    {
      icon: User,
      title: "Professional Profiles",
      description:
        "Create comprehensive profiles showcasing your expertise, experience, and achievements in the telecom industry.",
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: MessageSquare,
      title: "Discussion Forums",
      description:
        "Engage in topic-specific discussions, share insights, and learn from industry experts across various telecom domains.",
      color: "blue",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Direct Messaging",
      description:
        "Connect privately with other professionals for mentorship, collaboration, or partnership opportunities.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Briefcase,
      title: "Job Postings",
      description:
        "Discover exclusive telecom job opportunities and talent acquisition tools for employers in Ghana.",
      color: "pink",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: BookOpen,
      title: "Knowledge Hub",
      description:
        "Access a curated library of industry resources, research papers, technical guides, and best practices.",
      color: "rose",
      gradient: "from-rose-500 to-orange-500",
    },
    {
      icon: Calendar,
      title: "Events & Webinars",
      description:
        "Stay updated on industry events, conferences, and online learning opportunities across Ghana.",
      color: "orange",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track your network growth, engagement metrics, and profile visibility with comprehensive analytics.",
      color: "yellow",
      gradient: "from-yellow-500 to-green-500",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description:
        "Find professionals, companies, and opportunities using powerful filters and search capabilities.",
      color: "green",
      gradient: "from-green-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Data Security",
      description:
        "Enterprise-grade security with encrypted communications, secure authentication, and privacy controls.",
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Stay informed with customizable notifications for connections, opportunities, and important updates.",
      color: "blue",
      gradient: "from-blue-500 to-purple-500",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 md:py-32 bg-slate-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/4 right-0 w-125 h-125 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-125 h-125 bg-purple-500/5 rounded-full blur-3xl" />

      <div
        ref={ref}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold">
                Platform Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Succeed & Connect
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our comprehensive suite of features is designed to facilitate
              meaningful professional connections and career growth in Ghana's
              telecommunications industry.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
              >
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 bg-linear-to-br ${feature.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Glow */}
                <div
                  className={`absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="mt-20 text-center">
            <div className="inline-block bg-linear-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 md:p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of telecom professionals already benefiting from
                our platform.
              </p>
              <button className="group px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:-translate-y-1 inline-flex items-center gap-2">
                Create Your Account
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
