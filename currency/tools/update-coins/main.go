// Downloads a list of coins from coinmarketcap.com
// and constructs `symbol.rs` list of currency symbols

package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"sort"
	"strings"
	"text/template"
	"unicode"

	"os"
)

// Coin - Coin data.
type Coin struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Symbol           string `json:"symbol"`
	Rank             string `json:"rank"`
	PriceUsd         string `json:"price_usd"`
	PriceBtc         string `json:"price_btc"`
	Two4HVolumeUsd   string `json:"24h_volume_usd"`
	MarketCapUsd     string `json:"market_cap_usd"`
	AvailableSupply  string `json:"available_supply"`
	TotalSupply      string `json:"total_supply"`
	PercentChange1H  string `json:"percent_change_1h"`
	PercentChange24H string `json:"percent_change_24h"`
	PercentChange7D  string `json:"percent_change_7d"`
	LastUpdated      string `json:"last_updated"`
	Num              int
}

func main() {
	resp, err := http.Get("https://api.coinmarketcap.com/v1/ticker/")
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	var coins []*Coin
	if err := json.NewDecoder(resp.Body).Decode(&coins); err != nil {
		log.Fatal(err)
	}

	// Leave only serious coins
	coins = onlySeriousCoins(coins)

	// Sort coins by symbol
	sort.Sort(bySymbol(coins))

	coinmap, err := readCoinsData()
	if err != nil {
		log.Fatal(err)
	}

	assigned := make(map[int]string)
	for i, coin := range coinmap {
		assigned[coin] = i
	}

	// TODO: read coins.json
	for i, coin := range coins {
		coin.Num = i + 3
		coin.Num = getNum(coin, assigned, coinmap)

		assigned[coin.Num] = coin.Symbol
		coinmap[coin.Symbol] = coin.Num
	}

	// Sort coins by num
	sort.Sort(byNum(coins))

	if err := saveCoinsData(coins); err != nil {
		log.Fatal(err)
	}

	f, err := os.Create("src/symbols.rs")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	t := template.Must(template.ParseGlob("tools/update-coins/*.tmpl"))
	if err := t.Execute(f, coins); err != nil {
		log.Fatal(err)
	}

}

func getNum(coin *Coin, assigned map[int]string, coinmap map[string]int) int {
	if num, ok := coinmap[coin.Symbol]; ok {
		return num
	}
	if _, numUsed := assigned[coin.Num]; numUsed {
		coin.Num++
		return getNum(coin, assigned, coinmap)
	}
	return coin.Num
}

func readCoinsData() (res map[string]int, err error) {
	body, err := ioutil.ReadFile("tools/update-coins/coins.json")
	res = make(map[string]int)
	err = json.Unmarshal(body, &res)
	if err != nil {
		return
	}
	return
}

func saveCoinsData(coins []*Coin) (err error) {
	coinmap := make(map[string]int)
	for _, coin := range coins {
		coinmap[coin.Symbol] = coin.Num
	}
	body, err := json.Marshal(coinmap)
	if err != nil {
		return
	}
	return ioutil.WriteFile("tools/update-coins/coins.json", body, os.FileMode(755))
}

// No serious coin has a number in front of a symbol
// serious coins also are aware of existing use of a symbol
func onlySeriousCoins(coins []*Coin) (res []*Coin) {
	counts := make(map[string]int)
	for _, coin := range coins {
		counts[coin.Symbol]++
	}
	for _, coin := range coins {
		if strings.Contains(coin.Symbol, "@") {
			log.Printf("Dumb symbol %q", coin.Symbol)
			continue
		}
		// First character in symbol
		r := rune(coin.Symbol[0])
		if !unicode.IsLetter(r) {
			log.Printf("Dumb symbol %q", coin.Symbol)
			continue
		}
		// Ignore coin symbol if more than one
		if counts[coin.Symbol] > 1 {
			log.Printf("Doubled symbol %q", coin.Symbol)
			continue
		}
		res = append(res, coin)
	}
	return res
}

type bySymbol []*Coin

func (a bySymbol) Len() int           { return len(a) }
func (a bySymbol) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a bySymbol) Less(i, j int) bool { return a[i].Symbol < a[j].Symbol }

type byNum []*Coin

func (a byNum) Len() int           { return len(a) }
func (a byNum) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a byNum) Less(i, j int) bool { return a[i].Num < a[j].Num }
