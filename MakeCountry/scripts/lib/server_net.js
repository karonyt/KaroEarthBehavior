import { Player, system, world } from "@minecraft/server";
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";
import { GetAndParsePropertyData, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import * as DyProp from "./DyProp";

const killLogCheckEntityIds = [`minecraft:parrot`,`minecraft:ender_dragon`,`minecraft:wolf`,`minecraft:cat`,`minecraft:wither`,`minecraft:npc`,`minecraft:villager_v2`,`minecraft:zombie_villager_v2`]

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
        if (player.dimension.id !== `minecraft:overworld` || player.getEffect(`invisibility`)) {
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

world.afterEvents.worldInitialize.subscribe(async () => {
    const req = new HttpRequest("http://localhost:20005/");
    req.body = JSON.stringify({
        serverStart: true
    });

    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);
});

world.beforeEvents.playerLeave.subscribe(async (ev) => {
    const { player } = ev;
    const Name = player.name
    const Id = player.id;
    system.runTimeout(async () => {
        const req = new HttpRequest("http://localhost:20005/");
        req.body = JSON.stringify({
            leavePlayerName: Name,
            minecraftId: Id,
        });

        req.method = HttpRequestMethod.Post;
        req.headers = [
            new HttpHeader("Content-Type", "application/json")
        ];
        await http.request(req);
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
    const req = new HttpRequest("http://localhost:20005/");
    req.body = JSON.stringify({
        firstJoin: firstJoin,
        joinPlayerName: player.name,
        minecraftId: player.id
    });

    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);
});

let chat = "a";
let chat2 = "a";
let chat3 = "a";
let chatFirst = true;
let chat2First = true;
let chat3First = true;
system.runInterval( async () => {
    const res = await http.get("http://localhost:20005/");
    if (res.body !== chat) {
        chat = res.body;
        if(chatFirst) {
            chatFirst = false;
            return;
        };
        const parseData = JSON.parse(res.body);
        if (parseData.honyakuMessage) {
            world.sendMessage(`${parseData.honyakuMessage}`);
        };
    };
},10);

system.runInterval( async () => {
    const res = await http.get("http://localhost:20007/");
    if (res.body !== chat2) {
        chat2 = res.body;
        if(chat2First) {
            chat2First = false;
            return;
        };
        const parseData = JSON.parse(res.body);
        if (parseData.authorName) {
            world.sendMessage(`§2 [§bDiscord-§r${parseData.authorName}§2] §r ${parseData.text}`);
        }
    };
},10);
system.runInterval( async () => {
    const res = await http.get("http://localhost:20004/");
    const votedata = DyProp.getDynamicProperty(`voteData`);
    if(!votedata) return;
    if (res.body !== chat3) {
        chat3 = res.body;
        if(chat3First) {
            chat3First = false;
            return;
        };            
        const parseData = JSON.parse(res.body);
        if (parseData.username) {
            let parseVotedata = JSON.parse(votedata);
            world.sendMessage(`§l§6 [VOTE]\n §r§l${parseData.username} §l§aが §f${parseData.server} §aで投票しました`);
            const req = new HttpRequest("http://localhost:20005/");
            req.body = JSON.stringify({
                username: parseData.username,
                servername: parseData.server
            });
        
            req.method = HttpRequestMethod.Post;
            req.headers = [
                new HttpHeader("Content-Type", "application/json")
            ];
            await http.request(req);
            if (Object.keys(parseVotedata).includes(`${parseData.username}`)) return;
            Object.assign(parseVotedata,{ [parseData.username]: false});
            StringifyAndSavePropertyData(`voteData`,parseVotedata);
        };
    };
}, 10);

world.afterEvents.entityDie.subscribe(async (ev) => {
    const { deadEntity: player, damageSource } = ev;
    if (!(player instanceof Player)) return;
    let reason = `Cause: ${damageSource.cause} `;
    if (damageSource?.damagingEntity) reason += `\nEntity: ${damageSource?.damagingEntity?.nameTag || damageSource?.damagingEntity?.typeId}`;
    if (damageSource?.damagingProjectile) reason += `\nProjectile: ${damageSource?.damagingProjectile?.nameTag || damageSource?.damagingProjectile?.typeId}`;
    const req = new HttpRequest("http://localhost:20005/");
    req.body = JSON.stringify({
        deadPlayerName: player?.name,
        reason: reason
    });

    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);

});

world.beforeEvents.chatSend.subscribe(event => {
    const {sender , message} = event;
    if(message === "?vote") {
        event.cancel = true;
        system.run(() => {
            const data = DyProp.getDynamicProperty(`voteData`);
            if(!data) return;
            const parseData = JSON.parse(data);
            if(!Object.keys(parseData).includes(`${sender.name}`)) {
                sender.sendMessage(`§cあなたは投票していません`);
                return;
            };
            if(parseData[`${sender.name}`] == true) {
                sender.sendMessage(`§cあなたは既に今日の報酬を受け取っています`);
                return;
            }
            if(parseData[`${sender.name}`] == false) {
                //housyuuageru syorisiro
                sender.runCommand(`give @s karo:ticket`);
                sender.sendMessage(`§a報酬を受け取りました`);
                parseData[`${sender.name}`] = true;
                StringifyAndSavePropertyData(`voteData`,parseData);
                return;
            };
        })
    };
    if(message === "?login") {
        event.cancel = true;
        system.run(() => {
        const data = DyProp.getDynamicProperty(`loginData`);
        if(!data) return;
        const parseData = JSON.parse(data);
        if(parseData[`${sender.name}`] == true) {
            sender.sendMessage(`§cあなたは既に今日の報酬を受け取っています`);
            return;
        }
        if(!parseData[`${sender.name}`]) {
            //housyuuageru syorisiro
            sender.runCommand(`give @s karo:login_ticket`);
            sender.sendMessage(`§a報酬を受け取りました`);
            parseData[`${sender.name}`] = true;
            StringifyAndSavePropertyData(`loginData`,parseData);
            return;
        };
    })
    };
});

world.afterEvents.entityDie.subscribe(async (ev) => {
    const { deadEntity, damageSource } = ev;
    if(!killLogCheckEntityIds.includes(`${deadEntity?.typeId}`)) return;
    try {
        const { x, y, z } = deadEntity.location;
        const req = new HttpRequest("http://localhost:20005/");
        req.body = JSON.stringify({
            killLog: true,
            killLogDamager: damageSource?.damagingEntity?.typeId,
            killLogDamagerName: damageSource?.damagingEntity?.nameTag,
            killLogDeader: deadEntity?.typeId,
            killLogDeaderName: deadEntity?.nameTag,
            killLogCause: damageSource?.cause,
            killLogLocation: `${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}_${deadEntity.dimension.id}`
        });

        req.method = HttpRequestMethod.Post;
        req.headers = [
            new HttpHeader("Content-Type", "application/json")
        ];
        await http.request(req);
    } catch (error) {};
});
/*
world.afterEvents.playerPlaceBlock.subscribe(async (ev) => {
    const { player, block } = ev;
    const { x, y, z } = block.location;
    const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));
    if(!chunkData) return;
    if(!chunkData?.countryId) return;
    const req = new HttpRequest("http://localhost:20005/");
    req.body = JSON.stringify({
        placeLog: true,
        placeLogPlayer: player.name,
        placeLogLocation: `${x}_${y}_${z}_${player.dimension.id}`,
        placeLogBlockType: block?.typeId,
    });

    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);
});

world.afterEvents.playerBreakBlock.subscribe(async (ev) => {
    const { player, brokenBlockPermutation, block } = ev;
    const { x, y, z } = block.location;
    const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(player));
    if(!chunkData) return;
    if(!chunkData?.countryId) return;
    const req = new HttpRequest("http://localhost:20005/");
    req.body = JSON.stringify({
        breakLog: true,
        breakLogPlayer: player.name,
        breakLogLocation: `${x}_${y}_${z}_${player.dimension.id}`,
        breakLogBlockType: brokenBlockPermutation.type.id,
    });

    req.method = HttpRequestMethod.Post;
    req.headers = [
        new HttpHeader("Content-Type", "application/json")
    ];
    await http.request(req);
});*/