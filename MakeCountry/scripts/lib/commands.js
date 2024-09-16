import { Player, system, world } from "@minecraft/server";
import * as DyProp from "./DyProp";
import { CheckPermission, CheckPermissionFromLocation, ConvertChunk, GetAndParsePropertyData, GetChunkPropertyId, GetPlayerChunkPropertyId, StringifyAndSavePropertyData } from "./util";
import { GenerateChunkData, playerCountryLeave } from "./land";
import { MakeCountryForm, countryList, joinTypeSelectForm, playerMainMenu, settingCountry } from "./form";
import { jobsForm } from "./jobs";
import jobs_config from "../jobs_config";
import config from "../config";
import { PlayerMarketMainMenu } from "./player_market";
import { tpaMainForm } from "./tpa";
import { ShopCommonsMenu } from "./shop";
import { sendEvent } from "./server_net";
import { Invade } from "./war";


class ChatHandler {
    constructor(event) {
        this.event = event;
        /**
         * @type {string}
         */
        this.message = event.message;
        /**
         * @type {Player}
         */
        this.sender = event.sender;
        /**
         * @type {string}
         */
        this.prefix = config.prefix;
        this.playerData = GetAndParsePropertyData(`player_${this.sender.id}`);
        this.playerCountryData = GetAndParsePropertyData(`country_${this.playerData.country}`);
    }

    isCommand() {
        return this.message.startsWith(this.prefix);
    }

    handleChat() {
        let landId = this.playerData?.country;
        let land = `chat.player.no.join.any.country`;
        if (landId) land = this.playerCountryData?.name;
        /*if (!/^[a-z]$/.test(this.message.charAt(0))) {
            this.event.cancel = true;
            world.sendMessage([{ text: `<§${this.playerCountryData?.color ?? `a`}` }, { translate: land }, { text: ` §r| ${this.sender.name}> ${this.message}` }]);
        };*/
        this.event.cancel = true;
        world.sendMessage([{ text: `<§${this.playerCountryData?.color ?? `a`}` }, { translate: land }, { text: ` §r| ${this.sender.name}> ${this.message}` }]);
        system.run(async () => {
            if (land === `chat.player.no.join.any.country`) land = `無所属`;

            sendEvent({
                type: "chat",
                data: {
                    minecraftId: this.sender.id,
                    senderName: this.event.sender.name,
                    text: this.event.message
                }
            });
        });
    };

    handleCommand() {
        this.event.cancel = true;
        const [commandName, ...args] = this.message.slice(this.prefix.length).trim().split(/ +/);
        system.runTimeout(() => {
            switch (commandName) {
                case "money":
                    this.Money();
                    break;
                case "setup":
                    this.setup();
                    break;
                case "msend":
                    this.sendMoney(args);
                    break;
                case "checkchunk":
                    this.checkChunk();
                    break;
                case "cc":
                    this.checkChunk();
                    break;
                case "sethome":
                    this.setHome();
                    break;
                case "home":
                    this.teleportHome();
                    break;
                case "checkhome":
                    this.checkHome();
                    break;
                case "adminchunk":
                    this.setAdminChunk();
                    break;
                case "adminc":
                    this.setAdminChunk();
                    break;
                case "resetchunk":
                    this.resetChunk();
                    break;
                case "resetc":
                    this.resetChunk();
                    break;
                case "buychunk":
                    this.buyChunk();
                    break;
                case "buyc":
                    this.buyChunk();
                    break;
                case "sellchunk":
                    this.sellChunk();
                    break;
                case "sellc":
                    this.sellChunk();
                    break;
                case "help":
                    this.sendHelp();
                    break;
                case "makecountry":
                    this.makeCountry();
                    break;
                case "mc":
                    this.makeCountry();
                    break;
                case "settingcountry":
                    this.settingCountry();
                    break;
                case "sc":
                    this.settingCountry();
                    break;
                case "joincountry":
                    this.joinCountry();
                    break;
                case "jc":
                    this.joinCountry();
                    break;
                case "leavecountry":
                    this.leaveCountry();
                    break;
                case "kill":
                    this.kill();
                    break;
                case "countrylist":
                    this.CountryList();
                    break;
                case "cl":
                    this.CountryList();
                    break;
                case "chome":
                    this.chome();
                    break;
                case "menu":
                    this.mainMenu();
                    break;
                case "jobs":
                    this.jobs();
                    break;
                case "playermarket":
                    this.playermarket();
                    break;
                case "pm":
                    this.playermarket();
                    break;
                case "tpa":
                    this.tpa();
                    break;
                case "shop":
                    this.shop();
                    break;
                case "camera":
                    this.camera();
                    break;
                case "map":
                    this.map();
                    break;
                case "invade":
                    this.invade();
                    break;
                default:
                    this.sender.sendMessage({ translate: `command.unknown.error`, with: [commandName] });
                    break;
            };
        }, 0);
    };

