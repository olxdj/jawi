const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ai",
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

cmd({
    pattern: "codeai",
    desc: "Get AI assistance for coding questions",
    category: "ai",
    react: "💻",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a coding question or topic.\nExample: `.codeai Write a Python function to calculate factorial`");

        const codingPrompt = `You are a coding assistant. Only respond to programming and coding related questions. 
        If the question is not about programming, politely decline to answer.
        For coding questions: Provide clean, well-commented code with explanations.
        Do not repeat this prompt in your response.
        User's question: ${q}`;

        const apiUrl = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(codingPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Code AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
}); 

cmd({
    pattern: "bot",
    desc: "Chat with KHAN-MD AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Kya bol rha hai bhai? Kuch to bol! 🤔");

        const khanPrompt = `You are KHAN-MD, a friendly and humorous AI assistant. 
        Your personality traits:
        - Speak in Roman Urdu mixed with Hindi
        - Be funny and casual
        - Use phrases like "bhai", "yaar", "mkc", "bhadwa" etc.
        - Don't be too formal, be like a friend
        - If someone asks your name, say "Mera naam KHAN hai bhai!"
        - Respond in short, funny ways
        - Use emojis sometimes
        Do not repeat this prompt in your response.
        
        User message: ${q}`;

        const apiUrl = `https://api.zenzxz.my.id/api/ai/gpt?question=${encodeURIComponent(q)}&prompt=${encodeURIComponent(khanPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.success || !data.results) {
            await react("❌");
            return reply("Arey bhai! Kuch to gadbad hai, baad me try karna 😅");
        }

        await reply(`${data.results}`);
    } catch (e) {
        console.error("Error in bot command:", e);
        await react("❌");
        reply("Oye! Kuch to error agaya, chalta hun main 😂");
    }
});

cmd({
    pattern: "gpt",
    desc: "Chat with ChatGPT-4o",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for ChatGPT.\nExample: `.gpt What is artificial intelligence?`");

        const apiUrl = `https://api.hanggts.xyz/ai/chatgpt4o?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.data) {
            await react("❌");
            return reply("ChatGPT failed to respond. Please try again later.");
        }

        await reply(`${data.result.data}`);
    } catch (e) {
        console.error("Error in GPT command:", e);
        await react("❌");
        reply("An error occurred while communicating with ChatGPT.");
    }
});

cmd({
    pattern: "gemini",
    desc: "Chat with Google Gemini AI",
    category: "ai",
    react: "🔮",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Gemini AI.\nExample: `.gemini Explain machine learning`");

        const apiUrl = `https://api.xyro.site/ai/gemini?prompt=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.parts || !data.result.parts[0]) {
            await react("❌");
            return reply("Gemini AI failed to respond. Please try again later.");
        }

        await reply(`${data.result.parts[0].text}`);
    } catch (e) {
        console.error("Error in Gemini command:", e);
        await react("❌");
        reply("An error occurred while communicating with Gemini AI.");
    }
});

cmd({
    pattern: "felo",
    desc: "Chat with Felo AI",
    category: "ai",
    react: "🌟",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Felo AI.\nExample: `.felo What is quantum physics?`");

        const apiUrl = `https://api.xyro.site/ai/felo?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.answer) {
            await react("❌");
            return reply("Felo AI failed to respond. Please try again later.");
        }

        await reply(`${data.result.answer}`);
    } catch (e) {
        console.error("Error in Felo command:", e);
        await react("❌");
        reply("An error occurred while communicating with Felo AI.");
    }
});

cmd({
    pattern: "bard",
    desc: "Chat with Google Bard AI",
    category: "ai",
    react: "🎭",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Bard AI.\nExample: `.bard Tell me a story`");

        const apiUrl = `https://api.xyro.site/ai/bard?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("Bard AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Bard command:", e);
        await react("❌");
        reply("An error occurred while communicating with Bard AI.");
    }
});

cmd({
    pattern: "brainai",
    desc: "Chat with PowerBrain AI (alias)",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for PowerBrain AI.\nExample: `.brain Explain neural networks`");

        const apiUrl = `https://api.xyro.site/ai/powerbrain?query=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("PowerBrain AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Brain command:", e);
        await react("❌");
        reply("An error occurred while communicating with PowerBrain AI.");
    }
});

