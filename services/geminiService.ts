
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzePoem = async (imageBase64: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const systemInstruction = `
    You are a Senior CIE (Cambridge Assessment International Education) English Literature Examiner. 
    Analyze the poem in the provided image with academic rigor following the 0475 IGCSE or 9695 A-Level standards.
    
    CRITICAL REQUIREMENTS:
    1. Analysis must cover Tone, Structure, Context, Personal Response, and Literary Devices.
    2. Generate 3 typical CIE exam-style questions (e.g., "In what ways does the poet...", "How does the poet vividly convey...").
    3. For each question, provide a high-scoring model answer (Level 5/6) that integrates AOs.
    4. Provide a predicted mark and grade.
    
    AOs FOCUS:
    - AO1: Detailed knowledge of the text.
    - AO2: Appreciation of the writer's choices of language, form, and structure.
    - AO3: Personal and evaluative response.
    - AO4: Historical/Social Context (where applicable).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64.split(',')[1],
          },
        },
        {
          text: "Perform a complete CIE standard literary analysis. Include a set of Exam Practice questions and answers at the end.",
        },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          ocrContent: { type: Type.STRING },
          tone: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              effects: { type: Type.STRING }
            }
          },
          structure: { type: Type.STRING },
          context: { type: Type.STRING },
          personalResponse: { type: Type.STRING },
          literaryDevices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                device: { type: Type.STRING },
                example: { type: Type.STRING },
                effect: { type: Type.STRING }
              }
            }
          },
          meaning: {
            type: Type.OBJECT,
            properties: {
              explicit: { type: Type.STRING },
              implicit: { type: Type.STRING }
            }
          },
          examQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                marks: { type: Type.NUMBER },
                modelAnswer: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          cieEvaluation: {
            type: Type.OBJECT,
            properties: {
              ao1: { type: Type.STRING },
              ao2: { type: Type.STRING },
              ao3: { type: Type.STRING },
              ao4: { type: Type.STRING },
              totalMark: { type: Type.NUMBER },
              maxMark: { type: Type.NUMBER },
              grade: { type: Type.STRING },
              examinerComments: { type: Type.STRING }
            }
          }
        },
        required: ["title", "author", "ocrContent", "tone", "examQuestions", "literaryDevices", "cieEvaluation"]
      },
    },
  });

  if (!response.text) {
    throw new Error("No analysis received from AI.");
  }

  return JSON.parse(response.text) as AnalysisResult;
};
