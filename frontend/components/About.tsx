'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, easeInOut } from 'framer-motion';
import { Target, Eye, Award, Zap } from 'lucide-react';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To create a vibrant ecosystem where telecommunication professionals in Ghana can connect, collaborate, and advance their careers through knowledge sharing and meaningful networking.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To be the leading digital platform that drives innovation and professional growth in Ghana\'s telecommunications industry, fostering a community of excellence and collaboration.',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Integrity, innovation, collaboration, and excellence guide everything we do. We believe in creating value through authentic connections and shared knowledge.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Our Impact',
      description: 'Empowering over 2,500 professionals with opportunities for growth, learning, and career advancement in Ghana\'s dynamic telecommunications sector.',
      gradient: 'from-pink-500 to-cyan-500',
    },
  ];

  return (
    <section id="about" className="relative py-20 md:py-32 bg-slate-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold">
                About Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Empowering Ghana's
              <span className="block bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Telecom Professionals
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We're building a community-driven platform that bridges the gap between 
              telecommunication professionals, creating opportunities for growth, collaboration, 
              and innovation across Ghana.
            </p>
          </motion.div>

          {/* Values Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${value.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex p-4 bg-linear-to-br ${value.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {value.title}
                  </h3>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${value.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              </motion.div>
            ))}
          </motion.div>

          {/* Why Choose Us Section */}
          <motion.div
            variants={itemVariants}
            className="mt-20 bg-linear-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 md:p-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Why TelecomNet Ghana?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  Industry-Specific Focus
                </h4>
                <p className="text-slate-300">
                  Tailored exclusively for Ghana's telecommunications sector, ensuring relevant connections and opportunities.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  Secure & Trusted
                </h4>
                <p className="text-slate-300">
                  Enterprise-grade security with verified professional profiles and robust data protection.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  Community-Driven
                </h4>
                <p className="text-slate-300">
                  Built by professionals, for professionals, with features designed to foster genuine collaboration.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;