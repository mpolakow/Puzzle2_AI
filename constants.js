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

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

window.Attack_Type = Attack_Type;
window.Armor_Type = Armor_Type;
window.PIECE_TYPES = PIECE_TYPES;
window.BOARD_WIDTH = BOARD_WIDTH;
window.BOARD_HEIGHT = BOARD_HEIGHT;

const LEVEL_CODES = {
    "KNIGHTMARE": 0,
    "ARCHERPATH": 1,
    "WARRIORWAY": 2,
    "TINYTRAP": 3
};

// Add this
const MoveType = {
    MOVE: 'move',
    ATTACK: 'attack'
};

window.MoveType = MoveType;
window.LEVEL_CODES = LEVEL_CODES;
