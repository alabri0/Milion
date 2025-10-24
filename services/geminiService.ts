import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER, description: "Unique ID for the question, from 1 to 15." },
      question: { type: Type.STRING, description: "The trivia question text in Arabic." },
      options: {
        type: Type.OBJECT,
        properties: {
          A: { type: Type.STRING },
          B: { type: Type.STRING },
          C: { type: Type.STRING },
          D: { type: Type.STRING },
        },
        required: ['A', 'B', 'C', 'D'],
        description: "An object containing four possible answers."
      },
      answer: { type: Type.STRING, description: "The key of the correct answer ('A', 'B', 'C', or 'D')." },
      difficulty: { type: Type.STRING, description: "The difficulty of the question: 'easy', 'medium', or 'hard'." },
      category: { type: Type.STRING, description: "The category of the question, which should be the provided topic." },
    },
    required: ['id', 'question', 'options', 'answer', 'difficulty', 'category'],
  },
};

export const generateQuestions = async (topic: string, age: number | null): Promise<Question[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let difficultyInstruction: string;

    if (age && !isNaN(age)) {
        difficultyInstruction = `
        The questions' difficulty, complexity, and content must be suitable and appropriate for a person who is ${age} years old.
        Despite this age targeting, please still provide a progressive difficulty distribution relative to that age group:
        - 5 "easy" questions (simple for a ${age}-year-old).
        - 5 "medium" questions (challenging for a ${age}-year-old).
        - 5 "hard" questions (very difficult for a ${age}-year-old).
        `;
    } else {
        difficultyInstruction = `
        The questions must have a balanced and progressive difficulty distribution:
        - Exactly 5 questions with "easy" difficulty.
        - Exactly 5 questions with "medium" difficulty.
        - Exactly 5 questions with "hard" difficulty.
        `;
    }

    const prompt = `
      Please generate exactly 15 trivia questions in ARABIC about the topic "${topic}".
      ${difficultyInstruction}
      Each question must adhere to the following structure:
      1.  A unique "id" from 1 to 15.
      2.  The "question" text.
      3.  An "options" object with four distinct choices labeled "A", "B", "C", and "D".
      4.  An "answer" field containing the key of the correct option.
      5.  The "difficulty" as a string ('easy', 'medium', or 'hard').
      6.  The "category" for all questions must be the given topic: "${topic}".

      Your output must be a valid JSON array that strictly follows the provided schema. Do not include any extra text, explanations, or markdown formatting outside of the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text.trim();
    const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
    const generatedQuestions: Question[] = JSON.parse(cleanedText);
    
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length < 15) {
        throw new Error("AI did not generate enough valid questions.");
    }

    // Shuffle the questions to mix difficulties for a better gameplay experience
    return generatedQuestions.sort(() => Math.random() - 0.5);

  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    throw new Error("Failed to generate questions from AI.");
  }
};