"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, FileText, CheckCircle2, ChevronRight, Play, Award, Sparkles, Loader2 } from "lucide-react";
import { submitQuizResult } from "./actions";

export default function ClassroomPage() {
    const [step, setStep] = useState(1); // 1: Idle, 2: Uploading, 3: Processing, 4: Ready
    const [activeTab, setActiveTab] = useState("content");
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [score, setScore] = useState(0);

    const startSimulation = () => {
        setStep(2);
        setTimeout(() => setStep(3), 2000);
        setTimeout(() => setStep(4), 5000);
    };

    const handleQuizSubmit = async () => {
        setSubmittingQuiz(true);
        // Simulate scoring logic (e.g., 8/10)
        const finalScore = 8;
        setScore(finalScore);

        try {
            // In a real app, quizId would come from the generated quiz in DB
            // For now we use a dummy UUID if possible or just skip the DB part for the mock
            // await submitQuizResult("dummy-uuid", finalScore); 

            setTimeout(() => {
                setQuizSubmitted(true);
                setSubmittingQuiz(false);
            }, 1500);
        } catch (error) {
            console.error(error);
            setSubmittingQuiz(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            {/* Sidebar Mockup */}
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
                                <div className="relative w-24 h-24 mb-8 text-indigo-500">
                                    <Loader2 className="w-full h-full animate-spin" />
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
                                <div className="aspect-video bg-zinc-900 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className="w-12 h-12 fill-white opacity-20" />
                                    </div>
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 fill-white" />
                                        AI Transcribed
                                    </div>
                                </div>

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

                                <div className="min-h-[300px]">
                                    {activeTab === "content" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <h3 className="text-2xl font-light">Lesson Summary</h3>
                                            <p className="text-zinc-400 leading-relaxed font-light">
                                                Our AI has analyzed your 45-minute masterclass. The core focus is on <strong>Community Psychology</strong> and the <strong>Value-First Loop</strong>. You'll find specific actionable steps in the outline.
                                            </p>
                                        </motion.div>
                                    )}
                                    {activeTab === "outline" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-indigo-500/20 transition-all">
                                                    <div className="text-indigo-500 font-bold font-mono">0{i}:00</div>
                                                    <div>
                                                        <div className="font-bold text-sm mb-1 uppercase tracking-tight">Key Learning Point {i}</div>
                                                        <div className="text-xs text-zinc-500 font-light italic">Detailed AI extraction concerning module {i} architecture.</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {activeTab === "quiz" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            {!quizSubmitted ? (
                                                <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div>
                                                            <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">AI Knowledge Test</h3>
                                                            <p className="text-zinc-400 text-sm font-light">Validating your understanding of the masterclass.</p>
                                                        </div>
                                                        <Award className="w-8 h-8 text-indigo-500" />
                                                    </div>

                                                    <div className="space-y-8">
                                                        <div>
                                                            <p className="text-sm font-medium mb-4 italic">How does the "Anti-Skool" philosophy differ from traditional platforms?</p>
                                                            <div className="space-y-2">
                                                                {["Focus on AI automation", "Premium minimalism", "Community-first logic", "All of the above"].map(opt => (
                                                                    <div key={opt} className="p-4 rounded-xl border border-white/10 text-xs font-light hover:bg-white/5 cursor-pointer transition-all">
                                                                        {opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handleQuizSubmit}
                                                            disabled={submittingQuiz}
                                                            className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2"
                                                        >
                                                            {submittingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit & Send to Creator"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="p-12 rounded-[40px] border border-green-500/30 bg-green-500/5 text-center"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 text-green-500">
                                                        <CheckCircle2 className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-3xl font-bold mb-2">{score}/10</h3>
                                                    <p className="text-zinc-400 font-light mb-8">Result successfully verified and shared with the community lead.</p>
                                                    <button
                                                        onClick={() => setQuizSubmitted(false)}
                                                        className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-white transition-colors"
                                                    >
                                                        Retake Test
                                                    </button>
                                                </motion.div>
                                            )}
                                        </motion.div>
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
