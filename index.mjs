#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function getData(url) {
    const resp = await fetch(url);
    const json = await resp.json();
    return JSON.parse(JSON.stringify(json, null, 2));
}

// async function getDataCached(url, filename) {
//     const localFilePath = path.resolve('./data', filename);
//     let data;
//     if (fs.existsSync(localFilePath)) {
//         console.log('loading from disk', localFilePath);
//         data = fs.readFileSync(localFilePath, 'utf8');
//     } else {
//         console.log('fetching fresh', url);
//         data = await fetch(url).then(r => r.json()).then(json => JSON.stringify(json, null, 2));
//         fs.mkdirSync('data', {recursive: true});
//         fs.writeFileSync(localFilePath, data, 'utf8');
//     }

//     return JSON.parse(data);
// }

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

    console.log({ statsByHeroAndDbfId });

    allIds.forEach((dbfId) => {
        const cardData = cardIdMap.get(dbfId);
        if (!cardData) {
            // A card may not be in the data set at all
            return;
        }

        const { id, name } = cardData;

        const allValue = statsByHeroAndDbfId.get(JSON.stringify(['ALL', dbfId]));
        const value = heros.map((h) => {
            const key = JSON.stringify([h, dbfId]);
            // Multiply by 10 because HSTracker can only display 3 digit numbers
            // So percentages like 62.1% will display as 621, or -1 if missing
            return `${Math.round(statsByHeroAndDbfId.get(key) * 10 || -1)}`;
        });

        logData.push({
            id,
            name,
            value,
        });
    });

    fs.writeFileSync('cardtier.json', JSON.stringify(logData, null, 2));
    return logData;
}

async function getArenaDataForClass() {
    const arenaData = await getData(
        'https://hsreplay.net/analytics/query/card_list_free/?GameType=ARENA&TimeRange=CURRENT_PATCH',
        'arena_data.json'
    );
    return arenaData.series.data;
}

console.log(JSON.stringify(await main(), null, 2));
