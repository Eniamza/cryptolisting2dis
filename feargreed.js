const ax = require('axios');


async function fearGreedMonitor() {

    let embed = {
        title: "Fear & Greed Index",
        description: "Current Fear & Greed Index for the crypto market.",
        color: 0x00FF00, // Green color
        fields: [],
        image: {
            url: `https://alternative.me/crypto/fear-and-greed-index.png?v=${Date.now()}`
        }
    };

    try {

        const webhooks = process.env.FEAR_WEBHOOK ? process.env.FEAR_WEBHOOK.split(',') : [];

        for (const webhook of webhooks) {
            if (!webhook.trim()) continue;

            // post the image to webhook
            await ax.post(webhook.trim(), {
                embeds: [embed],
                username: "Fear & Greed Index",
                avatar_url: "https://logos-world.net/wp-content/uploads/2020/08/Bitcoin-Logo.png"

            }).then(response => {
                console.log("Fear & Greed Index posted successfully.");
            }).catch(error => {
                console.error("Error posting Fear & Greed Index:", error);
            });
            
            // Random delay between 1 and 6 seconds
            const delay = Math.floor(Math.random() * 5001) + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

    } catch (error) {
        console.error("Error fetching Fear & Greed Index:", error);
    }

}


// Call the function to start monitoring
fearGreedMonitor().catch(console.error);
setInterval(fearGreedMonitor, 24 * 60 * 60* 1000); // Run every 24 hours