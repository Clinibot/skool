"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { transcribeAudio, generateLessonContent } from "@/lib/ai";

export async function processLessonVideo(moduleId: string, title: string, videoFile: File) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Upload video to Supabase Storage
    const fileName = `${Date.now()}_${videoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lessons')
        .upload(fileName, videoFile);

    if (uploadError) throw uploadError;

    const videoUrl = supabase.storage.from('lessons').getPublicUrl(fileName).data.publicUrl;

    try {
        // 2. Transcribe (Using Groq)
        // Note: Whisper often needs audio extraction first, but for now we send the file
        // Ideally, we'd extract audio client-side or use a lambda
        const transcription = await transcribeAudio(videoFile);

        // 3. Generate Content (Using DeepSeek)
        const aiContent = await generateLessonContent(transcription);

        // 4. Save Lesson to Database
        const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({
                module_id: moduleId,
                title: title,
                video_url: videoUrl,
                content: JSON.stringify({
                    summary: aiContent.summary,
                    outline: aiContent.outline,
                    transcription: transcription
                })
            })
            .select()
            .single();

        if (lessonError) throw lessonError;

        // 5. Save Quiz
        const { error: quizError } = await supabase
            .from('quizzes')
            .insert({
                lesson_id: lesson.id,
                questions: aiContent.quiz
            });

        if (quizError) throw quizError;

        revalidatePath('/dashboard/classroom');
        return { success: true, lesson };
    } catch (err: any) {
        console.error("AI Processing Error:", err);
        throw new Error(`Failed to process video with AI: ${err.message}`);
    }
}
