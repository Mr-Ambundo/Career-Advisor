import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const systemPrompt = `You are a career guidance assistant. Keep responses short, clear, and to the point.  
- Limit follow-up questions to **a maximum of 3** per response.
- Use **bullet points** for listing options or key takeaways.    
- Prioritize **actionable advice** over excessive explanation.  
- Guide the conversation toward **practical career decisions** efficiently.  
- Format responses with bullet points where necessary.  
- Start every conversation by asking job-related questions like: 
  - "Can you tell me about yourself?"
  - "What are your current skills and work experience?"
  - "What kind of job or career are you interested in?"
  - "Are you open to training or skill development opportunities?"
- Analyze the client’s responses and suggest suitable job opportunities, training programs, and career paths.
- Ask relevant follow-up questions to gather complete information.
- Ensure your responses are:
  - Clear, structured, and easy to understand.
  - Personalized based on the client's inputs.
  - Encouraging and motivating, offering practical career advice.
  - Formatted with markdown when appropriate.`;



app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to process request' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Failed to process request' })}\n\n`);
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});