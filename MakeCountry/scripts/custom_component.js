import { world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((ev) => {
    const { itemComponentRegistry, blockComponentRegistry } = ev;

    blockComponentRegistry.registerCustomComponent("mc:grow", {
        onRandomTick(ev) {
            const growth_stage = ev.block.permutation.getState('mc:growth_stage');
            if (growth_stage < 3) {
                const randomNum = RandomInt(1, 20);
                if (randomNum != 2) return; 
                const new_permutation = ev.block.permutation.withState('mc:growth_stage', growth_stage + 1);
                ev.block.setPermutation(new_permutation);
            }
        },
    });
});


function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};