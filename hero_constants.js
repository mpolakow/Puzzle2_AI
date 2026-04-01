const HEROES = {
    'knight': {
        icon: 'â™', type: window.PIECE_TYPES.HERO, moveStrategy: 'knight',
	image: 'Sprites/Knight.png', // <-- Add this
        Health: 100, Mana: 0, Attack: 20, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 10, Armor_Type: window.Armor_Type.MEDIUM, Move: 1
    },
    'archer': {
        icon: 'â™—', type: window.PIECE_TYPES.HERO, moveStrategy: 'bishop', range: 3,
	image: 'Sprites/Archer.png',
        Health: 70, Mana: 20, Attack: 35, Attack_Type: window.Attack_Type.RANGED, Attack_Range: 3, Defense: 5, Armor_Type: window.Armor_Type.LIGHT, Move: 1
    },
    'warrior': {
        icon: 'â™”', type: window.PIECE_TYPES.HERO, moveStrategy: 'king',
        Health: 120, Mana: 0, Attack: 25, Attack_Type: window.Attack_Type.MELEE, Attack_Range: 1, Defense: 15, Armor_Type: window.Armor_Type.HARD, Move: 1
    }
};

window.HEROES = HEROES;
