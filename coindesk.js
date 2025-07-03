const ax = require('axios');


async function fetchTopExchangeByVolume(tokenName) {

    const url = `https://min-api.cryptocompare.com/data/top/exchanges?fsym=${tokenName}&tsym=USD&api_key=${process.env.COINDESK_API_KEY}`;
    

    const response = await ax.get(url, {
        headers: {
            'Accept': 'application/json',
            'charset': 'utf-8',
        }
    })

    if (!response.status || response.status !== 200) {
        console.error("Failed to fetch top exchange by volume, status code:", response.status);
        return null;
    }

    const data = response.data.Data;

    return data

}

async function coindeskMonitor() {

    let topExchangesBTC = await fetchTopExchangeByVolume("BTC");
    let topExchangesETH = await fetchTopExchangeByVolume("ETH");
    // let topExchangesBNB = await fetchTopExchangeByVolume("BNB");
    let topExchangesXRP = await fetchTopExchangeByVolume("SOL");

    let topExchangesMerged = [...topExchangesBTC, ...topExchangesETH, ...topExchangesBNB, ...topExchangesXRP];

    let index = 1;

    for (let exchange of topExchangesMerged) {

        if (index > 5) {
            index = 1; // Reset index after 5 exchanges
        }

        let embed = {
            title: `Top Exchange by Volume for $${exchange.fromSymbol} | Rank: ${index}  `, 
            description: `**Exchange**: ${exchange.exchange}`,
            color: 16776960, // Green color
            fields: [
                {
                    name: "24h Volume",
                    value: `${exchange.volume24h.toFixed(2)} ${exchange.fromSymbol}`,
                    inline: true
                },
                {
                    name: "24h Volume (USD)",
                    value: `${exchange.volume24hTo.toFixed(2)} ${exchange.toSymbol}`,
                    inline: true
                },
                {
                    name: "Price",
                    value: `${exchange.price.toFixed(2)} ${exchange.toSymbol}`,
                    inline: true
                },
                {
                    name: "Exchange Grade Point",
                    value: exchange.exchangeGradePoints.toString(),
                    inline: false
                },
                {
                    name: "Exchange Grade",
                    value: exchange.exchangeGrade,
                    inline: false
                }
            ]
        };

        try {
            await ax.post(process.env.CD_WEBHOOK, {
                embeds: [embed],
                username: "Top Exchanges",
                avatar_url: "https://png.pngtree.com/png-vector/20250306/ourmid/pngtree-green-red-trading-candlestick-logo-clipart-for-stock-forex-and-crypto-vector-png-image_15455728.png"
            }).then(response => {
                console.log("Top Exchange posted successfully:", response.data);
            }).catch(error => {
                console.error("Error posting Top Exchange:", error);
            });
        } catch (error) {
            console.error("Error fetching Top Exchange:", error);
        }

        // Wait for 1 second before posting the next exchange
        await new Promise(resolve => setTimeout(resolve, 2000));

        index++;
    }

}

coindeskMonitor().catch(console.error);
setInterval(coindeskMonitor, 24 * 60 * 60 * 1000); // Run every 24 hours