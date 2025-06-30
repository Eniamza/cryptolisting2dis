let currentAssets = require('./mexcAssets.json')
const ax = require('axios');

async function fetchAllUSDTList() {
    console.log("Fetching USDT List from MEXC...");

//     :authority
// www.mexc.com
// :method
// GET
// :path
// /api/platform/spot/market-v2/web/symbols
// :scheme
// https
// accept
// text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
// accept-encoding
// gzip, deflate, br, zstd
// accept-language
// en-US,en;q=0.7
// cache-control
// max-age=0
    
    // Use simpler headers that match what's working in Postman
    let headers = {
        "Cache-Control": "max-age=0",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/", 
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Connection": "keep-alive",
        "priority": "u=0,1",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1"
    };
    
    try {
        console.log("Sending request to MEXC API...");
        let response = await ax.get('https://www.mexc.com/api/platform/spot/market-v2/web/symbols', {
            headers: headers
        });
        
        console.log("Response received with status:", response.status);
        let resp = response.data?.data?.USDT || [];
        return resp;
    } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
            console.error("Error data:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received");
        }
        return []; // Return empty data on error
    }
}

let sendMsg = function sendMessage(element,logourl){

    const embed = {
        title: `${element.fn} ($${element.vn}) ✅`,
        description: `Token Name: ${element.fn} \nTicker: ${element.vn}\nContract Address: ${element?.ca || "Not Available"} \nAsset Link: https://www.mexc.com/tokens/${element.vn}`,
        url: `https://www.mexc.com/tokens/${element.vn}`,
        color: 3426654,
        timestamp: new Date().toISOString()
      }

    ax.post(process.env.MEXC_WEBHOOK, 
        {
            embeds: [embed],
            avatar_url: logourl
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    ).then(response => {
        console.log('Message sent for:', element.vn);
    }).catch(error => {
        console.error('Error:', error);
    });

} 

async function mexcMonitor(){

    let tokenList = await fetchAllUSDTList()

    for (const element of tokenList) {

        if(!currentAssets.find(a => a.id === element.id)){
            
            console.log("New Asset Found:",element.vn)

            sendMsg(element,`https://www.mexc.com/api/file/download/${element.in}.png`)

            // wait 2 seconds before sending the next message
            await new Promise(resolve => setTimeout(resolve, 2000));

        }
        
    };

    currentAssets = tokenList; // Update current assets

    await Bun.write('./mexcAssets.json', JSON.stringify(currentAssets, null, 2));

    console.log(`New Log at: ${Date.now().toLocaleString()}`)
    

}

async function startMonitor() {
    console.log("Starting MEXC Monitor...");

    // Initial fetch
    await mexcMonitor();

    // Set interval to check every 6 hours
    setInterval(mexcMonitor, 6 * 60 * 60 * 1000) // Run 10s
}

startMonitor()