import { system, world } from "@minecraft/server";
import { GetAndParsePropertyData, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import * as DyProp from "./DyProp";
import config from "../config";
import { DeleteCountry } from "./land";

const nowCountryId = new Map();

world.afterEvents.worldInitialize.subscribe(() => {
    if(!DyProp.getDynamicProperty(`voteData`)) DyProp.setDynamicProperty(`voteData`,`{}`);
    if(!DyProp.getDynamicProperty(`loginData`)) DyProp.setDynamicProperty(`loginData`,`{}`);
});

system.runInterval(() => {
    if (!world.getDynamicProperty(`start`)) return;
    for (const p of world.getPlayers()) {
        p.getDynamicProperty(`nowCountryId`);
        const playerLastInCountryId = nowCountryId.get(p.id) ?? 0;
        const nowChunkCountryData = GetAndParsePropertyData(`country_${GetAndParsePropertyData(GetPlayerChunkPropertyId(p))?.countryId}`) ?? { "id": 0, "name": "wilderness.name" };
        const countryChunkDataId = nowChunkCountryData?.id;
        if (countryChunkDataId !== playerLastInCountryId) {
            if (countryChunkDataId == 0) {
                p.onScreenDisplay.setActionBar({ translate: `wilderness.name` });
            } else {
                p.onScreenDisplay.setTitle({ translate: nowChunkCountryData.name });
                p.onScreenDisplay.updateSubtitle(`${nowChunkCountryData.lore ?? ``}`);
            };
        };
        nowCountryId.set(p.id, countryChunkDataId);
    };
}, 30);

system.runInterval(() => {
    if (!world.getDynamicProperty(`start`)) return;
    const zikan = new Date();
    if (zikan.getHours() == 21 && zikan.getMinutes() == 50) {
        world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n§r税回収&維持費徴収まで残り10分です\n建国から3日が経過した国は維持費が徴収されます\n平和主義は50$/1チャンク\n非平和主義国は5$/1チャンク\n維持費は国庫の国家予算から引かれるため予め入金しておいてください` }] });
    }
    if (zikan.getHours() == 0 && zikan.getMinutes() == 0) {
        DyProp.setDynamicProperty(`voteData`,`{}`);
        DyProp.setDynamicProperty(`loginData`,`{}`);
    }
    if (zikan.getHours() == 21 && zikan.getMinutes() == 0) {
        world.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `tax.time` }] });
        for (const pId of DyProp.DynamicPropertyIds().filter(id => id.startsWith(`player_`))) {
            const playerData = GetAndParsePropertyData(pId);
            playerData.days += 1;
            StringifyAndSavePropertyData(pId, playerData);
            if (!playerData.country) continue;
            const countryData = GetAndParsePropertyData(`country_${playerData.country}`);
            if (countryData.taxInstitutionIsPer) {
                let taxValue = playerData.money * (countryData.taxPer / 100);
                playerData.money -= taxValue;
                countryData.money += taxValue;
                StringifyAndSavePropertyData(pId, playerData);
                StringifyAndSavePropertyData(`country_${countryData.id}`, countryData);
            } else {
                if (playerData.money < countryData.taxPer) {
                    if(playerData.money < 0) {
                        continue;
                    } else {
                        let addmoney = playerData.money;
                        playerData.money -= addmoney;
                        countryData.money += addmoney;    
                    };
                } else {
                    playerData.money -= countryData.taxPer;
                    countryData.money += countryData.taxPer;

                };
                StringifyAndSavePropertyData(pId, playerData);
                StringifyAndSavePropertyData(`country_${countryData.id}`, countryData);
            };
        };
        for (const cId of DyProp.DynamicPropertyIds().filter(id => id.startsWith(`country_`))) {
            const countryData = GetAndParsePropertyData(cId);
            if (0 < countryData?.peaceChangeCooltime) {
                countryData.peaceChangeCooltime -= 1;
            };
            if(!countryData?.days) countryData.days = 0;
            countryData.days += 1;
            if (countryData.days < config.NonMaintenanceCostAccrualPeriod) {
                StringifyAndSavePropertyData(`country_${countryData.id}`, countryData);
                continue;
            };
            let upkeepCosts = config.MaintenanceFeeNonPeacefulCountries * countryData.territories.length;
            if (countryData.peace) upkeepCosts = config.MaintenanceFeePacifistCountries * countryData.territories.length;
            if (countryData.money < upkeepCosts) {
                countryData.money = 0;
                StringifyAndSavePropertyData(`country_${countryData.id}`, countryData);
                DeleteCountry(countryData.id);
                continue;
            };
            countryData.money -= upkeepCosts;
            StringifyAndSavePropertyData(`country_${countryData.id}`, countryData);
        };
    };
}, 20 * 60);