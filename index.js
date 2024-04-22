let currentAssets = require('./CurrAssets.json')
const ax = require('axios');

async function fetchAllUSDTList (){

    let response = await fetch('https://www.mexc.com/api/platform/spot/market-v2/web/symbols')
    response = await response.json()
    response = response.data.USDT
    return response
}

let sendMsg = function sendMessage(message,logourl){


    ax.post("https://discord.com/api/webhooks/1231961425220730941/m8__efWwqfmlGYkaKBMPOfqjv0LD7RIaRb7ICyhirZGtc59aDDYfu3eX9zFiAH5oU8WF", {
        content: message,
        avatar_url: logourl

        
    }).then(response => {
        console.log('Message sent:', message);
    }).catch(error => {
        console.error('Error:', error);
    });

} 

async function mexcMonitor(){

    let tokenList = await fetchAllUSDTList()

    tokenList.forEach(element => {

        if(!currentAssets.find(a => a.id === element.id)){
            
            console.log("New Asset Found:",element.vn)

            let message = `

                **Asset Name:** ${element.vn} || ${element.fn}\n**Asset Link:** https://www.mexc.com/tokens/${element.vn}
            
            `

            sendMsg(message,`https://www.mexc.com/api/file/download/${element.in}.png`)


        }
        
    });

    currentAssets = tokenList; // Update current assets

    Bun.file('./CurrAssets.json',JSON.stringify(currentAssets,null,2))

    console.log(`New Log at: ${Date.now().toLocaleString()}`)
    

}

setInterval(mexcMonitor,10000) // Run 10s