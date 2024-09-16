import { Player, system, world } from "@minecraft/server";
import { GetAndParsePropertyData, GetChunkPropertyId, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import config from "../config";

const warCountry = new Map();

const wars = new Map();
/**
 * 
 * @param {Player} player 
 */
export function invade(player) {
    let key = 0;
    for (let i = 1; i < 16; i++) {
        if (wars.has(`${i}`)) continue;
        key = i;
        break;
    };
    if (key == 0) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.maxinvade` }] });
        return;
    };
    const chunk = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));
    if (!chunk || !chunk?.countryId) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.wilderness` }] });
        return;
    };
    const playerData = GetAndParsePropertyData(`player_${player.id}`);
    if (chunk?.countryId == playerData?.country) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.mycountry` }] });
        return;
    };
    const playerCountryData = GetAndParsePropertyData(`country_${playerData.country}`);
    if (playerCountryData?.peace) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.peace` }] });
        return;
    };
    if (warCountry.has(`${playerCountryData.id}`)) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.iswarnow` }] });
        return;
    };
    if (playerCountryData.alliance.includes(chunk.countryId)) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.alliance` }] });
        return;
    };
    const targetCountryData = GetAndParsePropertyData(`country_${chunk.countryId}`);
    if (targetCountryData?.peace) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.target.peace` }] });
        return;
    };
    const date = new Date().getTime();
    const cooltime = playerCountryData?.invadeCooltime ?? date - 1000;
    if (cooltime - date > 0) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.cooltime`, with: [`${Math.ceil((cooltime - date) / 100) / 10}`] }] });
        return;
    };

    playerCountryData.invadeCooltime = date + (config.invadeCooltime * 1000);
    playerCountryData.peaceChangeCooltime = 7;
    //平和主義
    //モブ出す
    //クールタイム
    //切り替えれないように変更
    const coreEntity = player.dimension.spawnEntity(`mc:core`, player.getHeadLocation());
    warCountry.set(`${playerCountryData.id}`, { country: targetCountryData.id, core: coreEntity.id });
    coreEntity.nameTag = `${targetCountryData.name}§r Core`;
    let chunkmsg = GetPlayerChunkPropertyId(player).split(/(?<=^[^_]+?)_/)[1];
    const msg = chunkmsg.replace(/_/g, ` `);
    player.addTag(`war${key}`);
    wars.set(`${key}`, true);
    world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.success`, with: [`${player.name}§r(${playerCountryData.name}§r)`, `${msg}§r(${playerCountryData.name}§r`] }] });
    StringifyAndSavePropertyData(`country_${playerCountryData.id}`, playerCountryData);
};

world.afterEvents.entityLoad.subscribe((ev) => {
    const entity = ev.entity;
    if (entity?.typeId !== `mc:core`) return;
    let isWar = false;
    warCountry.forEach((value, key, map) => {
        if (entity.id == value.core) {
            isWar = true;
        };
    });
    if (!isWar) {
        entity.remove();
    };
});

world.afterEvents.playerSpawn.subscribe((ev) => {
    const { initialSpawn, player } = ev;
    if (initialSpawn) {
        const tags = player.getTags().filter(a => a.startsWith(`war`));
        for (let i = 0; i < tags.length; i++) {
            player.removeTag(tags[i]);
        };
    };
});

world.afterEvents.worldInitialize.subscribe(() => {
    const players = world.getPlayers();
    for (const player of players) {
        const tags = player.getTags().filter(a => a.startsWith(`war`));
        for (let i = 0; i < tags.length; i++) {
            player.removeTag(tags[i]);
        };
    };
});

system.runInterval(() => {
    const players = world.getPlayers();
    for (const player of players) {
        const tags = player.getTags().filter(a => a.startsWith(`war`));
        if (tags.length == 0) continue;
        player.isGliding = false;
    };
});

world.afterEvents.entityDie.subscribe((ev) => {
    const { deadEntity } = ev;
    if (deadEntity?.typeId !== `mc:core`) return;
    let isWar = false;
    let key = ``;
    warCountry.forEach((value, mapKey, map) => {
        if (deadEntity.id == value.core) {
            isWar = true;
            key = mapKey;
        };
    });
    if (!isWar) {
        return;
    };
    /**
     * @type {{ country: number, core: string }}
     */
    const data = warCountry.get(key);
    const playerCountry = Number(key);
    const playerCountryData = GetAndParsePropertyData(`country_${playerCountry}`);
});