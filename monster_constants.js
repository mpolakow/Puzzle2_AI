const MONSTERS = {
    'goblin': {
        icon: '♙', type: window.PIECE_TYPES.MONSTER, moves: getPawnMoves,
        Health: 30, Mana: 0, Attack: 10, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 5, Armor_Type: window.Armor_Type.NONE, Move: 1
    },
    'orc': {
        icon: '♖', type: window.PIECE_TYPES.MONSTER, moves: getRookMoves, range: 4,
        Health: 80, Mana: 0, Attack: 15, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 10, Armor_Type: window.Armor_Type.MEDIUM, Move: 1
    },
    'ogre': {
        icon: '♚', type: window.PIECE_TYPES.MONSTER, moves: getKingMoves,
        Health: 150, Mana: 0, Attack: 30, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 20, Armor_Type: window.Armor_Type.HARD, Move: 1
    }
};

window.MONSTERS = MONSTERS;
