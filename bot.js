// Import required modules
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API Key
});

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for messages
client.on('messageCreate', async (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  // Command to get a daily quote and generate an image
  if (message.content.toLowerCase() === '!quote') {
    try {
      // Fetch a random quote from the ZenQuotes API
      const response = await axios.get('https://zenquotes.io/api/random');
      const quote = response.data[0];

      // Send the quote to the Discord channel
      message.channel.send(`📜 **"${quote.q}"** — *${quote.a}*`);

      // Generate an image using DALL-E 3 based on the quote
      console.log('Generating image from OpenAI...');

      const openAiResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `"${quote.q}" in a beautiful artistic style, digital art`,
        n: 1,
        size: '1024x1024',
      });

      // Extract the image URL from the response
      const imageUrl = openAiResponse.data[0].url;

      // Send the generated image URL to the Discord channel
      message.channel.send(`🖼️ Here's an image inspired by the quote: ${imageUrl}`);

    } catch (error) {
      // Log detailed error information
      console.error('Error:', error.response ? error.response.data : error.message);

      // Send an error message to the Discord channel
      message.channel.send('❌ Could not fetch a quote or generate an image. Try again later.');
    }
  }
});

// Login to Discord with your bot token
client.login(process.env.TOKEN);
