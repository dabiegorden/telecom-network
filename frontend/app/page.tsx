"use client";

import About from "@/components/About";
import Community from "@/components/Community";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Resources from "@/components/Resources";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <Community />
        <Resources />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
