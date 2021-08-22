#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import _debug from 'debug';
import logSymbols from 'log-symbols';

const debug = _debug('hstracker-hsreplay-stats');

const CARD_TIER_FILENAME = 'cardtier.json';

async function getData(url) {
    const resp = await fetch(url);
    const json = await resp.json();
    return JSON.parse(JSON.stringify(json, null, 2));
}

async function main() {
    const allCards = await getData('https://api.hearthstonejson.com/v1/latest/enUS/cards.json', 'cards.json');
    const cardIdMap = new Map();
    allCards.forEach(({ name, id, dbfId }) => {
        cardIdMap.set(dbfId, { id, name, dbfId });
    });

    const arenaRankingData = await getArenaDataForClass();
    const heros = [
        // Order is specific one used by HSTracker
        'WARRIOR',
        'SHAMAN',
        'ROGUE',
        'PALADIN',
        'HUNTER',
        'DRUID',
        'WARLOCK',
        'MAGE',
        'PRIEST',
        'DEMONHUNTER',
    ];
    let logData = [];
    const statsByHeroAndDbfId = new Map();
    const allIds = new Set();

    Object.entries(arenaRankingData).forEach(([hero, heroData]) => {
        for (const card of heroData) {
            allIds.add(card.dbf_id);
            const key = JSON.stringify([hero, card.dbf_id]);
            statsByHeroAndDbfId.set(key, card.included_winrate);
        }
    });

    debug({ statsByHeroAndDbfId });

    allIds.forEach((dbfId) => {
        const cardData = cardIdMap.get(dbfId);
        if (!cardData) {
            // A card may not be in the data set at all
            return;
        }

        const { id, name } = cardData;

        const value = heros.map((h) => {
            const key = JSON.stringify([h, dbfId]);
            const value = statsByHeroAndDbfId.get(key);
            if (!value) {
                return -1;
            }
            return Math.round(value * 10) / 10;
        });

        logData.push({
            id,
            name,
            value,
        });
    });

    fs.writeFileSync(CARD_TIER_FILENAME, JSON.stringify(logData, null, 2));
    return logData;
}

async function getArenaDataForClass() {
    const arenaData = await getData(
        'https://hsreplay.net/analytics/query/card_list_free/?GameType=ARENA&TimeRange=CURRENT_PATCH',
        'arena_data.json'
    );
    return arenaData.series.data;
}

const data = await main();
debug(data);

console.log(logSymbols.success, `Downloaded scores for ${data.length} cards to ${CARD_TIER_FILENAME}`);
console.log(logSymbols.info, 'Run (only necessary once):')
console.log(
    logSymbols.info,
    `    ln -sf "$PWD/${CARD_TIER_FILENAME}" "/Users/$USER/Library/Application Support/HSTracker/arena"`
);
console.log(logSymbols.warning, 'Don’t forget to restart HSTracker!');

