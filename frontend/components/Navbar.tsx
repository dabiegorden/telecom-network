"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "Community", href: "#community" },
    { name: "Resources", href: "#resources" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-cyan-500/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Wifi className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <div className="absolute -inset-1 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                TelecomNet Ghana
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-slate-200 hover:text-cyan-400 transition-colors group"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute inset-0 bg-cyan-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              <button className="ml-4 px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5">
                Join Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-slate-200 hover:text-cyan-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-70 sm:w-[320px] bg-slate-900 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={closeMenu}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Logo in Mobile Menu */}
                <div className="flex items-center space-x-2 mb-8 mt-2">
                  <Wifi className="w-7 h-7 text-cyan-400" />
                  <span className="text-lg font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    TelecomNet Ghana
                  </span>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="block px-4 py-3 text-slate-200 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <button
                    onClick={closeMenu}
                    className="w-full px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
                  >
                    Join Now
                  </button>
                </motion.div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <p className="text-sm text-slate-400 mb-2">
                    Connect with professionals
                  </p>
                  <p className="text-xs text-slate-500">
                    Ghana's premier networking platform for telecom
                    professionals
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
