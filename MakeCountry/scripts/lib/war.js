import { Container, EntityEquippableComponent, EquipmentSlot, Player, system, world } from "@minecraft/server";
import { GetAndParsePropertyData, GetChunkPropertyId, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import config from "../config";

const warCountry = new Map();

const wars = new Map();
/**
 * 
 * @param {Player} player 
 */
export function Invade(player) {
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
    /*
    if (cooltime - date > 0) {
        player.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.error.cooltime`, with: [`${Math.ceil((cooltime - date) / 100) / 10}`] }] });
        return;
    };
    */

    playerCountryData.invadeCooltime = date + (config.invadeCooltime * 1000);
    playerCountryData.peaceChangeCooltime = 7;
    //平和主義
    //モブ出す
    //クールタイム
    //切り替えれないように変更
    const coreEntity = player.dimension.spawnEntity(`mc:core`, player.getHeadLocation());
    warCountry.set(`${playerCountryData.id}`, { country: targetCountryData.id, core: coreEntity.id, time: date + 1000 * 20 * 60, key: key });
    coreEntity.nameTag = `${targetCountryData.name}§r Core`;
    const { x, y, z } = coreEntity.location;
    const msg = `${x}, ${y}, ${z} [${coreEntity.dimension.id.replace(`minecraft:`, ``)}`;
    player.addTag(`war${key}`);
    coreEntity.addTag(`war${key}`);
    wars.set(`${key}`, true);
    world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n§f` }, { translate: `invade.success`, with: [`${player.name}§r(${playerCountryData.name}§r)`, `${msg}§r(${targetCountryData.name}§r`] }] });
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

world.afterEvents.entityDie.subscribe((ev) => {
    const { deadEntity } = ev;
    if (!deadEntity.isValid()) return;
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
    const playerCountryData = GetAndParsePropertyData(`country_${key}`);
    const invadeCountryData = GetAndParsePropertyData(`country_${data.country}`);
    const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(deadEntity));
    chunkData.countryId = playerCountryData.id;
    if (invadeCountryData.territories.includes(chunkData.id)) {
        invadeCountryData.territories.splice(playerCountryData.territories.indexOf(chunkData.id), 1);
    };
    playerCountryData.territories.push(chunkData.id);
    StringifyAndSavePropertyData(chunkData.id, chunkData);
    StringifyAndSavePropertyData(`country_${playerCountryData.id}`, playerCountryData);
    StringifyAndSavePropertyData(`country_${invadeCountryData.id}`, invadeCountryData);
    deadEntity.removeTag(deadEntity.getTags().find(tag => tag.startsWith(`war`)))
    warCountry.delete(key);
    world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.won`, with: [`§r${playerCountryData.name}§r`, `${invadeCountryData.name}§r`] }] });
});

world.afterEvents.entityDie.subscribe((ev) => {
    const { deadEntity } = ev;
    if (!deadEntity.isValid()) return;
    if (deadEntity?.typeId !== `minecraft:player`) return;
    const tags = deadEntity.getTags().find(a => a.startsWith(`war`));
    if (!tags) return;
    const key = tags.split(`war`)[1];
    const playerData = GetAndParsePropertyData(`player_${deadEntity.id}`);
    if (!warCountry.has(`${playerData.country}`)) return;
    /**
     * @type {{ country: number, core: string }}
     */
    const warData = warCountry.get(`${playerData.country}`);
    const playerCountryData = GetAndParsePropertyData(`country_${playerData.country}`);
    const warCountryData = GetAndParsePropertyData(`country_${warData.country}`);
    const core = world.getEntity(warData.core);
    if (core) {
        core.remove();
    };
    deadEntity.removeTag(`war${key}`);
    wars.delete(key);
    world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.guard`, with: [`§r${warCountryData.name}§r`, `${playerCountryData.name}§r`] }] });
});

world.beforeEvents.playerLeave.subscribe((ev) => {
    const { player: deadEntity } = ev;
    if (!deadEntity.isValid()) return;
    if (deadEntity?.typeId !== `minecraft:player`) return;
    const tags = deadEntity.getTags().find(a => a.startsWith(`war`));
    if (!tags) return;
    const id = deadEntity.id;
    system.run(() => {
        const key = tags.split(`war`)[1];
        const playerData = GetAndParsePropertyData(`player_${id}`);
        if (!warCountry.has(`${playerData.country}`)) return;
        /**
         * @type {{ country: number, core: string }}
         */
        const warData = warCountry.get(`${playerData.country}`);
        const playerCountryData = GetAndParsePropertyData(`country_${playerData.country}`);
        const warCountryData = GetAndParsePropertyData(`country_${warData.country}`);
        const core = world.getEntity(warData.core);
        if (core) {
            core.remove();
        };
        wars.delete(key);
        world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.guard`, with: [`§r${warCountryData.name}§r`, `${playerCountryData.name}§r`] }] });
    });
});

world.afterEvents.entityDie.subscribe((ev) => {
    if (!ev.deadEntity.isValid()) return;
    if (ev.deadEntity.typeId != `minecraft:player`) return;
    const playerData = GetAndParsePropertyData(`player_${ev.deadEntity.id}`);
    if (!playerData?.country) return;
    const values = [];
    for (const key of warCountry.keys()) {
        const data = warCountry.get(key);
        values.push(data.country);
        if (data.country == playerData.country) break;
    };
    if (!values.includes(playerData.country) && !warCountry.has(`${playerData.country}`)) return;
    /** 
    * @type { Container } 
    */
    let playerContainer = ev.deadEntity.getComponent(`inventory`).container;
    for (let i = 0; i < 36; i++) {
        if (typeof playerContainer.getItem(i) === 'undefined') continue;
        world.getDimension(ev.deadEntity.dimension.id).spawnItem(playerContainer.getItem(i), ev.deadEntity.location);
    };
    /** 
    * @type { EntityEquippableComponent } 
    */
    let playerEquipment = ev.deadEntity.getComponent(`minecraft:equippable`);
    const slotNames = ["Chest", "Head", "Feet", "Legs", "Offhand"];
    for (let i = 0; i < 5; i++) {
        if (typeof playerEquipment.getEquipment(slotNames[i]) === 'undefined') continue;
        world.getDimension(ev.deadEntity.dimension.id).spawnItem(playerEquipment.getEquipment(slotNames[i]), ev.deadEntity.location);
    };
    ev.deadEntity.runCommandAsync(`clear @s`);
});

system.runInterval(() => {
    const date = new Date().getTime();
    for (const key of warCountry.keys()) {
        const data = warCountry.get(key);
        if (data.time < date) {
            warCountry.delete(key);
            wars.delete(`${data.key}`);
            const playerCountryData = GetAndParsePropertyData(`country_${key}`);
            const warCountryData = GetAndParsePropertyData(`country_${data.country}`);
            const core = world.getEntity(data.core);
            if (core) {
                core.remove();
            };
            world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `invade.guard`, with: [`§r${warCountryData.name}§r`, `${playerCountryData.name}§r`] }] });
        };
    };
}, 20);