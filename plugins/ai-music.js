/*
 * Khan MD Plugin
 * AI Music Generator 🎶
 * By: JawadTechX
 * Channel: https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
 */

const axios = require('axios');
const { cmd } = require('../command'); 
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function aimusic(prompt, { tags = 'pop, romantic' } = {}) {
    try {
        if (!prompt) throw new Error('Prompt is required');

        // 🔸 Generate Lyrics using AI
        const { data: lyricApiRes } = await axios.get(
            'https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat',
            {
                params: {
                    query: JSON.stringify([
                        {
                            role: 'system',
                            content:
                                'You are a professional lyricist AI trained to write poetic and rhythmic song lyrics. Respond with lyrics only, using [verse], [chorus], [bridge], and [instrumental] or [inst] tags to structure the song. Use only the tag (e.g., [verse]) without any numbering or extra text.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]),
                    link: 'writecream.com'
                },
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    Referer: 'https://writecream.com/'
                }
            }
        );

        const generatedLyrics = lyricApiRes.response_content;
        if (!generatedLyrics) throw new Error('Failed to get lyrics from AI.');

        // 🔸 Send to HuggingFace Music Generator
        const session_hash = Math.random().toString(36).substring(2);
        await axios.post(`https://ace-step-ace-step.hf.space/gradio_api/queue/join?`, {
            data: [
                240,
                tags,
                generatedLyrics,
                60,
                15,
                'euler',
                'apg',
                10,
                '',
                0.5,
                0,
                3,
                true,
                false,
                true,
                '',
                0,
                0,
                false,
                0.5,
                null,
                'none'
            ],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash: session_hash
        });

        // 🔸 Poll for Result
        let resultMusicUrl;
        let pollingAttempts = 0;
        const maxPollingAttempts = 120;
        const pollingInterval = 1000;

        while (!resultMusicUrl && pollingAttempts < maxPollingAttempts) {
            const { data } = await axios.get(
                `https://ace-step-ace-step.hf.space/gradio_api/queue/data?session_hash=${session_hash}`
            );
            const lines = data.split('\n\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.substring(6));
                    if (d.msg === 'process_completed' && d.output?.data?.[0]?.url) {
                        resultMusicUrl = d.output.data[0].url;
                        break;
                    } else if (d.msg === 'queue_full' || d.msg === 'process_failed') {
                        throw new Error(`HF Space Error: ${d.msg}`);
                    }
                }
            }
            if (!resultMusicUrl) {
                pollingAttempts++;
                await delay(pollingInterval);
            }
        }

        if (!resultMusicUrl) throw new Error('Timeout: Failed to generate AI music URL.');
        return resultMusicUrl;

    } catch (error) {
        console.error('Error in aimusic generator:', error.message);
        throw new Error(`❌ AI Music Error: ${error.message}`);
    }
}

cmd({
    pattern: 'aimusic',
    alias: ['generatemusic', 'tomusic'],
    desc: 'Generate AI music from a text prompt',
    category: 'ai',
    react: '🎶',
    filename: __filename,
    // ✅ Limit & Premium Removed
    limit: false,
    premium: false
}, async (conn, m, text, { prefix, command }) => {

    if (!text) {
        return await conn.sendMessage(m.chat, {
            text: `🎧 *AI Music Generator*\n\nUsage:\n${prefix + command} <prompt>|[tags]\n\nExample:\n${prefix + command} A romantic song about stars and love | pop`
        }, { quoted: m });
    }

    const args = text.split('|').map(a => a.trim());
    const prompt = args[0];
    const tags = args[1] || 'pop, romantic';

    if (!prompt) {
        return await conn.sendMessage(m.chat, { text: '⚠️ Prompt nahi diya gaya!' }, { quoted: m });
    }

    // 🌀 Reactions for process
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Start

    try {
        const musicUrl = await aimusic(prompt, { tags });

        // 🛠 Processing done
        await conn.sendMessage(m.chat, { react: { text: '🛠️', key: m.key } });

        await conn.sendMessage(m.chat, {
            audio: { url: musicUrl },
            mimetype: 'audio/mpeg',
            fileName: `aimusic_${Date.now()}.mp3`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('AI Music Command Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.sendMessage(m.chat, { text: e.message }, { quoted: m });
    }
});
