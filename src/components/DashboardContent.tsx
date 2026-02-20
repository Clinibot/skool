"use client";

import { useState } from "react";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";

export function DashboardContent({ children }: { children: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-light tracking-wider uppercase">Overview</h1>
                    <p className="text-zinc-500">Manage your premium communities.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
                    >
                        New Community
                    </button>
                </div>
            </header>

            {children}

            <CreateCommunityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
