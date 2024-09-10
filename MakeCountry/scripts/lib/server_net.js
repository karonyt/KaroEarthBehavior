import { GameMode, Player, system, world } from "@minecraft/server";
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";
import { GetAndParsePropertyData, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import { executeCommand } from "../anticheat";
import * as DyProp from "./DyProp";

const killLogCheckEntityIds = [`minecraft:parrot`, `minecraft:ender_dragon`, `minecraft:wolf`, `minecraft:cat`, `minecraft:wither`, `minecraft:npc`, `minecraft:villager_v2`, `minecraft:zombie_villager_v2`]

const mcChatChannelId = "1281902314784948276";
const mcLogChannelId = "1282605398678831164";

// リアルタイムマップの情報更新
system.runInterval(async () => {
    const players = world.getPlayers();
    for (const player of players) {
        const req = new HttpRequest("http://localhost:20006/update");

        req.method = HttpRequestMethod.Post;
        req.headers = [
            new HttpHeader("Content-Type", "application/json")
        ];
        const date = new Date();
        let { x, z } = player.location;
        if (player.dimension.id !== `minecraft:overworld` || player.getEffect(`invisibility`) || player.getGameMode() == GameMode.spectator) {
            x = -100000;
            z = -100000;
        };

        req.body = JSON.stringify({
            name: player.name,
            point: {
                name: player.name,
                x: Math.floor(x),
                y: Math.floor(z),
                url: "https://media.discordapp.net/attachments/1142836936654979082/1143836800104800358/image.png?ex=668da948&is=668c57c8&hm=20d83ad632464ee4084e1c7705327e7b0e09412d98bd406074881719994a6fca&=&format=webp&quality=lossless&width=778&height=562",
                lastUpdated: date.getTime(),
                imageUrl: undefined
            },
        });
        await http.request(req);
        if (player.dimension.id !== `minecraft:overworld`) continue;
        const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));
        const [c, x2, z2, d] = GetPlayerChunkPropertyId(player).split(`_`);
        const countryData = GetAndParsePropertyData(`country_${chunkData?.countryId}`);
        const countryName = countryData?.name || undefined;
        const id = countryData?.id || undefined;
        const req2 = new HttpRequest("http://localhost:20006/land");

        req2.method = HttpRequestMethod.Post;
        req2.headers = [
            new HttpHeader("Content-Type", "application/json")
        ];
        req2.body = JSON.stringify({
            name: countryName,
            id: id ?? 0,
            x_y: `${x2}_${z2}`
        });
        await http.request(req2);
    };
}, 100);


async function sendEvent(body) {
    const req = new HttpRequest("http://localhost:20005/event/send");

    req.body = JSON.stringify(body);
    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);
}

async function sendToDiscord(data) {
    sendEvent({
        type: 'send_to_discord',
        data: data
    });
}

// サーバー開始時にメッセージを表示
world.afterEvents.worldInitialize.subscribe(async () => {
    await sendToDiscord({
        channelId: mcChatChannelId,
        content: {
            embeds: [
                {
                    color: 0x7cfc00,
                    description: "Server Started"
                }
            ]
        }
    });
});

world.beforeEvents.playerLeave.subscribe(async (ev) => {
    const { player } = ev;
    const Name = player.name
    const Id = player.id;
    system.runTimeout(async () => {
        await sendEvent({
            type: 'leave',
            data: {
                minecraftId: Id,
                playerName: Name
            }
        });
    });
});

world.afterEvents.playerSpawn.subscribe(async (ev) => {
    const { player, initialSpawn } = ev;
    if (!initialSpawn) return;
    let firstJoin = false;
    if (!player.hasTag(`firstJoin`)) {
        world.sendMessage(`§a[かろEarth]\n§b${player.name} §r§bさんが初参加です`);
        firstJoin = true;
        player.addTag(`firstJoin`);
    };
    await sendEvent({
        type: 'join',
        data: {
            firstJoin: firstJoin,
            minecraftId: player.id,
            playerName: player.name
        }
    });
});

let chat3 = "a";
let chat3First = true;
// let chat = "a";
// let chatFirst = true;
// system.runInterval(async () => {
//     const res = await http.get("http://localhost:20005");
//     if (res.body !== chat) {
//         chat = res.body;
//         if (chatFirst) {
//             chatFirst = false;
//             return;
//         };
//         const parseData = JSON.parse(res.body);
//         if (parseData.honyakuMessage) {
//             world.sendMessage(`${parseData.honyakuMessage}`);
//         };
//     };
// }, 10);

