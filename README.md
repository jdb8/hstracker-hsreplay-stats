⚠️ **This is alpha experimental software, use at your own risk!**

## About

This is a quick script created to generate a compatible `cardtier.json` for use with the macOS version of [HSTracker](https://github.com/HearthSim/HSTracker), using [HSReplay arena card stats](https://hsreplay.net/cards/#gameType=ARENA).

* It requires no changes to HSTracker itself
* It always pulls fresh data when you run the script
* It looks at HSReplay class-specific data

## Usage

1. Clone or download this repo
1. Install [latest node](https://nodejs.org/en/)
1. `cd` into the cloned repo and install dependencies with `npm install`
1. Run `node index.mjs` to pull latest arena stat info and create a local `log_data.json` file
1. (optional) back up your existing `cardtier.json` inside `/Users/$USER/Library/Application Support/HSTracker/arena`
1. Copy the `cardtier.json` file into `/Users/$USER/Library/Application Support/HSTracker/arena`, or symlink it for convenience
1. Restart HSTracker

The newly-generated `cardtier.json` will now be used by HSTracker to display "deck winrate" in place of arena tierlist score.

## Limitations

Due to the way HSTracker currently displays scores, the deck winrates currently are displayed multipled by 10. For example, if a card has a deck winrate of `62.1%`, HSTracker will display this as a "score" of `621`.

Example:

![image](https://user-images.githubusercontent.com/643295/121826921-14f57980-cc6f-11eb-9965-37357d415aa7.png)

Live DH data puts these cards at `59.1%`, `58.3%`, and `52.2%` (but be careful of the sample size, which isn't displayed! Use your best judgement).

## Future functionality

* [ ] support for played winrate or other stats
* [ ] support for displaying played count to highlight low sample sizes
