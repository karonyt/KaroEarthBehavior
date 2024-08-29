import { world, Player, system, GameMode, EquipmentSlot } from "@minecraft/server";
import { ModalFormData, FormCancelationReason } from "@minecraft/server-ui"
import { ChestFormData } from "./lib/chest-ui";
import { itemIdToPath } from "./texture_config";
import * as DyProp from "./lib/DyProp";

const unbanList = [];
const banList = [`giyokundaK`, `bedrock6gatu`, `D Berlin98`, `reizylake`, `Harukixx1008`];
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
    const data = await JSON.parse(executeCommand(`listd`, true).split(`\n`)[2].substring(5));
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
            if(deviceIds.includes(deviceId)) {
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
        if (17 < rs.selection && rs.selection < 55) {
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