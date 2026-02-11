"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wifi,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    platform: [
      { name: "Features", href: "#features" },
      { name: "Community", href: "#community" },
      { name: "Resources", href: "#resources" },
      { name: "Pricing", href: "#pricing" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Blog", href: "#blog" },
      { name: "Press Kit", href: "#press" },
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "FAQs", href: "#faq" },
      { name: "Status", href: "#status" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "Guidelines", href: "#guidelines" },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-400",
    },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-400" },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-500",
    },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-400",
    },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6 group">
                <div className="relative">
                  <Wifi className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <div className="absolute -inset-1 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  TelecomNet Ghana
                </span>
              </Link>

              <p className="text-slate-400 mb-6 leading-relaxed">
                Empowering Ghana's telecommunication professionals through
                innovation, collaboration, and knowledge sharing.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>info@telecomnetghana.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+233 (0) 24 123 4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Accra Digital Center, Ridge, Accra</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 ${social.color} hover:border-current transition-all hover:shadow-lg hover:-translate-y-1`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
              <p className="text-slate-400 text-sm">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
              />
              <button className="px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-lg hover:shadow-cyan-500/30 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} TelecomNet Ghana. All rights
              reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="#privacy"
                className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Privacy
              </Link>
              <Link
                href="#terms"
                className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Terms
              </Link>
              <Link
                href="#cookies"
                className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="fixed bottom-8 right-8 p-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all z-50 group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </motion.button>
    </footer>
  );
};

export default Footer;
