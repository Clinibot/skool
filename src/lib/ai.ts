export async function transcribeAudio(file: Blob) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

    const formData = new FormData();
    formData.append("file", file, "audio.mp3");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("response_format", "json");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq Error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.text;
}

export async function generateLessonContent(transcription: string) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

    const prompt = `
    Analyze the following transcript from a video masterclass and generate:
    1. A detailed summary.
    2. A structured outline with key concepts.
    3. A quiz with 10 challenging multiple-choice questions (0-10 score).

    Return ONLY a JSON object with this structure:
    {
      "summary": "...",
      "outline": [{"time": "...", "concept": "...", "detail": "..."}],
      "quiz": [{"question": "...", "options": ["...", "...", "...", "..."], "correct_answer": 0}]
    }

    Transcript:
    ${transcription}
  `;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a specialized AI educational assistant for premium communities." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek Error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
