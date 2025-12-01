import { tool } from '@openai/agents/realtime';
import { z } from 'zod';

const createDisplayOutputTool = (
  addMessage: (output: { userenglishText: string; userphoneticGujaratiText: string; pronounciationRating: string; aienglishText: string; aiphoneticGujaratiText: string; suggestions: string }) => void
) => {
  return tool({
    name: 'display_output',
    description: "Display the agent output including phonetic Gujarati text, English text and suggestions.",
    parameters: z.object({
      userphoneticGujaratiText: z.string().describe("The phonetic representation of the Gujarati text, in Gujarati but using English characters. For example, 'Kem cho?'"),
      userenglishText: z.string().describe("The text in English. For example, 'Hello, how are you?'"),
      pronounciationRating: z.string().describe("The pronunciation rating given by the agent out of 5. For example, '4/5'"),
      aiphoneticGujaratiText: z.string().describe("The phonetic representation of the Gujarati text, in Gujarati but using English characters. For example, 'Hu Saru Chu?'"),
      aienglishText: z.string().describe("The text in English. For example, 'Hello, how are you?'"),
      suggestions: z.string().describe("suggested responses in Gujarati with English translation, separated by commas. For example, tamaru naam su che? (What is your name?), aap kem cho? (How are you?)"),
    }),
    async execute({ userenglishText, userphoneticGujaratiText, pronounciationRating, aienglishText, aiphoneticGujaratiText, suggestions }) {
      addMessage({ userenglishText, userphoneticGujaratiText, pronounciationRating, aienglishText, aiphoneticGujaratiText, suggestions });
      return `Phonetic Gujarati: ${userphoneticGujaratiText}, Displayed output: English: ${userenglishText}, Pronunciation Rating: ${pronounciationRating}, Phonetic Gujarati: ${aiphoneticGujaratiText}, Displayed output: English: ${aienglishText},  Suggestions: ${suggestions}`;
    },
  });
};

export default createDisplayOutputTool;
