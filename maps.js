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


// Map definitions
MAPS['knights_charge'] = {
    width: 8,
    height: 8,
    tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
        if (r === 3 && c === 3) return { level: GROUND_LEVELS.ABOVE_GROUND, type: TILE_TYPES.FOREST, status: TILE_STATUSES.NORMAL };
        if (r === 4 && c === 4) return { level: GROUND_LEVELS.BELOW_GROUND, type: TILE_TYPES.WATER, status: TILE_STATUSES.MAGICAL };
        if (r === 5 && c === 5) return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.PLAIN, status: TILE_STATUSES.CURSED };
        if (c % 2 === 0) return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.FOREST, status: TILE_STATUSES.NORMAL };
        if (r % 3 === 0) return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.WATER, status: TILE_STATUSES.NORMAL };
        return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.PLAIN, status: TILE_STATUSES.NORMAL };
    }))
};

MAPS['archers_perch'] = {
    width: 8,
    height: 8,
    tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
        if (r < 2) return { level: GROUND_LEVELS.ABOVE_GROUND, type: TILE_TYPES.FOREST, status: TILE_STATUSES.NORMAL };
        if (r > 5) return { level: GROUND_LEVELS.BELOW_GROUND, type: TILE_TYPES.WATER, status: TILE_STATUSES.NORMAL };
        return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.PLAIN, status: TILE_STATUSES.NORMAL };
    }))
};

MAPS['warriors_stand'] = {
    width: 8,
    height: 8,
    tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
        // Center arena
        if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
             return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.PLAIN, status: TILE_STATUSES.NORMAL };
        }
        // Surrounded by cursed water
        return { level: GROUND_LEVELS.BELOW_GROUND, type: TILE_TYPES.WATER, status: TILE_STATUSES.CURSED };
    }))
};

MAPS['tiny_trap'] = {
    width: 5,
    height: 5,
    tiles: Array(5).fill(null).map((_, r) => Array(5).fill(null).map((_, c) => {
        if (r === 2 && c === 2) return { level: GROUND_LEVELS.BELOW_GROUND, type: TILE_TYPES.PLAIN, status: TILE_STATUSES.MAGICAL };
        return { level: GROUND_LEVELS.GROUND, type: TILE_TYPES.FOREST, status: TILE_STATUSES.NORMAL };
    }))
};

window.MAPS = MAPS;
window.createDefaultMap = createDefaultMap;
