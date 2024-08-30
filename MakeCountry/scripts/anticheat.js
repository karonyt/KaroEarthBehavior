import { world, Player, system, GameMode, EquipmentSlot } from "@minecraft/server";
import { ModalFormData, FormCancelationReason } from "@minecraft/server-ui"
import { ChestFormData } from "./lib/chest-ui";
import { itemIdToPath } from "./texture_config";
import * as DyProp from "./lib/DyProp";

const unbanList = [];
const banList = [`giyokundaK`, `bedrock6gatu`, `D Berlin98`, `reizylake`, `Harukixx1008`, "Abell3653",
    "AboveHaddock178", "AftLettuce55996", "AgateRhino99915", "aim toppi", "aiueo0106", "akakki123", "akikann0136", "alex00123030", "Amekun6305", "amoiz", "anime to1053", "Anthony4933",
    "AntiStarling473", "AQWSEDZRF", "ARON brother", "asuma6", "Ata9Client", "ATNF10", "AudioLamp263003", "ayumu11ryoko", "Baby 0728",
    "BlandSquirrel48", "BlessingSumo858", "bokutiro012", "BossLamb7162256","BOT mumei 23", "BoxingBoat66122", "brack dream", "BrokenBow791",
    "CastSleet363811", "Caxlierl", "comars019", "commander A7126", "CrazyLamb287426",
    "creeeper0000", "Dark pote9476", "DeathTroy re", "Dia8500", "dolaneko0312", "dollpico1024", "Donuku5117", "Dream09e",
    "Dream159", "DreamGame435", "EarthColt468824", "EastBurrito2025", "elliotfinne", "EnDerEzYq1447", "EnforcedSpy6019",
    "EvilMammal84831", "FartherHat1634", "FFX777", "FinalMudkip85", "FireClover51345", "Ghacku", "giyokundaK", "GK asuma6",
    "gomennnatyai", "gori5000", "greel0428", "greenking1442", "guraymar", "hanamitio4444", "hannkyuu0417",
    "Harukinau329", "hennakao9711", "Herobrine14339", "herobrine664802", "hikataku688", "HitherPond53619", "HumdredCow72", "hx1w", "HyperMedaca",
    "hyuga0106", "ika286desuga", "ikkich7994", "imageman309", "inouenoue", "Ishan 7773624", "jetskispeed", "jeyuu08274", "jinsora5984",
    "Johnny Kearnsl", "JUNmaster108", "Jyuya4112", "Kakapotato77", "kamekkixi", "Kanamaster8", "kansyucyo546952", "kaorunrun1849", "Kashbabies23",
    "kazuki ziba", "KIDX4615", "KineticGuitar62", "kishigaya sutsu", "kitachini", "kizaki0808", "koil V0", "kojikku", "kooooo1103", "KOTENATU",
    "kurano121pvp", "kurogannmo", "kuroneko1300", "Kyoto otomad", "L 2b2emcpeEZ", "LeanGrain434742", "lix624", "lu4264", "mabo papa0906", "maikura121209", "MansiTheBest",
    "masa1145147410", "masato10208798", "mattun1226", "mbuton0630pc", "Meltoria666", "merc0ryJP", "MiddleAbyss5264", "mikadukiyuu0919", "minecraft622732",
    "minectyuio", "MIS SHADER4329", "misosoupkure", "miyaQ9", "mizu12165338", "mochi mochi 888", "mochi9626", "Mustardapple984", "N1GHTMARESS9198", "NackerGameJP",
    "nagi2907", "nameko1010", "nappunkun", "Nashikaziki", "NewDaichi", "NightWool337855", "nikoichi0229422", "NorthWolf88158", "nqErqLu zEh1", "NuncleCorn",
    "oharudao6491", "Onur3910", "OocandyoO520", "Opk88", "ourinsan", "ovalsoda3631", "owo0303", "PeakAttic816794", "PEXkoukunn", "pinu2012", "PitiedNickel242",
    "PointedAlpaca71", "pokotinmaru", "PortPurse109910", "PrintMender4851", "RAHULGAMEROP630", "RainbowArt8028", "RdstnMstr301", "ReaQwQDayo", "red kooooo",
    "RegentDuke34366", "reimu122", "Relond213", "REM717", "ren25256786", "rgl purin", "riceballkundayo", "Ricky5028", "riirie72", "riku390", "riku564219", "Rimru2101",
    "Ritsu Kun2261", "RodDellPvP5621", "RyoKMR0508", "ryoku9515",  "s5000GT", "Sakuty0021", "SasuGames539", "satoiori1025", "Scout1072", "SharpnesNeco",
    "shine7986354", "shironeko19273", "SidelingGem3742", "sirokuma1234893", "skelskel123", "SKULLBLOCK6551", "skykobachi",  "SORIKUN OP", "souan78", "soulgazeeeee",
    "SourCarp1913349", "spyluvme", "StarAttorney249", "StepSkip01", "StipuledVirus1", "Sueqkjs", "sugiwan0402", "SwankSnail58571", "syake113",
    "takebon5631", "TakeMyL", "takoyaki304", "TallishTundra79", "TallJarl2427753", "tanaka33234", "TapeableTrain21",  "TenMite36115759",
    "TheLoveHax", "ThoricGos33", "ThreeTrain7676", "tink0901", "TK31493", "tokiwa 09090", "tomato168489", "tomiokakcinshi", "tomoJAVAsb5326",
    "TomomonU", "tomorrow1205", "TootleChips", "Toto7562", "Totti38335", "TouyamaRyou", "TraumaticGnu790", "TriableAuthor93", "TTmasa22",
    "tubuhiro", "Tuftymakoto99", "TwiningImpala94", "Tzyww", "uk5509", "unaa2007", "unntidekakingu", "useroes846", "VacatedApollo44", "VehementBoar279",
    "VisitingFox2042", "VneyX", "w M a R u x", "x1xLeox1x7614", "xLrsK1ng QwQ", "XNPUPS", "xRqre3", "XsteveX8231", "xSwaqqy", "XxMr MarsXx", "XxPvPxX",
    "Yiuki6357", "yugona3", "yui4123904",  "yuki12294657", "Yukinariyyy", "yukiya03184401", "yukkun23", "Yukui523", "Yusan3016",
    "Yuto BEed8191", "yuu2007sei", "yuumiyuyu", "YUZUGAMI1130", "zabieru1336", "ZINOAAA", "ZxRodDellxZ"
];

