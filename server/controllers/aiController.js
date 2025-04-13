import fetch from 'node-fetch';

export const suggestGiftIdeas = async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "No wishlist items provided" });
    }

    const combinedText = items.map(item => `${item.name}: ${item.description || ''}`).join('\n');
    const prompt = `
    I have a wishlist with these items:
    ${combinedText}

    Based on these, suggest 3 new creative gift ideas. For each gift, provide:

    - Try to relate to the items in the wishlist of users
    - Space between each suggestion

    Leave a blank line between each item. Avoid repeating the original wishlist items.
    `;

    try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
        }),
        });

        const data = await openaiRes.json();
        console.log("OpenAI raw response:", data);
        const suggestions = data.choices?.[0]?.message?.content || "No suggestions available.";

        res.json({ success: true, suggestions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'AI request failed' });
    }
};
