
const axios = require('axios');

let currentMarket = {};

const priceBySymbol = (symbol) => currentMarket.find(coin => coin.symbol === symbol).price_btc;

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
    // console.log(ticker.symbol, currentPrice);
    return [ticker.symbol, changePercent];
  }))
  .then(changes => changes.sort((a, b) => a[1] - b[1]));

const currentPosition = {
  balance: 10000,
  symbol: null,
  entryPrice: 0
}

const enterPosition = (symbol) => {
  if (currentPosition.symbol === symbol) {
    console.log('Continuing')
    return
  }
  const currentPrice = priceBySymbol(symbol);
  if (currentPosition.symbol) {
    const prevBalance = currentPosition.balance;
    currentPosition.balance = priceBySymbol(currentPosition.symbol) / currentPosition.entryPrice * currentPosition.balance;
    currentPosition.balance -= currentPosition.balance * 0.005;
    console.log(`Closed ${currentPosition.symbol} with change ${currentPosition.balance - prevBalance}`);
  }
  currentPosition.symbol = symbol;
  currentPosition.entryPrice = currentPrice;
  console.log(`Opened ${currentPosition.symbol} @ price ${currentPrice}`);
  console.log(`Current account balance: ${currentPosition.balance}`);
}

const latest_ = {};

const updateChanges = () => requestChanges(latest_)
  .catch(err => console.error(err));

updateChanges()
  .then(() => setInterval(() => {
    requestChanges(latest_)
      .catch(err => console.error(err))
      .then((changes) => {
        const highestChange = changes.pop();
        const [symbol, change] = highestChange;
        if (change > 0) {
          enterPosition(symbol);
        }
      })
  }, 61000 * 5));