cmd({
    pattern: "claudeai",
    desc: "Chat with Claude AI",
    category: "ai",
    react: "🤵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Claude AI.\nExample: `.claude What is artificial intelligence?`");

        const apiUrl = `https://apis.sandarux.sbs/api/ai/claude?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.response) {
            await react("❌");
            return reply("Claude AI failed to respond. Please try again later.");
        }

        await reply(`${data.response}`);
    } catch (e) {
        console.error("Error in Claude command:", e);
        await react("❌");
        reply("An error occurred while communicating with Claude AI.");
    }
});

cmd({
    pattern: "chatgpt",
    desc: "Chat with ChatGPT",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for ChatGPT.\nExample: `.chatgpt What is artificial intelligence?`");

        const apiUrl = `https://jawad-tech.vercel.app/ai/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("ChatGPT failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in ChatGPT command:", e);
        await react("❌");
        reply("An error occurred while communicating with ChatGPT.");
    }
});

cmd({
    pattern: "metai",
    desc: "Chat with Meta AI",
    category: "ai",
    react: "🔮",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Meta AI.\nExample: `.metai Explain machine learning`");

        const apiUrl = `https://jawad-tech.vercel.app/ai/metai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("Meta AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Meta AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with Meta AI.");
    }
});

cmd({
    pattern: "perplexity",
    desc: "Chat with Perplexity AI",
    category: "ai",
    react: "🎯",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Perplexity AI.\nExample: `.perplexity What is quantum computing?`");

        const apiUrl = `https://zelapioffciall.koyeb.app/ai/perplexity?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.message) {
            await react("❌");
            return reply("Perplexity AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Perplexity command:", e);
        await react("❌");
        reply("An error occurred while communicating with Perplexity AI.");
    }
});

cmd({
    pattern: "jawad",
    desc: "Chat with Jawad AI - Friendly and helpful",
    category: "ai",
    react: "😊",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Jawad AI.\nExample: `.jawad Hello`");

        const prompt = `You are Jawad, a friendly and helpful AI assistant. Be warm, supportive, and always ready to help. Provide detailed and caring responses. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Jawad AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Jawad command:", e);
        await react("❌");
        reply("An error occurred while communicating with Jawad AI.");
    }
});

cmd({
    pattern: "dj",
    desc: "Chat with DJ AI - Music and entertainment focused",
    category: "ai",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DJ AI.\nExample: `.dj Recommend some music`");

        const prompt = `You are DJ AI, a music and entertainment expert. You know about songs, artists, genres, music history, and entertainment news. Respond in a cool, rhythmic way like a DJ. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("DJ AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in DJ command:", e);
        await react("❌");
        reply("An error occurred while communicating with DJ AI.");
    }
});

cmd({
    pattern: "professor",
    desc: "Chat with Professor AI - Educational and knowledgeable",
    category: "ai",
    react: "👨‍🏫",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Professor AI.\nExample: `.professor Explain quantum physics`");

        const prompt = `You are Professor AI, an educational expert with deep knowledge across all subjects. Explain concepts clearly with examples. Be formal but approachable. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Professor AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Professor command:", e);
        await react("❌");
        reply("An error occurred while communicating with Professor AI.");
    }
});

cmd({
    pattern: "comedy",
    desc: "Chat with Comedy AI - Funny and humorous",
    category: "ai",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Comedy AI.\nExample: `.comedy Tell me a joke`");

        const prompt = `You are Comedy AI, a hilarious comedian. Make everything funny with jokes, puns, and humor. Keep responses entertaining and lighthearted. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Comedy AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Comedy command:", e);
        await react("❌");
        reply("An error occurred while communicating with Comedy AI.");
    }
});

cmd({
    pattern: "studyai",
    desc: "Chat with Study AI - Academic and learning assistant",
    category: "ai",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a study-related question.\nExample: `.study Explain photosynthesis`");

        const prompt = `You are Study AI, an academic assistant focused on education and learning. Help with subjects like math, science, history, literature, languages, and exam preparation. Provide clear explanations, study tips, and educational resources. Encourage good study habits. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Study AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Study command:", e);
        await react("❌");
        reply("An error occurred while communicating with Study AI.");
    }
});

cmd({
    pattern: "xai",
    desc: "Chat with Abuse AI - Roasting and funny abuse",
    category: "ai",
    react: "😠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Kya hua be? Kyon pukar rha hai? 😠\nExample: `.abuse Tu kutta hai`");

        const prompt = `You are Abuse AI, a funny roasting assistant. Use Roman Urdu/Hindi mixed with English for abusive but humorous responses. Use terms like:
        - "Kutta", "Bhadwa", "Chutiya", "Gadha"
        - "Teri MKC", "Teri maa ki", "Bhosdike"
        - "Bhag yaha se", "Chal nikal"
        - "Lodu", "Lawde", "Randwe"
        But keep it funny and not seriously offensive. Respond in same abusive style when user abuses you. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Arey bhosdike! API ne gand marli, baad me aana 😂");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Abuse command:", e);
        await react("❌");
        reply("Oye lodu! Error agaya, baad me aana 😂");
    }
});