subscribeEvent();
// レスポンスに合わせて処理
async function subscribeEvent() {
    console.warn('start long polling');
    const req = new HttpRequest("http://localhost:20005/event/receive");
    req.timeout = 180;
    req.method = HttpRequestMethod.Get;
    const res = await http.request(req);
    if (res.status == 502) {
    } else if (res.status != 200) {
    } else {
        netEventHandler(res);
    }
    subscribeEvent();
}

function discordChatToMcChat(data) {
    world.sendMessage(`§2 [§bDiscord-§r${data.authorName}§2] §r ${data.text}`);
}

function netEventHandler(res) {
    const events = {
        discord_chat: discordChatToMcChat
    };
    const eventList = JSON.parse(res.body);

    for (const event of eventList) {
        const type = event.type;
        const data = event.data;
        const handler = events[type];

        if (handler) handler(data);
    }
}

// vote通知
system.runInterval(async () => {
    const res = await http.get("http://localhost:20004/");
    const votedata = DyProp.getDynamicProperty(`voteData`);
    if (!votedata) return;
    if (res.body !== chat3) {
        chat3 = res.body;
        if (chat3First) {
            chat3First = false;
            return;
        };
        const parseData = JSON.parse(res.body);
        if (parseData.username) {
            let parseVotedata = JSON.parse(votedata);
            world.sendMessage(`§l§6 [VOTE]\n §r§l${parseData.username} §l§aが §f${parseData.server} §aで投票しました`);
            await sendToDiscord({
                channelId: mcChatChannelId,
                content: {
                    embeds: [
                        {
                            color: 0x0095d9,
                            description: `Voted!!\n${parseData.username} が ${parseData.server} で投票しました`
                        }
                    ]
                }
            });
            if (Object.keys(parseVotedata).includes(`${parseData.username}`)) return;
            Object.assign(parseVotedata, { [parseData.username]: false });
            StringifyAndSavePropertyData(`voteData`, parseVotedata);
        };
    };
}, 10);

let reqque = null
system.runInterval(async () => {
    const res = await http.get("http://localhost:20905/");
    if (res.body !== reqque) {
        if (reqque == null) {
            reqque = res.body;
            return;
        }
        reqque = res.body;
        const parseData = JSON.parse(res.body);
        switch (parseData.type) {
            case `command`: {
                executeCommand(parseData.data, false);
                break;
            };
            case `ban`: {
                const rawDeviceIds = DyProp.getDynamicProperty("deviceIds") || "[]";
                const deviceIds = JSON.parse(rawDeviceIds);
                /**
                 * @type {Player}
                 */
                const targetPlayers = world.getPlayers({ name: parseData.user });
                if (targetPlayers.length == 0) return;
                const target = targetPlayers[0];
                const playerRawDataBefore = target.getDynamicProperty("accountData");
                /**
                 * @type {{ "deviceId": [string] , "id": string , "xuid": string }}
                 */
                const playerParseDataBefore = JSON.parse(playerRawDataBefore);
                for (let deviceId of playerParseDataBefore.deviceId) {
                    if (!deviceIds.includes(deviceId)) {
                        deviceIds.push(deviceId);
                    };
                };
                DyProp.setDynamicProperty("deviceIds", JSON.stringify(deviceIds));

                if (parseData?.reason != "") target.setDynamicProperty(`banReason`, parseData?.reason);
                target.setDynamicProperty(`isBan`, true);
                target.runCommand(`kick "${playerParseDataBefore.xuid}" §c§lあなたはBANされています\nReason: ${parseData?.reason}`);
                world.sendMessage(`§a[KaronNetWork BAN System]§r\n${target.name} §r§7の接続を拒否しました`);
                break;
            };
            case `mute`: {
                const targetPlayers = world.getPlayers({ name: parseData.user });
                if (targetPlayers.length == 0) return;
                const target = targetPlayers[0];
                target.setDynamicProperty(`isMute`, true);
                break;
            };
            case `unmute`: {
                const targetPlayers = world.getPlayers({ name: parseData.user });
                if (targetPlayers.length == 0) return;
                const target = targetPlayers[0];
                target.setDynamicProperty(`isMute`);
                break;
            };
            case `unban`: {
                world.getDimension(`overworld`).runCommand(`scriptevent karo:unban ${parseData.user}`);
                break;
            };
        };
    }
}, 10);