const banDevices = [
    "85c4ae1b-4a92-3b47-9714-0bfdd6397d53", "fdfa140e-03ee-373b-966f-de5215603f95", "ab349a99-2ebe-316b-993d-4c76d2dcbf5e", "6847eeae-6556-3b72-99a2-149dc0a2d747",
    "f96221e1-330d-3ab4-94fe-994b9a76f3f7", "40b4eb46-d9d4-3f2b-abba-8b9d582acaa9", "47c9774a-c55b-4a5b-975c-d106580eef93", "fa157827-4130-3f78-be95-6ece2b83ca8c",
    "90c34bf1-d12f-3134-b3ae-b3e86eb4566c", "859161f4-76d5-32dd-b916-9666ec147cfe", "619fdf0f-e28a-38a1-ac79-74b387be46a6", "27453364-4803-39fc-a2d6-d96f6b76e021",
    "42aca7da-0463-442e-a914-44f6c1124e58", "0b8084dc-867a-380b-bb7f-af314ec02668", "f55185d5-7996-362a-bd41-3375e9a3f565", "0113e630-4bd5-340c-be5b-a0552fa2e578",
    "e673759a-fa3a-58fd-a0dd-fdeb094bd6dc", "878f4383-bff8-301d-b74b-a16051ecd476", "045e25e7-db10-3b64-9e33-04c9697323db", "5558e1ba-f2fc-38e1-abb8-18ff1da9a16f",
    "b9f258bb-9678-3bbf-a7d9-a4de13161ad4", "79735f3e-75a9-3d44-8d3e-63c34881cacb", "8fa76914-1134-32fe-8f89-340e9bd3d276", "7441a4ad-2208-3551-a628-4ed8274099fc",
    "86f7406c-2998-3cb6-b032-b1a0f228db25",  "326714ad-40ec-3735-86f2-b94ed8b2f65c", "6bb17974-8562-3cc3-bac9-19471b43d29a", "cd60bf20-75d0-3d6e-ac6e-0f56649131e0",

    "e2d4bc12-c3b3-3f0b-bc60-d18adcbb6139",
    "8d577333-fc91-329b-8b33-c1992d2e4f99",
    "1334f95c-8c87-33eb-9d5f-e91c7d3952a8",
    "3ccfbded-3b53-3458-bd23-d3a2b6f0f695",
    "18d4079f-e1bc-3e20-96c5-6921660659d7",
    "ed625a58-6224-3722-bbf1-30bb9119b783",
    "a8e39ea1-2966-3c5d-b076-c97ec8b32e9e",
    "94F692AADA2E4DAEACB8B0561D326DFD",
    "21f7bb74-c5f1-3d56-ad7a-43722b49a5bd",
    "0b96087e-53f5-3e45-a9ac-f191b869ac6d",
    "2eb0970c-973e-3768-b90b-f8aeda8a9b6a",
    "8a460c5a-be4a-3d2b-b96f-a843a33e5286",
    "dba4a466-99dd-37fc-ba16-7543b84c5d70",
    "f26091568e6f4fca98177578c7f2a605",
    "b4b15af7-1bbe-3edc-ada0-f45cd266d2a0",
    "62f7b4b9-0298-3405-808a-0da11071228c",
    "67dd5940-e67f-3ceb-b2ef-e52ba417ef97",
    "a96b6460-ebdf-3b81-8671-c4f816d85740",
    "dc8d9fb0-a67b-3a9a-a942-271f757c7c8d",
    "3041cb7d9c78411887f3a3ae6d9c5b31",
    "49b582d3-5103-37d6-9bcb-cc698e4ed057",
    "8e48d39e-bc49-3b41-82b6-c2bec52adf45",
    "a6ae93ee-8028-3ba7-b024-d4710ab0486b",
    "63e6efc6-112c-344f-8e2d-d5c58fb7e6e2",
    "62ed8539-32a0-4536-bdc9-51d32541ea22",
    "2c9fbdad-5372-38e5-9a1b-f8c47965b547",
    "69e91212-9932-3713-b206-d5960ea75abf",
    "7bc7bc74-770c-3a34-ac75-af64eb9cb928",
    "0da4aa50-15d5-3ac0-8fbd-9ffe42b2f181",
    "944b6849-56cb-3163-8a77-dd260e39c438",
    "ea08a4cd-1ccc-3885-b364-17191c8a9196"
]

