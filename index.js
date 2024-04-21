
async function fetchAllUSDTList (){

    let response = await fetch('https://www.mexc.com/api/platform/spot/market-v2/web/symbols')
    response = await response.json()
    console.log(response.data.USDT)
}

fetchAllUSDTList()