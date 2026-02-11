"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, easeInOut } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "info@telecomnetghana.com",
      subtext: "We respond within 24 hours",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+233 (0) 24 123 4567",
      subtext: "Mon-Fri: 9AM - 6PM GMT",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Accra Digital Center",
      subtext: "Ridge, Accra, Ghana",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <section
      id="contact"
      className="relative py-20 md:py-32 bg-slate-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

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
                Get in Touch
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Let's Start a
              <span className="block bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Our team
              is here to help you get the most out of TelecomNet Ghana.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Information */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Cards */}
              {contactInfo.map((info, index) => (
                <div
                  key={info.title}
                  className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 bg-linear-to-br ${info.gradient} rounded-lg group-hover:scale-110 transition-transform`}
                    >
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-cyan-400 font-medium mb-1">
                        {info.details}
                      </p>
                      <p className="text-sm text-slate-400">{info.subtext}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-12 h-12 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center hover:bg-linear-to-br hover:from-cyan-500 hover:to-blue-500 hover:border-transparent transition-all hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1 group"
                    >
                      <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-linear-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="text-cyan-400 font-medium">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="text-cyan-400 font-medium">
                      10:00 AM - 2:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-slate-500 font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-white mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-white mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-sm text-slate-400 text-center">
                  We'll get back to you within 24 hours. For urgent inquiries,
                  please call us directly.
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
