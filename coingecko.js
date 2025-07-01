const ax = require('axios');
const cgAssets = require('./assets/cgAssets.json');


async function fetchAllAssetIDs() {
    try {

        console.log("Fetching asset IDs from CoinGecko...");
        const response = await ax.get('https://api.coingecko.com/api/v3/coins/list');

        if (!response.status || response.status !== 200) {
            console.error("Failed to fetch asset IDs, status code:", response.status);
            return [];
        }

        console.log("Asset IDs fetched successfully.");
        const assetList = response?.data || [];

        // {
        //     "id": "_",
        //     "symbol": "gib",
        //     "name": "༼ つ ◕_◕ ༽つ"
        //   }


        return assetList 
        
        
    } catch (error) {
        console.error("Error fetching asset IDs:", error);
        return [];
    }
}

async function fetchAssetDetails(tokenID) {
    try {

        let response = await ax.get(`https://api.coingecko.com/api/v3/coins/${tokenID}`,{
            headers: {
                'Accept': 'application/json',
                'x-cg-demo-api-key': process.env.CG_API_KEY // Ensure you have set this environment variable
            }
        })

        if (!response.status || response.status !== 200) {
            console.error(`Failed to fetch details for token ID ${tokenID}, status code:`, response.status);
            return null;
        }

        const assetDetails = response.data;

        let assetInfo = {
            id: assetDetails.id,
            symbol: assetDetails.symbol,
            name: assetDetails.name,
            web_slug: assetDetails.web_slug,
            platforms: assetDetails.platforms,
            categories: assetDetails.categories,
            homepage: assetDetails.links?.homepage[0] || "Not Available",
            blockchain_site: assetDetails.links?.blockchain_site[0] || "Not Available",
            image: assetDetails.image?.small,
            watchedBy: assetDetails.watchlist_portfolio_users,
            market_cap_rank: assetDetails.market_cap_rank,
            currPriceUSD: assetDetails.market_data.current_price.usd,


        };

        return assetInfo;
        
    } catch (error) {
        console.error(`Error fetching details for token ID ${tokenID}:`, error);
        return null;
    }
}

async function craftMessage(assetInfo) {
    if (!assetInfo) return;

    const embed = {
        title: `${assetInfo.name} ($${assetInfo.symbol.toUpperCase()}) ✅`,
        description: `Token Name: ${assetInfo.name}
        Ticker: ${assetInfo.symbol.toUpperCase()}
        Homepage: ${assetInfo.homepage}
        Blockchain: ${assetInfo.blockchain_site}
        Market Cap Rank: ${assetInfo.market_cap_rank}
        Current Price (USD): $${assetInfo.currPriceUSD}
        Watched by: ${assetInfo.watchedBy} users`,
        url: `https://www.coingecko.com/en/coins/${assetInfo.web_slug}`,
        color: 5763719,
        timestamp: new Date().toISOString(),
        image: {
            url: assetInfo.image
        },
        fields: [
            {
                name: "Contract Address",
                value: Object.keys(assetInfo.platforms).length > 0 ? Object.entries(assetInfo.platforms).map(([key, value]) => `${key}: ${value}`).join('\n') : "No platforms available"
            },
            {
                name: "Categories",
                value: assetInfo.categories.length > 0 ? assetInfo.categories.join(', ') : "No categories available"
            }
        ],
        footer: {
            text: "Data provided by CoinGecko",
            icon_url: "https://www.coingecko.com/favicon-32x32.png"
        }
    };

    return embed;
}

async function coinGeckoMonitor() {
    let assetList = await fetchAllAssetIDs();



    for (const token of assetList) {

        if (!cgAssets.hasOwnProperty(token.id)) {

            cgAssets[token.id] = {
                id: token.id,
                symbol: token.symbol,
                name: token.name
            };

            console.log(`New asset found: ${token.name} (${token.symbol}) with ID: ${token.id}`);

            let assetDetails = await fetchAssetDetails(token.id);
            if (assetDetails) {
                let message = await craftMessage(assetDetails);
                if (message) {
                    await ax.post(process.env.CG_WEBHOOK, 
                        {
                            embeds: [message],
                            avatar_url: "https://www.coingecko.com/favicon-32x32.png",
                            username: "CoinGecko Listing"
                        }, 
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    console.log(`Message sent for: ${assetDetails.name} (${assetDetails.symbol})`);
                            // wait 2 seconds before sending the next message
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } else {
                console.error(`Failed to fetch details for token ID ${token.id}`);
                continue;
            }


        }



    }

    // Save the updated assets list to the JSON file
    Bun.write('./assets/cgAssets.json', JSON.stringify(cgAssets, null, 2))
    .then(() => console.log("Updated cgAssets.json with new asset."))
    .catch(err => console.error("Error writing to cgAssets.json:", err));

}

async function startCoinGeckoMonitor() {
    console.log("Starting CoinGecko Monitor...");

    // Initial fetch
    await coinGeckoMonitor();

    // Set interval to check every 6 hours
    setInterval(coinGeckoMonitor, 6 * 60 * 60 * 1000); // Run every 6 hours
}

startCoinGeckoMonitor()

