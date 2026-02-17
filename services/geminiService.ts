
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

export const getAITutoringFeedback = async (subject: string, topic: string, score: number, total: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `My student got a score of ${score}/${total} in ${subject} on the topic "${topic}". Provide a brief encouraging message and a 3-step explanation.`,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Feedback unavailable.";
  }
};

export const analyzeImageContent = async (base64Image: string, subject: string) => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: `Analyze this ${subject} test paper and identify specific errors and solutions in Markdown.` }
        ]
      },
      config: { temperature: 0.4 }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Could not analyze paper.";
  }
};

/**
 * Converts a scanned test paper into a structured interactive digital test.
 */
export const generateTestFromWork = async (base64Image: string, subject: string, workName: string) => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          {
            text: `Extract all questions from this ${subject} test paper and convert them into a digital interactive test.
            Use various question types: MULTIPLE_CHOICE, TRUE_FALSE, IDENTIFICATION, or FILL_BLANK.
            Ensure explanations for why an answer is correct are included.
            Focus on creating a "retake" experience so the student can practice the material again.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'IDENTIFICATION', 'FILL_BLANK'] },
                  prompt: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'type', 'prompt', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const json = JSON.parse(response.text);
    return json.questions;
  } catch (error) {
    console.error("Test Generation Error:", error);
    return null;
  }
};
