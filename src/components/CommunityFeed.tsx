"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, Heart, Send, Plus, Filter, User } from "lucide-react";

interface CommunityFeedProps {
    communityId: string;
    profile: any;
}

export function CommunityFeed({ communityId, profile }: CommunityFeedProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [category, setCategory] = useState("general");
    const [isPosting, setIsPosting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchPosts();
    }, [communityId]);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles(full_name, username, avatar_url), reacciones(count), comentarios(count)')
            .eq('community_id', communityId)
            .order('created_at', { ascending: false });

        if (!error) setPosts(data || []);
        setLoading(false);
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostTitle.trim() || !newPostContent.trim() || isPosting) return;

        setIsPosting(true);
        const { error } = await supabase.from('posts').insert({
            community_id: communityId,
            author_id: profile.id,
            title: newPostTitle.trim(),
            content: newPostContent.trim(),
            category
        });

        if (!error) {
            setNewPostTitle("");
            setNewPostContent("");
            setIsPosting(false);
            fetchPosts();
        } else {
            setIsPosting(false);
        }
    };

    const toggleReaction = async (postId: string) => {
        // Simple like toggle logic
        // For brevity in this initial version, we'll just insert a 'like'
        await supabase.from('reacciones').upsert({
            post_id: postId,
            user_id: profile.id,
            tipo: 'like'
        });
        fetchPosts();
    };

    const categories = ["general", "preguntas", "victorias", "anuncios"];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Create Post Area */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    Nueva Publicación
                </h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <input
                        value={newPostTitle}
                        onChange={e => setNewPostTitle(e.target.value)}
                        placeholder="Título de tu post..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                    />
                    <textarea
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        placeholder="¿Qué quieres compartir con la universidad?"
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all resize-none"
                    />
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-white/5 text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={isPosting || !newPostTitle.trim()}
                            className="px-8 py-3.5 bg-white text-black rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20"
                        >
                            Publicar
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <button className="text-xs font-black uppercase tracking-[0.2em] text-white border-b-2 border-indigo-500 pb-2">Todo</button>
                    <button className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 pb-2 border-b-2 border-transparent transition-all">Popular</button>
                    <button className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 pb-2 border-b-2 border-transparent transition-all">Reciente</button>
                </div>
                <div className="flex items-center gap-2 text-zinc-600">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 text-center animate-pulse">
                        <div className="w-10 h-10 bg-white/5 rounded-full mx-auto mb-4" />
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 font-black">Cargando Universidad...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-20 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[40px]">
                        <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-600 text-xs font-light tracking-widest uppercase">El muro está vacío todavía. ¡Sé el primero!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <article key={post.id} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500/40 transition-all" />
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-[22px] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} alt="" className="w-full h-full rounded-[22px] object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 opacity-40" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a0a0b] rounded-full" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{post.profiles?.full_name || post.profiles?.username}</h4>
                                        <p className="text-[10px] text-zinc-500 font-light mt-0.5">{new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                                    {post.category}
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:translate-x-1 transition-transform">{post.title}</h2>
                            <p className="text-zinc-400 leading-relaxed font-light mb-8 line-clamp-3 group-hover:text-zinc-300 transition-colors">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                                <button
                                    onClick={() => toggleReaction(post.id)}
                                    className="flex items-center gap-2 group/btn"
                                >
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover/btn:bg-indigo-600/10 group-hover/btn:text-indigo-400 transition-all">
                                        <Heart className={`w-4 h-4 ${post.reacciones?.[0]?.count > 0 ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover/btn:text-zinc-400">{post.reacciones?.[0]?.count || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 group/btn">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover/btn:bg-violet-600/10 group-hover/btn:text-violet-400 transition-all">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover/btn:text-zinc-400">{post.comentarios?.[0]?.count || 0}</span>
                                </button>
                                <div className="flex-1" />
                                <button className="p-2.5 rounded-xl bg-white text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