world.afterEvents.entityDie.subscribe(async (ev) => {
    const { deadEntity: player, damageSource } = ev;
    if (!(player instanceof Player)) return;
    let reason = `Cause: ${damageSource.cause} `;
    if (damageSource?.damagingEntity) reason += `\nEntity: ${damageSource?.damagingEntity?.nameTag || damageSource?.damagingEntity?.typeId}`;
    if (damageSource?.damagingProjectile) reason += `\nProjectile: ${damageSource?.damagingProjectile?.nameTag || damageSource?.damagingProjectile?.typeId}`;

    sendToDiscord({
        channelId: mcChatChannelId,
        content: {
            embeds: [
                {
                    color: 0x730099,
                    description: `[Dead] ${player.name}\n${reason}`
                }
            ]
        }
    });
});

// vote,login コマンド
world.beforeEvents.chatSend.subscribe(event => {
    const { sender, message } = event;
    if (message === "?vote") {
        event.cancel = true;
        system.run(() => {
            const data = DyProp.getDynamicProperty(`voteData`);
            if (!data) return;
            const parseData = JSON.parse(data);
            if (!Object.keys(parseData).includes(`${sender.name}`)) {
                sender.sendMessage(`§cあなたは投票していません`);
                return;
            };
            if (parseData[`${sender.name}`] == true) {
                sender.sendMessage(`§cあなたは既に今日の報酬を受け取っています`);
                return;
            }
            if (parseData[`${sender.name}`] == false) {
                //housyuuageru syorisiro
                sender.runCommand(`give @s karo:ticket`);
                sender.sendMessage(`§a報酬を受け取りました`);
                parseData[`${sender.name}`] = true;
                StringifyAndSavePropertyData(`voteData`, parseData);
                return;
            };
        })
    };
    if (message === "?login") {
        event.cancel = true;
        system.run(() => {
            const data = DyProp.getDynamicProperty(`loginData`);
            if (!data) return;
            const parseData = JSON.parse(data);
            if (parseData[`${sender.name}`] == true) {
                sender.sendMessage(`§cあなたは既に今日の報酬を受け取っています`);
                return;
            }
            if (!parseData[`${sender.name}`]) {
                //housyuuageru syorisiro
                sender.runCommand(`give @s karo:login_ticket`);
                sender.sendMessage(`§a報酬を受け取りました`);
                parseData[`${sender.name}`] = true;
                StringifyAndSavePropertyData(`loginData`, parseData);
                return;
            };
        })
    };
});

world.afterEvents.entityDie.subscribe(async (ev) => {
    const { deadEntity, damageSource } = ev;
    //if (!killLogCheckEntityIds.includes(`${deadEntity?.typeId}`)) return;
    try {
        const { x, y, z } = deadEntity.location;

        await sendToDiscord({
            channelId: mcLogChannelId,
            content: `\`\`\`[kill] \nDeaderType: ${deadEntity?.typeId}\nDeaderName: ${deadEntity?.nameTag}\nCause: ${damageSource?.cause}\nDamagerType: ${damageSource?.damagingEntity?.typeId}\nDamagerName: ${damageSource?.damagingEntity?.nameTag}\nLocation: ${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}_${deadEntity.dimension.id}\`\`\``
        });
    } catch (error) { };
});

world.afterEvents.playerPlaceBlock.subscribe(async (ev) => {
    const { player, block } = ev;

    const { x, y, z } = block.location;

    const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));

    //if(!chunkData) return;
    //if(!chunkData?.countryId) return;

    await sendToDiscord({
        channelId: mcLogChannelId,
        content: `\`\`\`[place] \nPlayerName: ${player.name}\nBlock: ${block?.typeId}\nLocation: ${x}_${y}_${z}_${player.dimension.id}\`\`\``
    });
});

world.afterEvents.playerBreakBlock.subscribe(async (ev) => {
    const { player, brokenBlockPermutation, block } = ev;
    const { x, y, z } = block.location;
    const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));
    //if(!chunkData) return;
    //if(!chunkData?.countryId) return;\
    await sendToDiscord({
        channelId: mcLogChannelId,
        content: `\`\`\`[break] \nPlayerName: ${player.name}\nBlock: ${brokenBlockPermutation.type.id}\nLocation: ${x}_${y}_${z}_${player.dimension.id}\`\`\``
    });
});