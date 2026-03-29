const GROUND_LEVELS = {
    ABOVE_GROUND: 'above_ground',
    GROUND: 'ground',
    BELOW_GROUND: 'below_ground'
};

const TILE_TYPES = {
    FOREST: 'forest',
    PLAIN: 'plain',
    WATER: 'water'
};

const TILE_STATUSES = {
    NORMAL: 'normal',
    MAGICAL: 'magical',
    CURSED: 'cursed'
};

window.GROUND_LEVELS = GROUND_LEVELS;
window.TILE_TYPES = TILE_TYPES;
window.TILE_STATUSES = TILE_STATUSES;

// Maps configuration
const MAPS = {}; // Will be populated dynamically

// Helper function to create a default map
function createDefaultMap(width, height) {
    const tiles = [];
    for (let r = 0; r < height; r++) {
        const row = [];
        for (let c = 0; c < width; c++) {
            row.push({
                level: GROUND_LEVELS.GROUND,
                type: TILE_TYPES.PLAIN,
                status: TILE_STATUSES.NORMAL
            });
        }
        tiles.push(row);
    }
    return { width, height, tiles };
}

window.MAPS = MAPS;
window.createDefaultMap = createDefaultMap;