    Money() {
        this.sender.sendMessage({ translate: `command.money.result.message`, with: [`${config.MoneyName} ${this.playerData.money}`] });
    };

    setup() {
        system.runTimeout(() => {
            if (!this.sender.isOp()) {
                this.sender.sendMessage({ translate: `command.permission.error` });
                return;
            }
            this.sender.sendMessage({ rawtext: [{ text: `§a[MakeCountry]\n` }, { translate: `system.setup.complete` }] });
            this.sender.addTag("mc_admin");
            world.setDynamicProperty(`start`, `true`)
            return;
        }, 1);
    };

    sendMoney(args) {
        if (args.length < 2 || isNaN(args[0]) || !args[1]) {
            this.sender.sendMessage({ translate: `command.sendmoney.error.name`, with: [config.prefix] });
            return;
        }

        const amount = Number(args[0]);
        const targetName = args[1];
        /**
         * @type {Player}
         */
        const targetPlayer = world.getDimension(this.sender.dimension.id).getEntities({ type: "minecraft:player", name: targetName })[0];

        if (!targetPlayer) {
            this.sender.sendMessage({ translate: `command.error.notarget.this.dimension` });
            return;
        };
        if (amount < 1) {
            this.sender.sendMessage({ translate: `command.error.canuse.number.more`, with: [`1`] });
            return;
        };
        if (this.playerData.money < amount) {
            this.sender.sendMessage({ translate: `command.error.trysend.moremoney.youhave`, with: [`${this.playerData.money}`] });
            return;
        };
        const targetData = GetAndParsePropertyData(`player_${targetPlayer.id}`);
        targetData.money += Math.floor(amount);
        this.playerData.money -= Math.floor(amount);
        StringifyAndSavePropertyData(`player_${targetPlayer.id}`, targetData);
        StringifyAndSavePropertyData(`player_${this.sender.id}`, this.playerData);
        this.sender.sendMessage({ translate: `command.sendmoney.result.sender`, with: [targetName, `${config.MoneyName} ${Math.floor(amount)}`] });
        targetPlayer.sendMessage({ translate: `command.sendmoney.result.receiver`, with: [this.sender.name, `${config.MoneyName} ${Math.floor(amount)}`] });
    };

