import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { typeIdToID } from "./typeIds";

const sizes = new Map([
    [ "single", 27 ],
    [ "double", 54 ],
    [ "small", 27 ],
    [ "large", 54 ]
]);
export class ChestFormData {
    /** @type {ActionFormData} */
    #formData
	
    /** @type {{ text: string, icon: string|number }[]} */
    #buttons

    /** @type {string} */
    #type

    /** @param {("single"|"double"|"small"|"large")} size */
	constructor(size = "large") {
        this.#formData = new ActionFormData();
		this.#buttons = new Array(sizes.get(size)).fill({ text: "", icon: undefined });
        this.#type =
            [ "small", "single" ].includes(size) ? "§c§h§e§s§t§s§m§a§l§l§r" :
            [ "double", "large" ].includes(size) ? "§c§h§e§s§t§l§a§r§g§e§r" : "";
	}

    /**
     * 
     * @param {string} title 
     * @returns {ChestFormData}
     */
	setTitle (title) { try {
        this.#formData.title(`${this.#type}${title}`);
		return this;
	} catch (e) {
        console.error(e, e.stack);
    }}

    /**
     * 
     * @param {number} slot 
     * @param {{ iconPath: string|number, name: string, stackAmount?: number, lore?: string[], isGlint?: boolean }} itemData
     * @returns {ChestFormData}
     */
    setButton (slot, itemData) { try {
        const item = itemData;
        const id = typeof item?.iconPath === "number" ? item.iconPath : typeIdToID.get(item.iconPath);
        const text = `stack#${Math.min(Math.max(item.stackAmount, 1) || 1, 64).toString().padStart(2, "0")}§r${item.name}§r${item.lore?.length > 0 ? `\n§r${item.lore.join("\n§r")}` : ""}`;
        const texture = (id * 65536 + (item.isGlint ? 32768 : 0)) || item.iconPath;

        this.#buttons.splice(slot, 1, { text: text, icon: String(texture) });
        return this;
    } catch (e) {
        console.error(e, e.stack);
    }}

    /**
     * @param {{ slot: number, itemData: { iconPath: string, name: string, stackAmount: number, lore: string[], isGlint: boolean } }[]} buttons
     * @returns {ChestFormData}
     */
    setButtons (buttons) { try {
        for (let { slot, itemData } of buttons) this.setButton(slot, itemData);
        return this;
    } catch (e) {
        console.error(e, e.stack);
    }}

    /**
     * 
     * @param {[ height: number, width: number ]} from 
     * @param {string[]} pattern 
     * @param {{ slot: number, itemData: { iconPath: string, name: string, stackAmount: number, lore: string[], isGlint: boolean }}} key - { key: { data: { name: string, lore: string[], stackAmount: number, isGlint: boolean }, iconPath: string } } 
     * @returns {ChestFormData}
     */
	setPattern (from, pattern, key) { try {
		pattern.forEach((row, i) => {
            [ ...row ].forEach((letter, j) => {
                const data = key[letter];
                if (data) {
                    const slot = (from[1] + j) + ((from[0] + i) * 9);
                    this.setButton(slot, data);
                }
            });
        });
		return this;

        
	} catch (e) {
        console.error(e, e.stack);
    }}

    /**
     * 
     * @param {Player} player 
     * @returns {Promise<ActionFormResponse>}
     */
    async show (player) { try {
        for (let button of this.#buttons) this.#formData.button(button.text, button.icon);
		return this.#formData.show(player);
	} catch (e) {
        console.error(e, e.stack);
    }}
}
