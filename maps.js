const GROUND_LEVELS = {
    ABOVE_GROUND: 'above_ground',
    GROUND: 'ground',
    BELOW_GROUND: 'below_ground'
};

const TILE_TYPES = {
    FOREST: 'forest',
    PLAIN: 'plain',
    WATER: 'water',
    MOUNTAIN: 'mountain',
    AIR: 'air',
    EMPTY: 'empty'
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
    return { width, height, tiles, units: Array(height).fill(null).map(() => Array(width).fill('XY')) };
}

const TILE_MAP = {
    'W': TILE_TYPES.WATER,
    'P': TILE_TYPES.PLAIN,
    'F': TILE_TYPES.FOREST,
    'M': TILE_TYPES.MOUNTAIN,
    'A': TILE_TYPES.AIR,
    'E': TILE_TYPES.EMPTY
};

const LEVEL_MAP = {
    'G': GROUND_LEVELS.GROUND,
    'U': GROUND_LEVELS.ABOVE_GROUND,
    'D': GROUND_LEVELS.BELOW_GROUND
};

const STATUS_MAP = {
    'N': TILE_STATUSES.NORMAL,
    'M': TILE_STATUSES.MAGICAL,
    'C': TILE_STATUSES.CURSED
};

function createMapFromArrays(tilesArr, levelArr, statusArr, unitsArr) {
    const height = tilesArr.length;
    const width = height > 0 ? tilesArr[0].length : 0;

    const tiles = [];
    for (let r = 0; r < height; r++) {
        const row = [];
        for (let c = 0; c < width; c++) {
            row.push({
                type: TILE_MAP[tilesArr[r][c]],
                level: LEVEL_MAP[levelArr[r][c]],
                status: STATUS_MAP[statusArr[r][c]]
            });
        }
        tiles.push(row);
    }

    return { width, height, tiles, units: unitsArr };
}

// Map definitions

MAPS['knights_charge'] = createMapFromArrays(
    [
        ['F', 'W', 'F', 'W', 'F', 'W', 'F', 'W'],
        ['F', 'P', 'F', 'P', 'F', 'P', 'F', 'P'],
        ['F', 'P', 'F', 'P', 'F', 'P', 'F', 'P'],
        ['F', 'W', 'F', 'F', 'F', 'W', 'F', 'W'],
        ['F', 'P', 'F', 'P', 'W', 'P', 'F', 'P'],
        ['F', 'P', 'F', 'P', 'F', 'P', 'F', 'P'],
        ['F', 'W', 'F', 'W', 'F', 'W', 'F', 'W'],
        ['F', 'P', 'F', 'P', 'F', 'P', 'F', 'P']
    ],
    [
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'U', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'D', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G']
    ],
    [
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'M', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'C', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']
    ],
    [
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'MG', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'HK', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY']
    ]
);

MAPS['archers_perch'] = createMapFromArrays(
    [
        ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
        ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
    ],
    [
        ['U', 'U', 'U', 'U', 'U', 'U', 'U', 'U'],
        ['U', 'U', 'U', 'U', 'U', 'U', 'U', 'U'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']
    ],
    [
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']
    ],
    [
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'MR', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'MO', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['HA', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY']
    ]
);

MAPS['warriors_stand'] = createMapFromArrays(
    [
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'P', 'P', 'P', 'P', 'W', 'W'],
        ['W', 'W', 'P', 'P', 'P', 'P', 'W', 'W'],
        ['W', 'W', 'P', 'P', 'P', 'P', 'W', 'W'],
        ['W', 'W', 'P', 'P', 'P', 'P', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
    ],
    [
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'G', 'G', 'G', 'G', 'D', 'D'],
        ['D', 'D', 'G', 'G', 'G', 'G', 'D', 'D'],
        ['D', 'D', 'G', 'G', 'G', 'G', 'D', 'D'],
        ['D', 'D', 'G', 'G', 'G', 'G', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']
    ],
    [
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
        ['C', 'C', 'N', 'N', 'N', 'N', 'C', 'C'],
        ['C', 'C', 'N', 'N', 'N', 'N', 'C', 'C'],
        ['C', 'C', 'N', 'N', 'N', 'N', 'C', 'C'],
        ['C', 'C', 'N', 'N', 'N', 'N', 'C', 'C'],
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C']
    ],
    [
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'MR', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'MG', 'XY', 'XY', 'XY', 'MG', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'HW', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY', 'XY']
    ]
);

MAPS['tiny_trap'] = createMapFromArrays(
    [
        ['F', 'F', 'F', 'F', 'F'],
        ['F', 'F', 'F', 'F', 'F'],
        ['F', 'F', 'P', 'F', 'F'],
        ['F', 'F', 'F', 'F', 'F'],
        ['F', 'F', 'F', 'F', 'F']
    ],
    [
        ['G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'D', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G']
    ],
    [
        ['N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'M', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N']
    ],
    [
        ['XY', 'XY', 'MG', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'XY', 'XY', 'XY'],
        ['XY', 'XY', 'HW', 'XY', 'XY']
    ]
);

window.MAPS = MAPS;
window.createDefaultMap = createDefaultMap;