    checkChunk() {
        const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(this.sender));
        if (!chunkData || (!chunkData.special && !chunkData.countryId)) {
            this.sender.sendMessage({ translate: `command.checkchunk.result.wilderness`, with: { rawtext: [{ translate: `wilderness.name` }] } });
            return;
        } else if (chunkData.special) {
            this.sender.sendMessage({ translate: `command.checkchunk.result.special`, with: { rawtext: [{ translate: `special.name` }] } });
            return;
        } else {
            if (chunkData.owner) {
                this.sender.sendMessage({ translate: `command.checkchunk.result.ownerland`, with: [`${chunkCountryData.owner}`] });
                return;
            };
            const chunkCountryData = GetAndParsePropertyData(`country_${chunkData.countryId}`)
            this.sender.sendMessage({ translate: `command.checkchunk.result.territory`, with: [`${chunkCountryData.name}`] });
            return;
        };
    };

    setHome() {
        const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(this.sender));
        const check = CheckPermission(this.sender, `setHome`);
        if (check) {
            if (chunkData?.special) {
                this.sender.sendMessage({ translate: `command.sethome.error.special`, with: { rawtext: [{ translate: `special.name` }] } });
                return;
            };
            this.sender.sendMessage({ translate: `command.sethome.error.thischunk` });
            return;
        };
        this.sender.sendMessage({ translate: `command.sethome.result`, with: [`${Math.floor(this.sender.location.x)} ${Math.floor(this.sender.location.y)} ${Math.floor(this.sender.location.z)}(${this.sender.dimension.id.replace(`minecraft:`, ``)})`, config.prefix] });
        this.sender.setDynamicProperty("homePoint", `${Math.floor(this.sender.location.x)} ${Math.floor(this.sender.location.y)} ${Math.floor(this.sender.location.z)} ${this.sender.dimension.id}`);
        return;
    };

    teleportHome() {
        if (config.combatTagNoTeleportValidity) {
            if (this.sender.hasTag(`mc_combat`)) {
                this.sender.sendMessage({ translate: `teleport.error.combattag` });
                return;
            };
        };
        const homePoint = this.sender.getDynamicProperty("homePoint");
        if (!homePoint) {
            this.sender.sendMessage({ translate: `command.error.nosethome` });
            return;
        };
        let [x, y, z, dimension] = homePoint.split(" ");
        [x, y, z] = [x, y, z].map(Number);
        const check = CheckPermissionFromLocation(this.sender, x, z, dimension, `setHome`);
        if (check) {
            this.sender.sendMessage({ translate: `command.home.error.thischunk` });
            return;
        };
        this.sender.teleport({ x, y, z }, { dimension: world.getDimension(dimension.replace(`minecraft:`, ``)) });
        return;
    };

    checkHome() {
        const homePoint = this.sender.getDynamicProperty("homePoint");
        if (!homePoint) {
            this.sender.sendMessage({ translate: `command.error.nosethome` });
        } else {
            let [x, y, z, dimension] = homePoint.split(" ");
            const homePointString = `${x},${y},${z}(${dimension.replace(`minecraft:`, ``)})`
            this.sender.sendMessage({ translate: `command.checkhome.result`, with: [homePointString] });
        };
    };

    setAdminChunk() {
        if (!this.sender.hasTag("mc_admin")) {
            this.sender.sendMessage({ translate: `command.permission.error` });
            return;
        };
        const { x, z } = this.sender.location;
        this.sender.sendMessage({ translate: `command.setadminchunk.result`, with: { rawtext: [{ translate: `special.name` }] } });
        const chunk = GenerateChunkData(x, z, this.sender.dimension.id, undefined, undefined, 10000, true);
        StringifyAndSavePropertyData(chunk.id, chunk);
        return;
    };

    resetChunk() {
        if (!this.sender.hasTag("mc_admin")) {
            this.sender.sendMessage({ translate: `command.permission.error` });
            return;
        };
        const chunkId = GetPlayerChunkPropertyId(this.sender);
        const chunkData = GetAndParsePropertyData(chunkId);
        if (chunkData) {
            if (chunkData?.countryId) {
                const countryData = GetAndParsePropertyData(`country_${chunkData?.countryId}`);
                countryData.territories.splice(countryData.territories.indexOf(chunkId), 1);
                let chunkPrice = config.defaultChunkPrice / 2;
                if (chunkData && chunkData.price) chunkPrice = chunkData.price / 2;
                countryData.money += chunkPrice;
                StringifyAndSavePropertyData(`country_${chunkData?.countryId}`, countryData);
            };
        };
        DyProp.setDynamicProperty(chunkId);
        this.sender.sendMessage({ translate: `command.resetchunk.result`, with: { rawtext: [{ translate: `wilderness.name` }] } });
    };

    buyChunk() {
        if (!this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.buychunk.error.notjoin.country` });
            return;
        };
        let chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(this.sender));
        const { x, z } = this.sender.location;
        const dimention = this.sender.dimension.id;
        if (!chunkData) chunkData = GenerateChunkData(x, z, dimention);
        let chunkPrice = config.defaultChunkPrice;
        if (chunkData && chunkData.price) chunkPrice = chunkData.price;
        const cannotBuy = CheckPermission(this.sender, `buyChunk`);
        if (cannotBuy) {
            if (!chunkData) {
                this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.wilderness`, with: { rawtext: [{ translate: `wilderness.name` }] } });
                return;
            };
            if (chunkData.special) {
                this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.special`, with: { rawtext: [{ translate: `special.name` }] } });
                return;
            };
            if (chunkData.owner) {
                const ownerData = GetAndParsePropertyData(`player_${chunkData.owner}`);
                this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.hasowner`, with: [ownerData.name] });
                return;
            };
            if (chunkData.countryId) {
                if (chunkData.countryId === this.playerData.country) {
                    this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.yourcountry` });
                    return;
                };
                this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.othercountry`, with: { rawtext: [{ translate: `${chunkData.countryId}` }] } });
                return;
            };
            this.sender.sendMessage({ translate: `command.permission.error` });
            return;
        };
        if (chunkData?.countryId) {
            if (chunkData.countryId === this.playerData.country) {
                this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.yourcountry` });
                return;
            };
            this.sender.sendMessage({ translate: `command.buychunk.error.thischunk.othercountry`, with: { rawtext: [{ translate: `${chunkData.countryId}` }] } });
            return;
        };
        const playerCountryData = GetAndParsePropertyData(`country_${this.playerData.country}`);
        if (playerCountryData.resourcePoint < chunkPrice) {
            this.sender.sendMessage({ translate: `command.buychunk.error.not.enough.money`, with: [`${chunkPrice}`] });
            return;
        };

        chunkData.countryId = this.playerData.country;
        playerCountryData.resourcePoint -= chunkPrice;
        playerCountryData.territories.push(chunkData.id);
        StringifyAndSavePropertyData(chunkData.id, chunkData);
        StringifyAndSavePropertyData(`country_${playerCountryData.id}`, playerCountryData);
        this.sender.sendMessage({ translate: `command.buychunk.result`, with: [`${playerCountryData.resourcePoint}`] });
        return;
    };

    sellChunk() {
        if (!this.playerData.country) {
            this.sender.sendMessage({ translate: `command.sellchunk.error.notjoin.country` });
            return;
        };
        const chunkData = GetAndParsePropertyData(GetPlayerChunkPropertyId(this.sender));
        let chunkPrice = config.defaultChunkPrice / 2;
        if (chunkData && chunkData.price) chunkPrice = chunkData.price / 2;
        const cannotSell = CheckPermission(this.sender, `sellChunk`);
        if (cannotSell) {
            if (chunkData && chunkData.country && chunkData.countryId == playerData.country) {
                this.sender.sendMessage({ translate: `command.permission.error` });
            };
            this.sender.sendMessage({ translate: `command.sellchunk.error.thischunk.notterritory` })
            return;
        };
        const playerCountryData = GetAndParsePropertyData(`country_${this.playerData.country}`);
        if (playerCountryData.territories.length < 2) {
            this.sender.sendMessage({ translate: `command.sellchunk.error.morechunk`, with: [`${chunkPrice}`] });
            return;
        };

        chunkData.countryId = undefined;
        playerCountryData.resourcePoint += chunkPrice;
        playerCountryData.territories.splice(playerCountryData.territories.indexOf(chunkData.id), 1);
        StringifyAndSavePropertyData(chunkData.id, chunkData);
        StringifyAndSavePropertyData(`country_${playerCountryData.id}`, playerCountryData);
        this.sender.sendMessage({ translate: `command.sellchunk.result`, with: [`${playerCountryData.resourcePoint}`] });
        return;
    };

    jobs() {
        if (!jobs_config.validity) {
            this.sender.sendMessage({ translate: `command.error.jobs.novalidity` });
            return;
        };
        jobsForm(this.sender);
        return;
    };

    shop() {
        if (!config.shopValidity) {
            this.sender.sendMessage({ translate: `no.available.shop` });
            return;
        };
        ShopCommonsMenu(this.sender);
        return;
    };

    playermarket() {
        if (!config.playerMarketValidity) {
            this.sender.sendMessage({ translate: `command.error.playermarket.novalidity` });
            return;
        };
        PlayerMarketMainMenu(this.sender);
        return;
    };

    tpa() {
        if (!config.tpaValidity) {
            this.sender.sendMessage({ translate: `command.error.tpa.novalidity` });
            return;
        };
        if (config.combatTagNoTeleportValidity) {
            if (this.sender.hasTag(`mc_combat`)) {
                this.sender.sendMessage({ translate: `teleport.error.combattag` });
                return;
            };
        };
        tpaMainForm(this.sender);
        return;
    };

    sendHelp() {
        /** 
         * @type {import("@minecraft/server").RawMessage}
         */
        const helpMessage = [{ text: `§a------------------------------------\n` },
        { translate: `command.help.money` }, { text: `\n` },
        { translate: `command.help.setup` }, { text: `\n` },
        { translate: `command.help.msend` }, { text: `\n` },
        { translate: `command.help.checkchunk` }, { text: `\n` },
        { translate: `command.help.cc` }, { text: `\n` },
        { translate: `command.help.sethome` }, { text: `\n` },
        { translate: `command.help.home` }, { text: `\n` },
        { translate: `command.help.checkhome` }, { text: `\n` },
        { translate: `command.help.adminchunk` }, { text: `\n` },
        { translate: `command.help.adminc` }, { text: `\n` },
        { translate: `command.help.resetchunk`, with: { rawtext: [{ translate: `special.name` }] } }, { text: `\n` },
        { translate: `command.help.resetc`, with: { rawtext: [{ translate: `special.name` }] } }, { text: `\n` },
        { translate: `command.help.buychunk` }, { text: `\n` },
        { translate: `command.help.buyc` }, { text: `\n` },
        { translate: `command.help.sellchunk` }, { text: `\n` },
        { translate: `command.help.sellc` }, { text: `\n` },
        { translate: `command.help.makecountry` }, { text: `\n` },
        { translate: `command.help.mc` }, { text: `\n` },
        { translate: `command.help.settingcountry` }, { text: `\n` },
        { translate: `command.help.sc` }, { text: `\n` },
        { translate: `command.help.leavecountry` }, { text: `\n` },
        { translate: `command.help.kill` }, { text: `\n` },
        { translate: `command.help.countrylist` }, { text: `\n` },
        { translate: `command.help.cl` }, { text: `\n` },
        { translate: `command.help.joincountry` }, { text: `\n` },
        { translate: `command.help.jc` }, { text: `\n` },
        { translate: `command.help.chome` }, { text: `\n` },
        { translate: `command.help.menu` }, { text: `\n` },
        { translate: `command.help.jobs` }, { text: `\n` },
        { translate: `command.help.playermarket` }, { text: `\n` },
        { translate: `command.help.pm` }, { text: `\n` },
        { translate: `command.help.shop` }, { text: `\n` },
        { translate: `command.help.tpa` }, { text: `\n` },
        { translate: `command.help.camera` }, { text: `\n` },
        { translate: `command.help.map` }, { text: `\n` },
        { text: `§btp §a:世界各地へテレポートするメニューを表示します\n` },
        { text: `§blobby §a:ロビーにテレポートします\n` },
        { text: `§bvote §a:投票の報酬を受け取ります\n` },
        { text: `§a------------------------------------` }];
        this.sender.sendMessage({ rawtext: helpMessage });
    };

    makeCountry() {
        if (this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.makecountry.error.belong.country` });
            return;
        };
        MakeCountryForm(this.sender);
        return;
    };

    settingCountry() {
        if (!this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.settingcountry.error.nobelong.country` });
            return;
        };
        settingCountry(this.sender);
        return;
    };

    joinCountry() {
        if (this.playerData?.country) {
            this.sender.sendMessage({ translate: `already.country.join` });
            return;
        };
        joinTypeSelectForm(this.sender);
        return;
    };

    leaveCountry() {
        if (!this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.leavecountry.error.no.belong.country` })
            return;
        };
        const countryData = GetAndParsePropertyData(`country_${this.playerData?.country}`);
        if (this.playerData.id === countryData.owner) {
            this.sender.sendMessage({ translate: `command.leavecountry.error.your.owner` })
            return;
        };
        playerCountryLeave(this.sender);
        return;
    };

    kill() {
        if (!config.killValidity) {
            this.sender.sendMessage({ translate: `command.error.kill.novalidity` });
            return;
        };
        this.sender.runCommand(`kill @s`);
        return;
    };

    CountryList() {
        countryList(this.sender);
        return;
    };

    chome() {
        if (!this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.chome.error.notjoin.country` });
            return;
        };
        const countryData = GetAndParsePropertyData(`country_${this.playerData.country}`);
        if (!countryData?.spawn || !countryData?.publicSpawn) {
            return;
        };
        let [x, y, z, rx, ry, dimensionId] = countryData?.spawn.split(`_`);
        if (CheckPermissionFromLocation(this.sender, Number(x), Number(z), dimensionId, `publicHomeUse`)) {
            //権限がない！！
            this.sender.sendMessage({ translate: `no.permission` });
            return
        };
        //tp
        this.sender.teleport({ x: Number(x), y: Number(y), z: Number(z) }, { dimension: world.getDimension(`${dimensionId.replace(`minecraft:`, ``)}`), rotation: { x: Number(rx), y: Number(ry) } });
        this.sender.sendMessage({ translate: `command.chome.result` })
        return;
    };

    mainMenu() {
        playerMainMenu(this.sender);
        return;
    };

    camera() {
        if (!config.cameraValidity) {
            this.sender.sendMessage({ translate: `command.error.camera.novalidity` });
            return;
        };
        const isCamera = this.sender.hasTag(`mc_camera`);
        if (isCamera) {
            this.sender.camera.clear();
            this.sender.removeTag(`mc_camera`);
            return;
        };
        if (!isCamera) {
            this.sender.addTag(`mc_camera`);
            this.sender.camera.setCamera(`minecraft:free`, { location: this.sender.getHeadLocation(), rotation: this.sender.getRotation() });
            return;
        };
        return;
    };
    map() {
        const playerCurrentChunk = GetPlayerChunkPropertyId(this.sender);
        let [chunk, currentX, currentZ, dimension] = playerCurrentChunk.split(`_`);
        let currentXNum = Number(currentX);
        let currentZNum = Number(currentZ);
        let playerCountryId = this.playerData?.country ?? -10;
        let result = [];
        for (let i = 10; i > -11; i--) {
            let jResult = [];
            for (let j = -10; j < 11; j++) {
                let chunkX = currentXNum + i;
                let chunkZ = currentZNum + j;
                let chunkId = `${chunk}_${chunkX}_${chunkZ}_${dimension}`;
                let chunkData = GetAndParsePropertyData(`${chunkId}`);
                let colorCode = "f"
                if (chunkData?.countryId) {
                    colorCode = "e";
                    if (chunkData?.countryId === playerCountryId && playerCountryId != 0) {
                        colorCode = "a";
                    };
                };
                if (i === 0 && j === 0) {
                    colorCode = "4"
                };
                jResult.push(`§${colorCode}O`);
            };
            result.push(jResult.join(``));
        };
        this.sender.sendMessage(`§c----------------------------------------------------\n${result.join(`\n`)}\n§c----------------------------------------------------`);
        return;
    };
    invade() {
        if (!this.playerData?.country) {
            this.sender.sendMessage({ translate: `command.sellchunk.error.notjoin.country` });
            return;
        };
        const cancel = CheckPermission(this.sender, `warAdmin`);
        if (cancel) {
            this.sender.sendMessage({ translate: `command.error.permission` });
            return;
        };
        Invade(this.sender);
        return;
    };
};

world.beforeEvents.chatSend.subscribe(event => {
    if (event.sender.hasTag(`moderator`) && event.message.startsWith(`!`)) return;
    if (event.message === `?tp` || event.message === `?lobby` || event.message === `?vote` || event.message === `?login`) return;
    const chatHandler = new ChatHandler(event);
    if (chatHandler.isCommand()) {
        chatHandler.handleCommand();
    } else {
        if (event.sender.getDynamicProperty(`isMute`) && !event.sender.hasTag(`moderator`)) return;
        chatHandler.handleChat();
    };
});