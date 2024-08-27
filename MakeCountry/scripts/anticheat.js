import { world, Player, system, GameMode, EquipmentSlot } from "@minecraft/server";
import { ModalFormData, FormCancelationReason } from "@minecraft/server-ui"
import { ChestFormData } from "./lib/chest-ui";
import { itemIdToPath } from "./texture_config";

const unbanList = [];
const banList = [`giyokundaK`, `bedrock6gatu`, `D Berlin98`, `reizylake`, `Harukixx1008`];
const unmuteList = [];
const muteList = [];

world.afterEvents.playerSpawn.subscribe((ev) => {
    const { player } = ev;
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
});

/**
 * 
 * @param {Player} player 
 */
function banForm(player) {
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
            form.setButton(i + 9, { iconPath: itemIdToPath[item.typeId], name: item.nameTag || item.typeId, lore: item.getLore() });
        };
    };
    const equippable = target.getComponent("equippable");
    const equippables = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];
    for (let i = 0; i < equippables.length; i++) {
        const item = equippable.getEquipment(equippables[i]);
        if (item) {
            form.setButton(i, { iconPath: itemIdToPath[item.typeId], name: item.nameTag || item.typeId, lore: item.getLore() });
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
    });
};