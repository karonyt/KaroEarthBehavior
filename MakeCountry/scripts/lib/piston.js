import { BlockPermutation, BlockPistonState, world } from "@minecraft/server";

world.afterEvents.pistonActivate.subscribe((ev) => {
    const { block, dimension, piston, isExpanding } = ev;
    if (!isExpanding) return;
    const blocks = piston.getAttachedBlocks();
    switch (block.permutation.getState(`facing_direction`)) {
        case 0: {
            for (const b of blocks) {
                b.above()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
        case 1: {
            for (const b of blocks) {
                b.below()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
        case 2: {
            for (const b of blocks) {
                b.north()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
        case 3: {
            for (const b of blocks) {
                b.south()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
        case 4: {
            for (const b of blocks) {
                b.west()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
        case 5: {
            for (const b of blocks) {
                b.east()?.setPermutation(b.permutation);
                b.setPermutation(BlockPermutation.resolve(`minecraft:air`));
            };
        };
    };
    //0 [下]
    //1 [上]
    //2 [南]
    //3 [北]
    //4 [東]
    //5 [西]


});