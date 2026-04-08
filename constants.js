const Attack_Type = {
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic'
};

const Armor_Type = {
    NONE: 'none',
    LIGHT: 'light',
    MEDIUM: 'medium',
    HARD: 'hard'
};

const PIECE_TYPES = {
    HERO: 'hero',
    MONSTER: 'monster'
};

const Movement_Type = {
    WALKING: 'walking',
    FLYING: 'flying',
    SWIMMING: 'swimming',
    CLIMBING: 'climbing'
};

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

window.Attack_Type = Attack_Type;
window.Armor_Type = Armor_Type;
window.PIECE_TYPES = PIECE_TYPES;
window.Movement_Type = Movement_Type;
window.BOARD_WIDTH = BOARD_WIDTH;
window.BOARD_HEIGHT = BOARD_HEIGHT;

const LEVEL_CODES = {
    "KNIGHTMARE": 0,
    "ARCHERPATH": 1,
    "WARRIORWAY": 2,
    "TINYTRAP": 3
};

const TILE_IMAGES = {};

// Add this
const MoveType = {
    MOVE: 'move',
    ATTACK: 'attack'
};

window.MoveType = MoveType;
window.LEVEL_CODES = LEVEL_CODES;
window.TILE_IMAGES = TILE_IMAGES;
window.TILE_IMAGES['forest'] = 'Sprites/Forestv2.png';
window.TILE_IMAGES['water'] = 'Sprites/Water.png';
window.TILE_IMAGES['plain'] = 'Sprites/Plainsv2.png';
