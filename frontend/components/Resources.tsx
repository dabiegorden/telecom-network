'use client';

import React, { useRef } from 'react';
import { motion, useInView, cubicBezier } from 'framer-motion';
import { 
  FileText, 
  Video, 
  Newspaper, 
  GraduationCap, 
  Download,
  ExternalLink,
  Clock,
  TrendingUp
} from 'lucide-react';

const Resources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  };

  const resourceCategories = [
    {
      icon: FileText,
      title: 'Technical Documents',
      description: 'Access whitepapers, research papers, and technical specifications',
      count: '350+',
      gradient: 'from-cyan-500 to-blue-500',
      resources: [
        { name: '5G Network Architecture Guide', type: 'PDF', size: '2.4 MB' },
        { name: 'Network Security Best Practices', type: 'PDF', size: '1.8 MB' },
        { name: 'IoT Implementation Framework', type: 'PDF', size: '3.1 MB' },
      ],
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Learn from expert-led video courses and webinar recordings',
      count: '120+',
      gradient: 'from-blue-500 to-purple-500',
      resources: [
        { name: 'Network Troubleshooting Masterclass', type: 'Video', duration: '2h 30m' },
        { name: 'Advanced RF Planning Techniques', type: 'Video', duration: '1h 45m' },
        { name: 'Cloud Infrastructure for Telecom', type: 'Video', duration: '3h 15m' },
      ],
    },
    {
      icon: Newspaper,
      title: 'Industry News',
      description: 'Stay updated with the latest telecom news and market insights',
      count: 'Daily',
      gradient: 'from-purple-500 to-pink-500',
      resources: [
        { name: 'Ghana Telecom Market Trends Q1 2024', type: 'Article', time: '5 min read' },
        { name: 'New 5G Deployment in Accra', type: 'Article', time: '3 min read' },
        { name: 'Telecom Regulation Updates', type: 'Article', time: '7 min read' },
      ],
    },
    {
      icon: GraduationCap,
      title: 'Training Programs',
      description: 'Enroll in structured courses for professional development',
      count: '45+',
      gradient: 'from-pink-500 to-rose-500',
      resources: [
        { name: 'Network Engineering Fundamentals', type: 'Course', level: 'Beginner' },
        { name: 'Advanced LTE/5G Optimization', type: 'Course', level: 'Advanced' },
        { name: 'Telecom Project Management', type: 'Course', level: 'Intermediate' },
      ],
    },
  ];

  const featuredResources = [
    {
      title: 'Ghana Telecom Industry Report 2024',
      category: 'Industry Analysis',
      author: 'NCA Research Team',
      date: 'Jan 2024',
      downloads: '1,234',
      trending: true,
    },
    {
      title: '5G Deployment Strategies for Ghana',
      category: 'Technical Guide',
      author: 'Dr. Kwame Owusu',
      date: 'Dec 2023',
      downloads: '2,156',
      trending: true,
    },
    {
      title: 'Network Security Framework',
      category: 'Best Practices',
      author: 'Ghana Telecom Association',
      date: 'Nov 2023',
      downloads: '987',
      trending: false,
    },
  ];

  return (
    <section id="resources" className="relative py-20 md:py-32 bg-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/3 left-0 w-150 h-150 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-150 h-150 bg-purple-500/5 rounded-full blur-3xl" />

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
                Knowledge Hub
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Expand Your Knowledge
              <span className="block bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Access Premium Resources
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Explore our comprehensive library of industry resources, from technical 
              documentation to expert-led training programs.
            </p>
          </motion.div>

          {/* Resource Categories Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16"
          >
            {resourceCategories.map((category, index) => (
              <motion.div
                key={category.title}
                variants={itemVariants}
                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${category.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 bg-linear-to-br ${category.gradient} rounded-xl group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-slate-700/50 rounded-full">
                      <span className="text-cyan-400 text-sm font-semibold">{category.count}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {category.description}
                  </p>

                  {/* Sample Resources */}
                  <div className="space-y-2">
                    {category.resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">{resource.name}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {resource.type} • {resource.hasOwnProperty('size') ? (resource as { size: string }).size
                              : resource.hasOwnProperty('duration') ? (resource as { duration: string }).duration
                              : resource.hasOwnProperty('time') ? (resource as { time: string }).time
                              : resource.hasOwnProperty('level') ? (resource as { level: string }).level
                              : 'N/A'}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* View All Link */}
                  <button className="mt-6 w-full py-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center justify-center gap-2 group/btn">
                    View All {category.title}
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Featured Resources */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Featured Resources
              </h3>
              <button className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2">
                View All
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {featuredResources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  variants={itemVariants}
                  className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Trending Badge */}
                  {resource.trending && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-semibold">Trending</span>
                    </div>
                  )}

                  {/* Category */}
                  <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
                    <span className="text-cyan-400 text-xs font-semibold">{resource.category}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {resource.title}
                  </h4>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{resource.author}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{resource.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>{resource.downloads}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button className="w-full py-2 px-4 bg-linear-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg font-semibold hover:from-cyan-500/20 hover:to-blue-500/20 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 bg-linear-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Need More Resources?
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Members get unlimited access to our entire resource library, including exclusive content and premium materials.
            </p>
            <button className="px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:-translate-y-1 inline-flex items-center gap-2">
              Upgrade to Premium
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;