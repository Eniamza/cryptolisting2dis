const ax = require('axios');
const dsAssets = require('./assets/dsAssets.json');


async function fetchLatestTokens() {
    try {

        console.log("Fetching latest tokens from DeScreener...");
        const response = await ax.get('https://api.dexscreener.com/token-profiles/latest/v1');

        if (!response.status || response.status !== 200) {
            console.error("Failed to fetch latest tokens, status code:", response.status);
            return [];
        }

        console.log("Latest tokens fetched successfully.");
        const tokenList = response?.data || [];

        return tokenList
        
    } catch (error) {
        console.error("Error fetching latest tokens:", error);
        return [];
    }
}

async function craftMessage(token) {

    let description = token.description ? token.description : "";

    let fields = token.links && Array.isArray(token.links) ? 
    token.links.map(field => {
        return {
            name: field?.type || field?.label || "Link",
            value: field.url
        };
    }) : [];

    let embed = {
        title: `New Token Listed ✅`,
        url: token.url,
        description: `Blockchain: \`${token.chainId.toUpperCase()}\`
        Contract Address: \`${token.tokenAddress}\`

        ${description}`,
        color: 16777215,
        image: {
            url: token.openGraph// Fallback logo URL
        },
        timestamp: new Date().toISOString(),
        fields: fields

    }

    if (embed.description.length > 4096) {
        embed.description = embed.description.substring(0, 4090) + '...'; // Truncate description if too long
    }

    return embed;

}

async function dsMonitor() {

    let tokenList = await fetchLatestTokens();

    for (const token of tokenList) {
     
        if (dsAssets.hasOwnProperty(token.tokenAddress)) {
            // console.log(`Token ${token.id} already exists in dsAssets.json, skipping...`);
            continue; // Skip if token already exists
        }

        // Add the new token to dsAssets
        dsAssets[token.tokenAddress] = token;
        console.log(`New token found: ${token.tokenAddress}`);

        // Craft the message for the new token
        let message = await craftMessage(token);
        console.log("Crafted message for new token");

        // Send the message to the webhook
        try {
            await ax.post(process.env.DS_WEBHOOK, 
                {
                    embeds: [message],
                    avatar_url: "https://play-lh.googleusercontent.com/Oh3K6G7xRvEPc9_6E-ia_dsVjICoviD9o72MqYNeawTRR10x6U4RN8hznrv_pPH-c610",
                    username: "DexScreener Listing"
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(`Message sent for token ${token.tokenAddress}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(error);
            break; // Break the loop on error
            
        }
        
    }

    // Save the updated dsAssets to the file
    Bun.write('./assets/dsAssets.json', JSON.stringify(dsAssets, null, 2))
    console.log("Updated dsAssets.json with new tokens.");
}

async function startMonitor() {
    console.log("Starting DeScreener monitor...");
    await dsMonitor();
    
    setInterval(async () => {
        console.log("Running DeScreener monitor...");
        await dsMonitor();
    },  20 * 1000); // Check every 20 seconds
}

startMonitor()