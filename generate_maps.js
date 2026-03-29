const GROUND_LEVELS = { ABOVE_GROUND: 'U', GROUND: 'G', BELOW_GROUND: 'D' };
const TILE_TYPES = { FOREST: 'F', PLAIN: 'P', WATER: 'W' };
const TILE_STATUSES = { NORMAL: 'N', MAGICAL: 'M', CURSED: 'C' };

const maps = {
    'knights_charge': {
        width: 8, height: 8,
        tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
            if (r === 3 && c === 3) return { level: 'U', type: 'F', status: 'N' };
            if (r === 4 && c === 4) return { level: 'D', type: 'W', status: 'M' };
            if (r === 5 && c === 5) return { level: 'G', type: 'P', status: 'C' };
            if (c % 2 === 0) return { level: 'G', type: 'F', status: 'N' };
            if (r % 3 === 0) return { level: 'G', type: 'W', status: 'N' };
            return { level: 'G', type: 'P', status: 'N' };
        }))
    },
    'archers_perch': {
        width: 8, height: 8,
        tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
            if (r < 2) return { level: 'U', type: 'F', status: 'N' };
            if (r > 5) return { level: 'D', type: 'W', status: 'N' };
            return { level: 'G', type: 'P', status: 'N' };
        }))
    },
    'warriors_stand': {
        width: 8, height: 8,
        tiles: Array(8).fill(null).map((_, r) => Array(8).fill(null).map((_, c) => {
            if (r >= 2 && r <= 5 && c >= 2 && c <= 5) return { level: 'G', type: 'P', status: 'N' };
            return { level: 'D', type: 'W', status: 'C' };
        }))
    },
    'tiny_trap': {
        width: 5, height: 5,
        tiles: Array(5).fill(null).map((_, r) => Array(5).fill(null).map((_, c) => {
            if (r === 2 && c === 2) return { level: 'D', type: 'P', status: 'M' };
            return { level: 'G', type: 'F', status: 'N' };
        }))
    }
};

const PUZZLES = [
    {
        map: "knights_charge",
        layout: [
            { piece: 'knight', pos: [7, 1] },
            { piece: 'goblin', pos: [5, 2] }
        ]
    },
    {
        map: "archers_perch",
        layout: [
            { piece: 'archer', pos: [7, 0] },
            { piece: 'orc', pos: [4, 3] },
            { piece: 'ogre', pos: [1, 6] }
        ]
    },
    {
        map: "warriors_stand",
        layout: [
            { piece: 'warrior', pos: [4, 4] },
            { piece: 'ogre', pos: [1, 1] },
            { piece: 'goblin', pos: [3, 2] },
            { piece: 'goblin', pos: [3, 6] },
        ]
    },
    {
        map: "tiny_trap",
        layout: [
            { piece: 'warrior', pos: [4, 2] },
            { piece: 'goblin', pos: [0, 2] }
        ]
    }
];

const REVERSE_UNIT_MAP = {
    'knight': 'HK',
    'archer': 'HA',
    'warrior': 'HW',
    'goblin': 'MG',
    'orc': 'MO',
    'ogre': 'MR'
};

for (const [name, map] of Object.entries(maps)) {
    console.log(`\n// --- ${name} ---`);
    const types = map.tiles.map(row => row.map(t => t.type));
    const levels = map.tiles.map(row => row.map(t => t.level));
    const statuses = map.tiles.map(row => row.map(t => t.status));

    let units = Array(map.height).fill(null).map(() => Array(map.width).fill('XY'));
    const p = PUZZLES.find(p => p.map === name);
    if (p) {
        for (const u of p.layout) {
            units[u.pos[0]][u.pos[1]] = REVERSE_UNIT_MAP[u.piece];
        }
    }

    const formatArray = (arr) => '[\n    ' + arr.map(row => "['" + row.join("', '") + "']").join(',\n    ') + '\n  ]';

    console.log(`const ${name}_tiles = ${formatArray(types)};`);
    console.log(`const ${name}_level = ${formatArray(levels)};`);
    console.log(`const ${name}_status = ${formatArray(statuses)};`);
    console.log(`const ${name}_units = ${formatArray(units)};`);
}
