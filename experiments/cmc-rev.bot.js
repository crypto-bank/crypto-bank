
const fs = require('fs');
const axios = require('axios');

let currentMarket = {};

const priceBySymbol = (symbol) => parseFloat(currentMarket.find(coin => coin.symbol === symbol).price_btc);

const requestChanges = (latest) => axios.get('https://api.coinmarketcap.com/v1/ticker/')
  .then(resp => (currentMarket = resp.data).map(ticker => {
    const lastPrice = latest[ticker.symbol];
    const currentPrice = parseFloat(ticker.price_btc);
    let changePercent = 0;
    if (lastPrice) {
      const change = currentPrice - lastPrice;
      changePercent = change / lastPrice;
    }
    latest[ticker.symbol] = currentPrice;
    return [ticker.symbol, changePercent];
  }))
  .then(changes => changes.sort((a, b) => a[1] - b[1]))
  .then(changes => {
    fs.appendFileSync('log2.txt', JSON.stringify(changes) + '\n');
    return changes;
  });

const currentPosition = {
  balance: 0.01,
  lbalance: 0.01, // 294611725.60
  symbol: null,
  entryPrice: 0
}

const calculateNewBalance = (prevBalance, posPrice, l = 1) => {
  const newBalance = posPrice / currentPosition.entryPrice * prevBalance;
  const newBalanceAfterFee = newBalance - (newBalance * 0.0025) - (prevBalance * 0.0025);
  const gainBalance = (newBalanceAfterFee - prevBalance) * l;
  const changePercent = gainBalance / prevBalance * 100;
  return [prevBalance + gainBalance, changePercent];
}


const enterPosition = (symbol) => {
  const currentPrice = priceBySymbol(symbol);
  if (currentPosition.symbol === symbol) {
    console.log(`Continuing @ price ${currentPrice}`);
    return
  }
  if (currentPosition.symbol) {
    const posPrice = priceBySymbol(currentPosition.symbol);
    const [newBalance, changePercent] = calculateNewBalance(currentPosition.balance, posPrice);
    const [newLBalance, lchange] = calculateNewBalance(currentPosition.lbalance, posPrice, 2.5);
    currentPosition.balance = newBalance;
    currentPosition.lbalance = newLBalance;
    console.log(`${nowHour()} Closed ${currentPosition.symbol} @ price ${posPrice.toFixed(8)} P&L: ${changePercent.toFixed(2)}% / ${lchange.toFixed(2)}%`);
  }
  currentPosition.symbol = symbol;
  currentPosition.entryPrice = currentPrice;
  console.log(`${nowHour()} Opened ${currentPosition.symbol} @ price ${currentPrice.toFixed(8)}, balance: ${currentPosition.balance.toFixed(8)}, balance w/leverage: ${currentPosition.lbalance.toFixed(8)}`);
}

const latest_ = {};

const updateChanges = () => requestChanges(latest_)
  // .then(changes => console.log(changes))
  .catch(err => console.error(err));

updateChanges()
  .then(() => setInterval(() => {
    requestChanges(latest_)
      .then((changes) => {
        const highestChange = changes.shift();
        const [symbol, change] = highestChange;
        // if (change < 0) {
        enterPosition(symbol);
        // }
      })
  }, 60000 * 5 + 1000));

const nowHour = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
}

console.log(`${nowHour()} Started balance: ${currentPosition.balance.toFixed(8)}, balance w/leverage: ${currentPosition.lbalance.toFixed(8)}`);
