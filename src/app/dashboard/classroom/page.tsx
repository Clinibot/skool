"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, FileText, CheckCircle2, ChevronRight, Play, Award, Sparkles } from "lucide-react";

export default function ClassroomPage() {
    const [step, setStep] = useState(1); // 1: Idle, 2: Uploading, 3: Processing, 4: Ready
    const [activeTab, setActiveTab] = useState("content");

    const startSimulation = () => {
        setStep(2);
        setTimeout(() => setStep(3), 2000);
        setTimeout(() => setStep(4), 5000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            {/* Sidebar Mockup (Static for now) */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0b] p-6 hidden md:block">
                <div className="mb-10 opacity-50 uppercase text-[10px] tracking-[0.3em] font-bold">Classroom</div>
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-xs font-bold mb-1">Module 1</div>
                        <div className="text-[10px] text-zinc-500">Introduction to the Future</div>
                    </div>
                    {[2, 3, 4].map(i => (
                        <div key={i} className="p-4 rounded-2xl border border-transparent text-zinc-600">
                            <div className="text-xs font-bold mb-1">Module {i}</div>
                            <div className="text-[10px]">Upcoming Content</div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>Classroom</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">New Lesson</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-zinc-800" />
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 md:p-12 max-w-5xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="h-[500px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-white/[0.01] group hover:border-indigo-500/30 transition-all cursor-pointer"
                                onClick={startSimulation}
                            >
                                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-light tracking-widest uppercase mb-2">Upload Masterclass</h2>
                                <p className="text-zinc-500 font-light">Drag & Drop your video or click to browse</p>
                            </motion.div>
                        )}

                        {(step === 2 || step === 3) && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[500px] flex flex-col items-center justify-center"
                            >
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                                    <motion.div
                                        className="absolute inset-0 border-4 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-2">
                                    {step === 2 ? "Uploading..." : "AI Processing..."}
                                </h2>
                                <p className="text-zinc-500 font-light italic">Creating your premium experience</p>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Video Player Mockup */}
                                <div className="aspect-video bg-zinc-900 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                        <div className="w-full flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <Play className="w-6 h-6 fill-white" />
                                                <div className="h-1.5 w-64 bg-white/20 rounded-full self-center">
                                                    <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 fill-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 fill-white" />
                                        AI Transcribed
                                    </div>
                                </div>

                                {/* Navigation Tabs */}
                                <div className="flex gap-8 border-b border-white/5 pb-1">
                                    {["content", "outline", "quiz"].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors ${activeTab === tab ? 'text-white' : 'text-zinc-600'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && (
                                                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Content area */}
                                <div className="min-h-[300px]">
                                    {activeTab === "content" && (
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-light">Lesson Summary</h3>
                                            <p className="text-zinc-400 leading-relaxed font-light">
                                                This session covers the foundational principles of community architecture. Our AI has identified key segments regarding membership psychology, engagement loops, and premium branding strategies.
                                            </p>
                                        </div>
                                    )}
                                    {activeTab === "outline" && (
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <div className="text-indigo-500 font-bold">0{i}:00</div>
                                                    <div>
                                                        <div className="font-bold text-sm mb-1 uppercase tracking-tight">Key Concept {i}</div>
                                                        <div className="text-xs text-zinc-500 font-light">AI extracted insights regarding community scaling.</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === "quiz" && (
                                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">Knowledge Assessment</h3>
                                                    <p className="text-zinc-400 text-sm">AI-generated test based on the video content.</p>
                                                </div>
                                                <Award className="w-8 h-8 text-indigo-500" />
                                            </div>
                                            <div className="space-y-8">
                                                <div>
                                                    <p className="text-sm font-medium mb-4 italic">1. According to the session, what is the primary driver of community retention?</p>
                                                    <div className="space-y-2">
                                                        {["Branding", "Direct Interaction", "Engagement Loops", "Content Volume"].map(opt => (
                                                            <div key={opt} className="p-4 rounded-xl border border-white/10 text-xs font-light hover:bg-white/5 cursor-pointer transition-all">
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em]">
                                                    Submit Results
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
