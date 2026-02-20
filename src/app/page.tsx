"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Layout, ArrowRight, Zap, Shield, Star } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Saby <span className="text-indigo-500">Skool</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <Link href="/register" className="px-6 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-400 mb-8">
              <Star className="w-3 h-3 fill-indigo-400" />
              <span>The next generation of community platforms</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Build your tribe <br /> in a premium space.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed mb-12">
              Everything you love about Skool, reimagined with a high-end interface, powerful automation, and deep customization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-600/30 group">
                Create My Community
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 relative"
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] scale-75 opacity-20" />
            <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-3xl overflow-hidden aspect-video shadow-2xl">
              {/* Mock Dashboard UI */}
              <div className="w-full h-full flex flex-col">
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 px-0 py-0" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 px-0 py-0" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 px-0 py-0" />
                  </div>
                  <div className="w-1/3 h-6 rounded-lg bg-white/5 mx-auto" />
                </div>
                <div className="flex-1 flex p-6 gap-6">
                  <div className="w-64 space-y-4">
                    <div className="h-8 rounded-lg bg-indigo-500/20 w-3/4" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 rounded-xl bg-white/5 w-full" />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-white/5 flex flex-col p-4 justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/10" />
                          <div className="w-1/2 h-3 rounded bg-white/5" />
                        </div>
                      ))}
                    </div>
                    <div className="h-64 rounded-2xl bg-white/5 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Built for scale, designed for beauty.</h2>
            <p className="text-zinc-400">Our platform handles the mechanics so you can focus on the members.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Global Communities"
              description="Manage thousands of students with ease. Advanced moderation and engagement tools included."
            />
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6" />}
              title="Modern LMS"
              description="Deliver courses in a sleek, Netflix-style interface that makes learning addictive."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Premium Security"
              description="Enterprise-grade protection for your content and community data. Fully encrypted."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to elevate your community?</h2>
          <Link href="/register" className="inline-block px-10 py-5 bg-white text-black rounded-3xl font-bold text-xl hover:scale-105 transition-transform">
            Join our Early Access
          </Link>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
            <span className="font-bold">Saby Skool</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © 2026 Saby Skool. All premium rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08] transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
