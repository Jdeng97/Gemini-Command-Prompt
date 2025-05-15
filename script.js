import 'dotenv/config';
import fs from 'fs';
import readline from 'readline';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const HISTORY_PATH = 'chat_history.txt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatHistory = [];

// Write session header on program start
function writeSessionHeader() {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').split('.')[0]; // "YYYY-MM-DD HH:mm:ss"
  const header = `\n===== New session started at ${timestamp} =====\n`;
  fs.appendFileSync(HISTORY_PATH, header);
}

// Append chat messages with role prefix
function appendToHistoryFile(role, message) {
  const prefix = role === 'user' ? 'You: ' : 'Gemini: ';
  fs.appendFileSync(HISTORY_PATH, prefix + message + '\n');
}

// Start by writing the session header
writeSessionHeader();

function promptQuestion() {
  rl.question('You: ', async (userInput) => {
    if (userInput.trim().toLowerCase() === 'exit') {
      console.log(`Goodbye! Chat history saved in ${HISTORY_PATH}`);
      rl.close();
      return;
    }

    try {
      chatHistory.push({
        role: 'user',
        parts: [{ text: userInput }],
      });
      appendToHistoryFile('user', userInput);

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: chatHistory,
      });

      const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        console.log('Gemini:', responseText);
        chatHistory.push({
          role: 'model',
          parts: [{ text: responseText }],
        });
        appendToHistoryFile('model', responseText);
      } else {
        console.log('No response received or content is empty.');
      }
    } catch (err) {
      console.error('Error:', err);
    }

    promptQuestion();
  });
}

console.log('Start chatting with Gemini! (type "exit" to quit)\n');
promptQuestion();