const unmuteList = [];
const muteList = [];

const rawDeviceIds = DyProp.getDynamicProperty("deviceIds") || "[]";
/**
 * @type {[string]}
 */
const deviceIds = JSON.parse(rawDeviceIds);

world.afterEvents.playerSpawn.subscribe(async (ev) => {
    const { player } = ev;
    /**
     * @type {{"command": "listd", "result": [{ "deviceSessionId": string , "id": number , "xuid": string }]}}
     */
    system.runTimeout(async () => {
        const commandResult = await executeCommand(`listd`, true);
        let data
        try {
            data = JSON.parse(commandResult.split(`\n`)[2].substring(5));
        } catch (error) {
            data = { "result": [{ "id": "Not Found" }] }
        }

        const playerData = data.result.find((d) => `${d.id}` === player.id);
        if (!playerData) {
            player.runCommand(`kick "${player.name}" §c§l不正なアカウント`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]\n§r§7不正なアカウント: ${player.name} の接続を拒否しました`);
            return;
        };
        const savePlayerData = { xuid: playerData.xuid, id: `${playerData.id}`, deviceId: [playerData.deviceSessionId] };
        const playerRawDataBefore = player.getDynamicProperty("accountData") || JSON.stringify(savePlayerData);
        /**
         * @type {{ "deviceId": [string] , "id": string , "xuid": string }}
         */
        const playerParseDataBefore = JSON.parse(playerRawDataBefore);

        if (!playerParseDataBefore.deviceId.includes(playerData.deviceSessionId)) {
            playerParseDataBefore.deviceId.push(playerData.deviceSessionId);
            player.setDynamicProperty("accountData", JSON.stringify(playerParseDataBefore));
        };

        if (!player.getDynamicProperty("accountData")) {
            player.setDynamicProperty("accountData", JSON.stringify(playerParseDataBefore));
        };

        if (unbanList.includes(`${player.name}`) && player.getDynamicProperty(`isBan`)) {
            player.setDynamicProperty(`isBan`);
            player.sendMessage(`§a§lあなたのBANが解除されました`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7のBANを解除しました`);
            for (const deviceId of playerParseDataBefore.deviceId) {
                if (deviceIds.includes(deviceId)) {
                    deviceIds.splice(deviceIds.indexOf(deviceId), 1);
                };
            };
            DyProp.setDynamicProperty("deviceIds", JSON.stringify(deviceIds));
            return;
        };
        for (const banedDeviceId of deviceIds) {
            if (banedDeviceId === playerData.deviceSessionId) {
                player.setDynamicProperty(`isBan`, true);
                player.runCommand(`kick "${playerData.xuid}" §c§lあなたはBANされています\nReason: ${banedDeviceId}のデバイスからの接続を拒否しました`);
                world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7の接続を拒否しました`);
                if (!playerParseDataBefore.deviceId.includes(playerData.deviceSessionId)) {
                    deviceIds.push(playerData.deviceSessionId);
                    DyProp.setDynamicProperty("deviceIds", JSON.stringify(deviceIds));
                };
                return;
            }
        }

        if (banList.includes(`${player.name}`)) {
            const reason = player.getDynamicProperty(`banReason`) || "";
            player.setDynamicProperty(`isBan`, true);
            player.runCommand(`kick "${player.name}" §c§lあなたはBANされています\nReason: ${reason}`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7の接続を拒否しました`);
            if (!playerParseDataBefore.deviceId.includes(playerData.deviceSessionId)) {
                deviceIds.push(playerData.deviceSessionId);
                DyProp.setDynamicProperty("deviceIds", JSON.stringify(deviceIds));
            };
            return;
        };
        if (player.getDynamicProperty(`isBan`)) {
            const reason = player.getDynamicProperty(`banReason`) || "";
            player.runCommand(`kick "${player.name}" §c§lあなたはBANされています\nReason: ${reason}`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7の接続を拒否しました`);
            if (!playerParseDataBefore.deviceId.includes(playerData.deviceSessionId)) {
                deviceIds.push(playerData.deviceSessionId);
                DyProp.setDynamicProperty("deviceIds", JSON.stringify(deviceIds));
            };
            return;
        };
        if (muteList.includes(`${player.name}`)) {
            player.setDynamicProperty(`isMute`, true);
            return;
        };
        if (unmuteList.includes(`${player.name}`) && player.getDynamicProperty(`isMute`)) {
            player.setDynamicProperty(`isMute`);
            return;
        };
    }, 2);
});

/**
 * 
 * @param {Player} player 
 */
async function banForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);
    const form = new ModalFormData();
    form.dropdown(`BANするプレイヤーを選択`, playerNames);
    form.textField(`理由`, `BAN理由を入力`);
    form.submitButton(`BANする`);
    form.show(player).then((rs) => {
        if (rs.canceled) {
            if (rs.cancelationReason === FormCancelationReason.UserBusy) {
                banForm(player);
                return;
            };
            return;
        };
        try {
            /**
             * @type {Player}
             */
            const target = players[rs.formValues[0]];
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

            if (rs.formValues[1] != "") target.setDynamicProperty(`banReason`, rs.formValues[1]);
            target.setDynamicProperty(`isBan`, true);
            target.runCommand(`kick "${target.name}" §c§lあなたはBANされています\nReason: ${rs.formValues[1]}`);
            player.sendMessage(`§a${target.name}をBANしました`)
            world.sendMessage(`§a[KaronNetWork BAN System]§r\n${target.name} §r§7の接続を拒否しました`);
        } catch (error) {
        };
    });
};

/**
 * 
 * @param {Player} player 
 */
function muteForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);
    const form = new ModalFormData();
    form.dropdown(`MUTEするプレイヤーを選択`, playerNames);
    form.submitButton(`MUTEする`);
    form.show(player).then((rs) => {
        if (rs.canceled) {
            if (rs.cancelationReason === FormCancelationReason.UserBusy) {
                muteForm(player);
                return;
            };
            return;
        };
        try {
            /**
             * @type {Player}
             */
            const target = players[rs.formValues[0]];
            target.setDynamicProperty(`isMute`, true);
            player.sendMessage(`§a${target.name}をMUTEしました`)
        } catch (error) {
        };
    });
};

/**
 * 
 * @param {Player} player 
 */
function unmuteForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);
    const form = new ModalFormData();
    form.dropdown(`MUTE解除するプレイヤーを選択`, playerNames);
    form.submitButton(`MUTE解除する`);
    form.show(player).then((rs) => {
        if (rs.canceled) {
            if (rs.cancelationReason === FormCancelationReason.UserBusy) {
                unmuteForm(player);
                return;
            };
            return;
        };
        try {
            /**
             * @type {Player}
             */
            const target = players[rs.formValues[0]];
            target.setDynamicProperty(`isMute`);
            player.sendMessage(`§a${target.name}をMUTE解除しました`)
        } catch (error) {
        };
    });
};

world.afterEvents.worldInitialize.subscribe(() => {
    const players = world.getPlayers();
    for (const player of players) {
        if (unbanList.includes(`${player.name}`) && player.getDynamicProperty(`isBan`)) {
            player.setDynamicProperty(`isBan`);
            player.sendMessage(`§a§lあなたのBANが解除されました`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7のBANを解除しました`);
            return;
        };
        if (banList.includes(`${player.name}`)) {
            const reason = player.getDynamicProperty(`banReason`) || "";
            player.setDynamicProperty(`isBan`, true);
            player.runCommand(`kick "${player.name}" §c§lあなたはBANされています\nReason: ${reason}`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7の接続を拒否しました`);
            return;
        };
        if (player.getDynamicProperty(`isBan`)) {
            const reason = player.getDynamicProperty(`banReason`) || "";
            player.runCommand(`kick "${player.name}" §c§lあなたはBANされています\nReason: ${reason}`);
            world.sendMessage(`§a§l[KaronNetWork BAN System]§r\n${player.name} §r§7の接続を拒否しました`);
            return;
        };
        if (muteList.includes(`${player.name}`)) {
            player.setDynamicProperty(`isMute`, true);
            return;
        };
        if (unmuteList.includes(`${player.name}`) && player.getDynamicProperty(`isMute`)) {
            player.setDynamicProperty(`isMute`);
            return;
        };
    };
});

world.beforeEvents.chatSend.subscribe((ev) => {
    const { sender, message } = ev;
    if (message.startsWith(`?`)) return;
    if (sender.hasTag(`moderator`)) {
        if (!message.startsWith(`!`)) return;
        ev.cancel = true;
        system.run(() => {
            switch (message) {
                case `!ban`: {
                    banForm(sender);
                    break;
                };
                case `!mute`: {
                    muteForm(sender);
                    break;
                };
                case `!unmute`: {
                    unmuteForm(sender);
                    break;
                };
                case `!help`: {
                    sender.sendMessage(`§a!ban§f: BANフォームを開く\n§a!mute§f: MUTEフォームを開く\n§a!unmute§f: UNMUTEフォームを開く\n§a!sp§f: ゲームモードを切り替える\n§a!inv <PlayerName>§f: プレイヤーのインベントリを確認する`);
                    break;
                }
                case `!sp`: {
                    switch (sender.getGameMode()) {
                        case GameMode.spectator: {
                            sender.setGameMode(GameMode.survival);
                            break;
                        };
                        case GameMode.survival: {
                            sender.setGameMode(GameMode.spectator);
                            break;
                        };
                    };
                    break;
                }
                default: {
                    if (message.startsWith(`!inv `)) {
                        const target = world.getPlayers({ name: message.substring(5) });
                        if (target.length === 0) {
                            sender.sendMessage(`§c指定したプレイヤーが見つかりません`);
                            return;
                        };
                        inventoryCheck(sender, target[0]);
                        break;
                    }
                    sender.sendMessage(`§c存在しないコマンド`);
                };
            };
            return;
        });
    };
    if (sender.getDynamicProperty(`isMute`)) {
        ev.cancel = true;
        system.run(() => {
            sender.sendMessage(`§cあなたはMUTEされています`);
        });
    };
});

/**
 * 
 * @param {Player} player 
 * @param {Player} target 
 */
function inventoryCheck(player, target) {
    const form = new ChestFormData("large");
    form.setTitle(`${target.name} のインベントリ`);
    const inventory = target.getComponent("inventory").container;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item) {
            form.setButton(i + 9, { iconPath: itemIdToPath[item.typeId], name: item.nameTag || item.typeId, lore: item.getLore(), stackAmount: item.amount });
        };
    };
    const equippable = target.getComponent("equippable");
    const equippables = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];
    for (let i = 0; i < equippables.length; i++) {
        const item = equippable.getEquipment(equippables[i]);
        if (item) {
            form.setButton(i, { iconPath: itemIdToPath[item.typeId], name: item.nameTag || item.typeId, lore: item.getLore(), stackAmount: item.amount });
        };
    };
    form.show(player).then((rs) => {
        if (rs.canceled) {
            if (rs.cancelationReason === FormCancelationReason.UserBusy) {
                inventoryCheck(player, target);
                return;
            };
            return;
        };
        const playerInventory = player.getComponent("inventory").container;
        if (-1 < rs.selection && rs.selection < 5) {
            const item = equippable.getEquipment(equippables[rs.selection]);
            if (item) {
                player.sendMessage(`§a${target.name}のインベントリから ${item.nameTag || item.typeId} を奪いました`);
                equippable.setEquipment(equippables[rs.selection]);
                playerInventory.addItem(item);
                return;
            } else {
                player.sendMessage(`§cその位置にはアイテムがありません`);
                return;
            };
        };
        if (8 < rs.selection && rs.selection < 55) {
            const item = inventory.getItem(rs.selection - 9);
            if (item) {
                player.sendMessage(`§a${target.name}のインベントリから${item.nameTag || item.typeId} を奪いました`);
                inventory.setItem(rs.selection - 9);
                playerInventory.addItem(item);
                return;
            } else {
                player.sendMessage(`§cその位置にはアイテムがありません`);
                return;
            };
        };
        player.sendMessage(`§c無効なフィールド`);
    });
};

/**
 * @param {string} action
 * @param {unknown} payload
 */
function sendAction(action, payload) {
    const json = JSON.stringify({ action, payload });
    console.warn(`bds_enhancer:${json}`);
}

/**
 * @type {{command: string, resolve: (value: string) => void, resultTmp: string}[]}
 */
const commandQueue = [];

/**
 * @template {boolean} T
 * @param {string} command 
 * @param {T} result 
 * @returns {Promise<T extends true ? string : undefined>}
 */
export async function executeCommand(command = "", result = false) {
    sendAction("execute", { command, result });
    return new Promise((resolve) => {
        if (result) commandQueue.push({ command, resolve, resultTmp: "" });
        else resolve();
    });
}

/**
 * @type {{fullCommand: string, resolve: (value: {err:boolean,message:string}) => void, resultTmp: string}[]}
 */
const shellQueue = [];

/**
 * @template {boolean} T
 * @param {string} command 
 * @param {string[]} args
 * @param {T} result 
 * @returns {Promise<T extends true ? {err:boolean,message:string} : undefined>}
 */
export async function executeShellCommand(mainCommand = "", args = [], result = false) {
    sendAction("executeshell", { main_command: mainCommand, args, result });
    return new Promise((resolve) => {
        if (result) shellQueue.push({ fullCommand: `${mainCommand} ${args.join(" ")}`, resolve, resultTmp: "" });
        else resolve();
    });
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "bds_enhancer:result") {
        /**
         * @type {{command: string, result_message: string, count: number, end: boolean}}
         */
        const data = JSON.parse(event.message);
        const arr = commandQueue.find((item) => item.command === data.command)
        if (!arr) return;
        arr.resultTmp += data.result_message;
        if (data.end) {
            arr.resolve(arr.resultTmp);
            commandQueue.splice(commandQueue.indexOf(arr), 1);
        }
    } else if (event.id === "bds_enhancer:shell_result") {
        /**
         * @type {{command: string, result_message: string, err: boolean, count: number, end: boolean}}
         */
        const data = JSON.parse(event.message);
        if (data.err) {
            const arr = shellQueue.find((item) => item.fullCommand === data.command)
            if (!arr) return;
            arr.resolve({ err: true, message: data.result_message });
            shellQueue.splice(shellQueue.indexOf(arr), 1);
        } else {
            const arr = shellQueue.find((item) => item.fullCommand === data.command)
            if (!arr) return;
            arr.resultTmp += data.result_message;
            if (data.end) {
                arr.resolve({ err: false, message: arr.resultTmp });
                shellQueue.splice(shellQueue.indexOf(arr), 1);
            }
        }
    }
});