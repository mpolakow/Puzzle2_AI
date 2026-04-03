const MONSTERS = {
    'goblin': {
        icon: 'â™™', type: window.PIECE_TYPES.MONSTER, moveStrategy: 'pawn',
	image: 'Sprites/Goblin.png',
        Health: 30, Mana: 0, Attack: 10, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 5, Armor_Type: window.Armor_Type.NONE, Move: 1, Movement_Types: [window.Movement_Type.WALKING]
    },
    'orc': {
        icon: 'â™–', type: window.PIECE_TYPES.MONSTER, moveStrategy: 'rook', range: 4,
	image: 'Sprites/Orc.png',
        Health: 80, Mana: 0, Attack: 15, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 10, Armor_Type: window.Armor_Type.MEDIUM, Move: 1, Movement_Types: [window.Movement_Type.WALKING]
    },
    'ogre': {
        icon: 'â™š', type: window.PIECE_TYPES.MONSTER, moveStrategy: 'king',
        Health: 150, Mana: 0, Attack: 30, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 20, Armor_Type: window.Armor_Type.HARD, Move: 1, Movement_Types: [window.Movement_Type.WALKING]
    }
};

window.MONSTERS = MONSTERS;
