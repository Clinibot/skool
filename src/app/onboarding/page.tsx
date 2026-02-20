"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { setUserRole } from "./actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleSelect = async (role: 'creator' | 'participant') => {
        setLoading(role);
        try {
            await setUserRole(role);
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center px-6 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />

            <div className="max-w-4xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-4 uppercase">
                        Choose your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Path</span>
                    </h1>
                    <p className="text-zinc-500 tracking-tight text-lg">Define your identity in the future of communities.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <RoleCard
                        title="Creator"
                        description="Build your tribe, share your knowledge, and lead the conversation."
                        onClick={() => handleSelect('creator')}
                        isLoading={loading === 'creator'}
                        gradient="from-indigo-600/20 to-indigo-400/5"
                        borderColor="border-indigo-500/30"
                    />
                    <RoleCard
                        title="Participant"
                        description="Join communities, learn from experts, and grow with your peers."
                        onClick={() => handleSelect('participant')}
                        isLoading={loading === 'participant'}
                        gradient="from-violet-600/20 to-violet-400/5"
                        borderColor="border-violet-500/30"
                    />
                </div>
            </div>
        </div>
    );
}

function RoleCard({ title, description, onClick, isLoading, gradient, borderColor }: any) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={isLoading}
            className={`relative p-10 rounded-[32px] border ${borderColor} bg-gradient-to-br ${gradient} backdrop-blur-3xl text-left overflow-hidden group transition-all`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />

            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4 tracking-tight uppercase group-hover:tracking-[0.1em] transition-all duration-500">
                    {title}
                </h2>
                <p className="text-zinc-400 leading-relaxed font-light mb-8 max-w-[80%]">
                    {description}
                </p>

                <div className="flex items-center gap-2">
                    <div className={`h-[1px] ${isLoading ? 'w-0' : 'w-12'} bg-white transition-all duration-700`} />
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Select Identity
                        </span>
                    )}
                </div>
            </div>
        </motion.button>
    );
}
