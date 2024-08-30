import { world, system, Player } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import "./bds_enhanser";
//import "./anticheat";
//import "./bot";

world.beforeEvents.chatSend.subscribe((ev) => {
  const { message, sender } = ev;
  if (message === `?tp`) {
    ev.cancel = true;
    system.run(() => {
      if (sender.hasTag(`mc_combat`)) {
        sender.sendMessage({ translate: `teleport.error.combattag` });
        return;
      };
      formOpen(sender);
    });
  };
  if (message === `?lobby`) {
    ev.cancel = true;
    system.run(() => {
      if (sender.hasTag(`mc_combat`)) {
        sender.sendMessage({ translate: `teleport.error.combattag` });
        return;
      };
      sender.teleport({ x: 201.5, y: 127, z: 15017.5 }, { dimension: world.getDimension(`overworld`) })
    });
  };
});

system.afterEvents.scriptEventReceive.subscribe((ev) => {
  if (ev.id === `karo:tpform`) {
    formOpen(ev.sourceEntity);
    return;
  };
});

/**
 * 
 * @param {Player} player 
 */
function formOpen(player) {
  const actionForm = new ActionFormData();
  actionForm.title("§t§p");
  actionForm.button("§l北アメリカ");
  actionForm.button("§l南アメリカ");
  actionForm.button("§lオーストラリア");
  actionForm.button("§lロシア");
  actionForm.button("§l中国");
  actionForm.button("§lイギリス");
  actionForm.button("§lサハラ砂漠");
  actionForm.button("§l南アフリカ");
  actionForm.button("§l南極");
  actionForm.button("§l北極");
  actionForm.button("§lカナダ");
  actionForm.button("§lオムスクチャン");
  actionForm.button("§lインド");

  // アクションフォームを表示する
  actionForm.show(player).then(response => {
    if (response.canceled) {
      if (response.cancelationReason === FormCancelationReason.UserBusy) {
        system.run(() => {
          formOpen(player);
        });
        return;
      };
      return;
    } else {
      let target = { x: -9100, y: 67, z: -3864 };
      if (response.selection === 0) {
        //kitaamerika
        target = { x: -9100, y: 67, z: -3864 };
      } else if (response.selection === 1) {
        //minamiamerika
        target = { x: -5962, y: 72, z: 1167 };
      } else if (response.selection === 2) {
        //australia
        target = { x: 14731, y: 68, z: 2872 };
      } else if (response.selection === 3) {
        //russia
        target = { x: 6351, y: 69, z: -5564 };
      } else if (response.selection === 4) {
        //china
        target = { x: 13000, y: 69, z: -4624 };
      } else if (response.selection === 5) {
        //igirisu
        target = { x: -40, y: 64, z: -5363 };
      } else if (response.selection === 6) {
        //sahara
        target = { x: 450, y: 75, z: -1985 };
      } else if (response.selection === 7) {
        //minamiahurika
        target = { x: 2549, y: 97, z: 1492 };
      } else if (response.selection === 8) {
        //nankyoku
        target = { x: 450, y: 145, z: 7850 };
      } else if (response.selection === 9) {
        //hokkyoku
        target = { x: 706, y: 65, z: -8385 }
      } else if (response.selection === 10) {
        //kanada
        target = { x: -11541, y: 76, z: -6496 };
      } else if (response.selection === 11) {
        //omusukutyan
        target = { x: 15577, y: 70, z: -6575 };
      } else if (response.selection === 12) {
        //india
        target = { x: 7911, y: 79, z: -1865 };
      }
      player.teleport({ x: target.x, y: target.y, z: target.z }, { dimension: world.getDimension(`overworld`) })
    }
  });
};

world.afterEvents.playerSpawn.subscribe((ev) => {
  const { player, initialSpawn } = ev;
  if (!initialSpawn) return;
  if (player.dimension.id != `minecraft:overworld`) player.teleport({ x: 201.5, y: 127, z: 15017.5 }, { dimension: world.getDimension(`overworld`) })
});

world.afterEvents.playerDimensionChange.subscribe(ev => {
  const { player, toDimension } = ev;
  if (toDimension.id !== `minecraft:overworld`) player.teleport({ x: 201.5, y: 127, z: 15017.5 }, { dimension: world.getDimension(`overworld`) });
});