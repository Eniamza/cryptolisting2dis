const ax = require('axios');


async function fearGreedMonitor() {

    let embed = {
        title: "Fear & Greed Index",
        description: "Current Fear & Greed Index for the crypto market.",
        color: 0x00FF00, // Green color
        fields: [],
        image: {
            url: "https://alternative.me/crypto/fear-and-greed-index.png"
        }
    };

    try {

        // post the image to webhook
        await ax.post(process.env.FEAR_WEBHOOK, {
            embeds: [embed],
            username: "Fear & Greed Index",
            avatar_url: "https://logos-world.net/wp-content/uploads/2020/08/Bitcoin-Logo.png"

        }).then(response => {
            console.log("Fear & Greed Index posted successfully:", response.data);
        }).catch(error => {
            console.error("Error posting Fear & Greed Index:", error);
        });
        

        
    } catch (error) {
        console.error("Error fetching Fear & Greed Index:", error);
    }

}


// Call the function to start monitoring
fearGreedMonitor().catch(console.error);
setInterval(fearGreedMonitor, 24 * 60 * 60* 1000); // Run every 24 hours