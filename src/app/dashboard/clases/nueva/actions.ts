"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateAICourseContent(transcription: string) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.openai;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const prompt = `
    Analyze the following transcript from a video lesson and generate:
    1. A detailed summary (max 500 characters).
    2. A structured outline/schema with key concepts.
    3. A list of 5 assessment questions for a level test.

    Return ONLY a JSON object with this structure:
    {
      "summary": "...",
      "schema": "...",
      "questions": ["...", "...", "...", "...", "..."]
    }

    Transcript:
    ${transcription}
    `;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a specialized educational assistant for Saby University." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI Error: ${error.error?.message || "Unknown error"}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}
