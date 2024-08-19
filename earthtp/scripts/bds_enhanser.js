/**
 * @typedef {import("@minecraft/server").Player} Player
 */

import { system , world } from "@minecraft/server";

/**
 * @param {string} action
 * @param {unknown} payload
 */
function sendAction(action, payload) {
    const json = JSON.stringify({ action, payload });
    console.warn(`bds_enhancer:${json}`);
}
  
/**
   * @param {Player} player
   * @param {string} host
   * @param {number} port
   */
export function sendTransferAction(player, host, port) {
    sendAction("transfer", { player: player.name, host, port });
}
  
  /**
   * @param {Player} player
   * @param {string} reason
   */
export function sendKickAction(player, reason) {
    sendAction("kick", { player: player.name, reason });
}
  
export function sendStopAction() {
    sendAction("stop");
}
  
export function sendReloadAction() {
    sendAction("reload");
}

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id === `karo:server`) {
        const [ host , port ] = ev.message.split(`:`);
        sendTransferAction(ev.sourceEntity,host,Number(port));
        return;
    };    
});

system.runInterval(() => {
    const date = new Date();
    const minute =  date.getMinutes();
    if(minute == 20) {
        world.sendMessage(`§a[かろEarth]\n§b10分後再起動を行います`);
    };
    if(minute == 25) {
        world.sendMessage(`§a[かろEarth]\n§b5分後再起動を行います`);
    };
    if(minute == 29) {
        world.sendMessage(`§a[かろEarth]\n§b1分後再起動を行います`);
    };
    if(minute == 30) {
        world.sendMessage(`§a[かろEarth]\n§b再起動を行います`);
        system.runTimeout(() => {
            world.getPlayers().forEach(p => {
                try {
                    p.runCommand(`kick "${p.name}" server restart`);
                } catch (error) {
                    
                }
            });
        },100)
        system.runTimeout(() => {
            sendStopAction();
        },200)
    };
},20*60);