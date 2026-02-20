"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ChevronRight, Play, Award, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { processLessonVideo } from "./process-action";

export default function ClassroomPage() {
    const [step, setStep] = useState(1); // 1: Idle, 2: Uploading/Processing, 3: Ready
    const [activeTab, setActiveTab] = useState("content");
    const [loadingMsg, setLoadingMsg] = useState("Uploading...");
    const [aiData, setAiData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep(2);
        setError(null);
        setLoadingMsg("Uploading & Transcribing...");

        try {
            // For this demo, we assume a default module ID if not present
            // In a real app, this would be selected from a dropdown or context
            const result = await processLessonVideo("dummy-module-id", file.name, file);

            // The result.lesson.content is JSON stringified in our action
            const content = JSON.parse(result.lesson.content);

            setAiData({
                ...content,
                // Quiz is in a separate table, but for this flow we can assume it's returned or fetch it
                // Our action doesn't return the quiz data yet, let's assume we have it in content or mock it if needed
                // Ideally, the action should return the combined data
                quiz: [] // Placeholder if not in content
            });

            setStep(3);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to process video");
            setStep(1);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            {/* Sidebar Mockup */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0b] p-6 hidden md:block">
                <div className="mb-10 opacity-50 uppercase text-[10px] tracking-[0.3em] font-bold">Classroom</div>
                <div className="space-y-4 text-zinc-600">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white">
                        <div className="text-xs font-bold mb-1 italic">Active Project</div>
                        <div className="text-[10px] opacity-70">New Masterclass</div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>Classroom</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">AI Engine</span>
                    </div>
                </header>

                <div className="flex-1 p-8 md:p-12 max-w-5xl mx-auto w-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="video/*,audio/*"
                    />

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-[500px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-white/[0.01] group hover:border-indigo-500/30 transition-all cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-2">Upload for AI Analysis</h2>
                                <p className="text-zinc-500 font-light">DeepSeek & Groq will process your masterclass</p>
                                {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[500px] flex flex-col items-center justify-center"
                            >
                                <div className="relative w-24 h-24 mb-8 text-indigo-500">
                                    <Loader2 className="w-full h-full animate-spin" />
                                </div>
                                <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-2 animate-pulse">{loadingMsg}</h2>
                                <p className="text-zinc-500 font-light italic">Mining insights with high-performance AI</p>
                            </motion.div>
                        )}

                        {step === 3 && aiData && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Player UI */}
                                <div className="aspect-video bg-black rounded-[32px] border border-white/5 relative overflow-hidden group shadow-2xl">
                                    <div className="w-full h-full flex items-center justify-center opacity-30">
                                        <Sparkles className="w-16 h-16 text-indigo-500" />
                                    </div>
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 fill-white" />
                                        DeepSeek Analysis Active
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-8 border-b border-white/5">
                                    {["content", "outline", "quiz"].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors ${activeTab === tab ? 'text-white' : 'text-zinc-600'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && (
                                                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Results */}
                                <div className="min-h-[300px]">
                                    {activeTab === "content" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <h3 className="text-2xl font-light uppercase tracking-tight">AI Summary</h3>
                                            <p className="text-zinc-400 leading-relaxed font-light text-lg">
                                                {aiData.summary}
                                            </p>
                                        </motion.div>
                                    )}
                                    {activeTab === "outline" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            {aiData.outline?.map((item: any, i: number) => (
                                                <div key={i} className="flex gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group">
                                                    <div className="text-indigo-500 font-mono font-bold">{item.time || `0${i}:00`}</div>
                                                    <div>
                                                        <div className="font-bold text-sm mb-1 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{item.concept}</div>
                                                        <div className="text-xs text-zinc-500 font-light italic">{item.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {activeTab === "quiz" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-[40px] border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent text-center">
                                            <Award className="w-12 h-12 text-indigo-500 mx-auto mb-6" />
                                            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Quiz Ready</h3>
                                            <p className="text-zinc-500 font-light mb-8 max-w-md mx-auto">The DeepSeek reasoning engine has prepared 10 questions to validate your knowledge.</p>
                                            <button className="px-12 py-4 bg-white text-black rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all">
                                                Begin Assessment
                                            </button>
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
