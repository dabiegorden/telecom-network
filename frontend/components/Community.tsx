"use client";

import React, { useRef } from "react";
import { motion, useInView, easeInOut } from "framer-motion";
import { Quote } from "lucide-react";

const Community = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  const testimonials = [
    {
      name: "Kwame Mensah",
      role: "Network Engineer",
      company: "MTN Ghana",
      image: "/api/placeholder/100/100",
      content:
        "TelecomNet Ghana has transformed how I connect with industry peers. The knowledge-sharing forums have been invaluable for solving complex technical challenges.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      name: "Ama Osei",
      role: "Telecom Consultant",
      company: "Vodafone Ghana",
      image: "/api/placeholder/100/100",
      content:
        "The platform's job board helped me find my dream role. The direct messaging feature makes networking so much easier and more professional.",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      name: "Kofi Asante",
      role: "Senior Technical Lead",
      company: "AirtelTigo",
      image: "/api/placeholder/100/100",
      content:
        "As a team leader, I use this platform to find talented professionals and stay updated with industry trends. It's become an essential tool for my work.",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const communityStats = [
    { label: "Active Members", value: "2,500+", color: "cyan" },
    { label: "Discussion Topics", value: "450+", color: "blue" },
    { label: "Companies Represented", value: "85+", color: "purple" },
    { label: "Monthly Interactions", value: "10K+", color: "pink" },
  ];

  return (
    <section
      id="community"
      className="relative py-20 md:py-32 bg-slate-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

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
                Our Community
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join Ghana's Leading
              <span className="block bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Telecom Community
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Connect with passionate professionals, share experiences, and grow
              together in a supportive environment built for success.
            </p>
          </motion.div>

          {/* Community Stats */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20"
          >
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div
                  className={`text-3xl md:text-4xl font-bold mb-2 bg-linear-to-r from-${stat.color}-400 to-${stat.color}-600 bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              What Our Members Say
            </h3>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  variants={itemVariants}
                  className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
                >
                  {/* Quote Icon */}
                  <div
                    className={`absolute -top-4 left-8 w-12 h-12 bg-linear-to-br ${testimonial.gradient} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <Quote className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <p className="text-slate-300 leading-relaxed mb-6 italic">
                      "{testimonial.content}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-linear-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {testimonial.role}
                        </div>
                        <div className="text-xs text-cyan-400">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community Benefits */}
          <motion.div
            variants={itemVariants}
            className="bg-linear-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 md:p-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Community Benefits
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Expert Mentorship
                  </h4>
                  <p className="text-sm text-slate-300">
                    Connect with industry leaders for guidance and career
                    advice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Exclusive Events
                  </h4>
                  <p className="text-sm text-slate-300">
                    Access member-only webinars, workshops, and networking
                    events.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Career Opportunities
                  </h4>
                  <p className="text-sm text-slate-300">
                    Early access to job postings from top telecom companies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Knowledge Sharing
                  </h4>
                  <p className="text-sm text-slate-300">
                    Learn from shared experiences and industry best practices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Collaboration Tools
                  </h4>
                  <p className="text-sm text-slate-300">
                    Work together on projects and share resources seamlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Industry Insights
                  </h4>
                  <p className="text-sm text-slate-300">
                    Stay updated with the latest trends and developments.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Community;
