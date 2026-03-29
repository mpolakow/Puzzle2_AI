let boardContainer;
let movesLeftEl;
let puzzleTitleEl;
let puzzleObjectiveEl;
let resetButton;
let modal;
let modalTitle;
let modalMessage;
let modalNextButton;
let modalCloseButton;
let boardWidthInput;
let boardHeightInput;
let applySizeButton;

let PIECES = {};

const PUZZLES = [
    {
        name: "Knight's Charge",
        map: "knights_charge",
        objective: "Capture the Goblin.",
        width: 8,
        height: 8,
        moves: 3,
        layout: [
            { piece: 'knight', pos: [7, 1] },
            { piece: 'goblin', pos: [5, 2] }
        ]
    },
    {
        name: "Archer's Perch",
        map: "archers_perch",
        objective: "Eliminate the Orc and Ogre.",
        width: 8,
        height: 8,
        moves: 4,
        layout: [
            { piece: 'archer', pos: [7, 0] },
            { piece: 'orc', pos: [4, 3] },
            { piece: 'ogre', pos: [1, 6] }
        ]
    },
    {
        name: "Warrior's Stand",
        map: "warriors_stand",
        objective: "Defeat the mighty Ogre.",
        width: 8,
        height: 8,
        moves: 5,
        layout: [
            { piece: 'warrior', pos: [4, 4] },
            { piece: 'ogre', pos: [1, 1] },
            { piece: 'goblin', pos: [3, 2] },
            { piece: 'goblin', pos: [3, 6] },
        ]
    },
    {
        name: "Goblin's Tiny Trap",
        map: "tiny_trap",
        objective: "Defeat the Goblin in the small room.",
        width: 5,
        height: 5,
        moves: 2,
        layout: [
            { piece: 'warrior', pos: [4, 2] },
            { piece: 'goblin', pos: [0, 2] }
        ]
    }
];

let gameState = {
    board: [],
    selectedPiece: null,
    validMoves: [],
    validAttackMoves: [], // Add this
    movesLeft: 0,
    currentPuzzleIndex: 0,
    isGameOver: false,
    mapConfig: null
};

// --- Piece Movement Logic ---

function offsetToCube(row, col) {
    var q = col - (row - (row&1)) / 2;
    var r = row;
    var s = -q - r;
    return {q: q, r: r, s: s};
}

function cubeToOffset(q, r, s) {
    var row = r;
    var col = q + (row - (row&1)) / 2;
    return {row: row, col: col};
}

function cubeDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function getKnightMoves(row, col, board) {
    // Knight move on hex grid: 2 steps in one direction, 1 in another (or 3 steps)
    // A standard hex knight move is jumping to the 12 hexes that are at distance 2,
    // but not in a straight line. Or jumping to next-next-neighbor.
    // In cube coordinates, this is a permutation of (+/-1, +/-2, +/-3) which sum to 0
    // Actually, hex knight moves are:
    const startCube = offsetToCube(row, col);
    const knightDirs = [
        {q: 3, r: -1, s: -2}, {q: 3, r: -2, s: -1}, {q: 2, r: 1, s: -3},
        {q: 2, r: -3, s: 1}, {q: 1, r: 2, s: -3}, {q: 1, r: -3, s: 2},
        {q: -1, r: 3, s: -2}, {q: -1, r: -2, s: 3}, {q: -2, r: 3, s: -1},
        {q: -2, r: -1, s: 3}, {q: -3, r: 2, s: 1}, {q: -3, r: 1, s: 2}
    ];

    const moves = [];
    const pieceType = board[row][col].type;

    for (const dir of knightDirs) {
        const q = startCube.q + dir.q;
        const r = startCube.r + dir.r;
        const s = startCube.s + dir.s;

        const offset = cubeToOffset(q, r, s);
        const newRow = offset.row;
        const newCol = offset.col;

        if (isValidSquare(newRow, newCol)) {
            const targetSquare = board[newRow][newCol];
            if (!targetSquare || targetSquare.type !== pieceType) {
                 moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

// --- Hex Coordinates Math ---

// For an odd-r layout:
const hexDirections = {
    even: [[-1, -1], [-1, 0], [0, 1], [1, 0], [1, -1], [0, -1]],
    odd:  [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [0, -1]]
};

function getHexNeighbors(row, col) {
    const isOdd = row % 2 !== 0;
    const dirs = isOdd ? hexDirections.odd : hexDirections.even;
    return dirs.map(([dr, dc]) => [row + dr, col + dc]);
}

function getKingMoves(row, col, board) {
    const isOdd = row % 2 !== 0;
    const moves = isOdd ? hexDirections.odd : hexDirections.even;
    return getValidMovesFromOffsets(row, col, moves, board);
}

function getPawnMoves(row, col, board) {
    // Goblins (pawns) move one step forward. In our hex map, "forward" (towards row 0)
    // can be Top-Left or Top-Right.
    const isOdd = row % 2 !== 0;
    // For moving forward (row - 1):
    const moveDirs = isOdd ? [[-1, 0], [-1, 1]] : [[-1, -1], [-1, 0]];

    let validMoves = [];
    // Regular moves (forward to empty spaces)
    for (const [dr, dc] of moveDirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        if(isValidSquare(newRow, newCol) && !board[newRow][newCol]) {
            validMoves.push([newRow, newCol]);
        }
    }
    // Capture moves (same as forward moves for pawns on hex grid unless defined otherwise)
    for (const [dr, dc] of moveDirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        if(isValidSquare(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol].type === PIECE_TYPES.HERO) {
            validMoves.push([newRow, newCol]);
        }
    }
    return validMoves;
}

function getSlidingMoves(row, col, isBishop, board, range) {
    let moves = [];
    const pieceType = board[row][col].type;

    // For hex grid, Rook slides along the 6 hex directions
    // Bishop slides along the "diagonals" (jumps to the 6 next-nearest neighbors)
    let directions = [];

    if (!isBishop) {
        // Rook directions are tricky to slide because the coordinate step changes
        // between even and odd rows. We need to walk step by step.
        // We'll define sliding in 6 directions by repeatedly taking a step in that direction.
        // On a hex grid, a straight line means moving in one of the 6 neighbor directions consistently.
        for (let dirIndex = 0; dirIndex < 6; dirIndex++) {
            let r = row;
            let c = col;
            for (let i = 1; i <= range; i++) {
                const isOdd = r % 2 !== 0;
                const dirs = isOdd ? hexDirections.odd : hexDirections.even;
                const [dr, dc] = dirs[dirIndex];
                r += dr;
                c += dc;

                if (!isValidSquare(r, c)) break;

                const targetSquare = board[r][c];
                if (targetSquare) {
                    if (targetSquare.type !== pieceType) {
                        moves.push([r, c]);
                    }
                    break;
                }
                moves.push([r, c]);
            }
        }
    } else {
        // Bishop moves on diagonals (like a 3-way intersection jump)
        // We'll approximate this by taking 2 steps in combinations, but simpler:
        // Let's just give Bishop a star-like pattern or just use cube coordinates
        // to find straight lines in the 3 axes.

        // Actually, the most robust way to do sliding on hexes is with Cube coordinates.
        // Let's implement Cube sliding.
        const startCube = offsetToCube(row, col);
        // 6 straight directions in cube coordinates
        const cubeDirs = [
            {q: 1, r: -1, s: 0}, {q: 1, r: 0, s: -1}, {q: 0, r: 1, s: -1},
            {q: -1, r: 1, s: 0}, {q: -1, r: 0, s: 1}, {q: 0, r: -1, s: 1}
        ];

        // Diagonals in cube coordinates
        const cubeDiags = [
            {q: 2, r: -1, s: -1}, {q: 1, r: 1, s: -2}, {q: -1, r: 2, s: -1},
            {q: -2, r: 1, s: 1}, {q: -1, r: -1, s: 2}, {q: 1, r: -2, s: 1}
        ];

        const usedDirs = isBishop ? cubeDiags : cubeDirs;

        for (const dir of usedDirs) {
            for (let i = 1; i <= range; i++) {
                const q = startCube.q + dir.q * i;
                const r = startCube.r + dir.r * i;
                const s = startCube.s + dir.s * i;

                const offset = cubeToOffset(q, r, s);
                const r_off = offset.row;
                const c_off = offset.col;

                if (!isValidSquare(r_off, c_off)) break;

                const targetSquare = board[r_off][c_off];
                if (targetSquare) {
                    if (targetSquare.type !== pieceType) {
                        moves.push([r_off, c_off]);
                    }
                    break;
                }
                moves.push([r_off, c_off]);
            }
        }
    }

    return moves;
}

function getBishopMoves(row, col, board, piece) {
    return getSlidingMoves(row, col, true, board, piece.Move);
}

function getRookMoves(row, col, board, piece) {
    return getSlidingMoves(row, col, false, board, piece.Move);
}

function getValidMovesFromOffsets(row, col, offsets, board) {
    const moves = [];
    const pieceType = board[row][col].type;

    for (const [dr, dc] of offsets) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (isValidSquare(newRow, newCol)) {
            const targetSquare = board[newRow][newCol];
            if (!targetSquare || targetSquare.type !== pieceType) {
                 moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

function isValidSquare(row, col) {
    return row >= 0 && row < window.BOARD_HEIGHT && col >= 0 && col < window.BOARD_WIDTH;
}


// --- Game Flow & State Management ---

function createBoard() {
    boardContainer.innerHTML = '';
    // Use flex column for hex board, not grid
    boardContainer.style.gridTemplateColumns = '';

    // Get the current map configuration
    const currentMap = gameState.mapConfig || window.createDefaultMap(window.BOARD_WIDTH, window.BOARD_HEIGHT);

    for (let row = 0; row < window.BOARD_HEIGHT; row++) {
        const rowEl = document.createElement('div');
        rowEl.classList.add('row');
        if (row % 2 !== 0) {
            rowEl.classList.add('odd');
        }
        for (let col = 0; col < window.BOARD_WIDTH; col++) {
            const square = document.createElement('div');
            // Can use same light/dark logic, or simplify for hex map
            square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');

            // Apply tile properties from map
            let tileConfig = {
                level: window.GROUND_LEVELS.GROUND,
                type: window.TILE_TYPES.PLAIN,
                status: window.TILE_STATUSES.NORMAL
            };

            if (currentMap && currentMap.tiles && currentMap.tiles[row] && currentMap.tiles[row][col]) {
                tileConfig = currentMap.tiles[row][col];
            }

            // Add classes based on properties
            square.classList.add('level-' + tileConfig.level);
            square.classList.add('type-' + tileConfig.type);
            square.classList.add('status-' + tileConfig.status);

            square.dataset.row = row;
            square.dataset.col = col;

            // Save properties to dataset for potential later use
            square.dataset.level = tileConfig.level;
            square.dataset.type = tileConfig.type;
            square.dataset.status = tileConfig.status;

            // The event listener is on the square, which is crucial
            square.addEventListener('click', onSquareClick);
            rowEl.appendChild(square);
        }
        boardContainer.appendChild(rowEl);
    }
}

function setupPuzzle(puzzleIndex) {
    gameState.isGameOver = false;
    gameState.currentPuzzleIndex = puzzleIndex;
    const puzzle = PUZZLES[puzzleIndex];

    // Load map configuration
    if (puzzle.map && window.MAPS[puzzle.map]) {
        gameState.mapConfig = window.MAPS[puzzle.map];
    } else {
        gameState.mapConfig = window.createDefaultMap(puzzle.width || 8, puzzle.height || 8);
    }

    // Use the puzzle's defined size, or default to 8x8.
    const newWidth = gameState.mapConfig.width || puzzle.width || 8;
    const newHeight = gameState.mapConfig.height || puzzle.height || 8;

    window.BOARD_WIDTH = newWidth;
    window.BOARD_HEIGHT = newHeight;
    boardWidthInput.value = newWidth;
    boardHeightInput.value = newHeight;

    // Re-create the board visuals to match the puzzle's size
    createBoard();

    // Setup board state
    gameState.board = Array(window.BOARD_HEIGHT).fill(null).map(() => Array(window.BOARD_WIDTH).fill(null));

    // Map units from mapConfig
    if (gameState.mapConfig && gameState.mapConfig.units) {
        const UNIT_MAP = {
            'HK': 'knight',
            'HA': 'archer',
            'HW': 'warrior',
            'MG': 'goblin',
            'MO': 'orc',
            'MR': 'ogre'
        };
        for (let r = 0; r < window.BOARD_HEIGHT; r++) {
            for (let c = 0; c < window.BOARD_WIDTH; c++) {
                if (gameState.mapConfig.units[r] && gameState.mapConfig.units[r][c] && gameState.mapConfig.units[r][c] !== 'XY') {
                    const unitCode = gameState.mapConfig.units[r][c];
                    const pieceName = UNIT_MAP[unitCode];
                    if (pieceName && PIECES[pieceName]) {
                        gameState.board[r][c] = { ...PIECES[pieceName], name: pieceName };
                    } else {
                        console.warn(`Unknown unit code ${unitCode} at [${r},${c}]`);
                    }
                }
            }
        }
    } else {
        // Fallback to layout if map doesn't define units
        puzzle.layout.forEach(p => {
            const [row, col] = p.pos;
            if (isValidSquare(row, col)) {
                gameState.board[row][col] = { ...PIECES[p.piece], name: p.piece };
            } else {
                console.warn(`Piece ${p.piece} at [${row},${col}] is out of bounds for an 8x8 board and was not placed.`);
            }
        });
    }

    // Setup game state
    gameState.movesLeft = puzzle.moves;
    gameState.selectedPiece = null;
    gameState.validMoves = [];

    // Update UI
    puzzleTitleEl.textContent = puzzle.name;
    puzzleObjectiveEl.textContent = puzzle.objective;
    updateMovesCounter();
    renderBoard();
}

function onSquareClick(event) {
    if (gameState.isGameOver) return;

    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const pieceOnTargetSquare = gameState.board[row][col];

    if (gameState.selectedPiece) {
        const { piece: selectedPieceData, row: fromRow, col: fromCol } = gameState.selectedPiece;

        const isAttack = gameState.validAttackMoves.some(m => m[0] === row && m[1] === col);
        const isMove = gameState.validMoves.some(m => m[0] === row && m[1] === col);

        if (isAttack && pieceOnTargetSquare && pieceOnTargetSquare.type === PIECE_TYPES.MONSTER) {
            executeAttack(gameState.selectedPiece, [row, col]);
        } else if (isMove && !pieceOnTargetSquare) {
            movePiece(gameState.selectedPiece, [row, col]);
        } else {
            deselectPiece();
            if (pieceOnTargetSquare && pieceOnTargetSquare.type === PIECE_TYPES.HERO) {
                selectPiece(row, col);
            }
        }
    } else if (pieceOnTargetSquare && pieceOnTargetSquare.type === PIECE_TYPES.HERO) {
        selectPiece(row, col);
    }
}

function selectPiece(row, col) {
    deselectPiece(); // Clear any previous selection
    const piece = gameState.board[row][col];
    if (!piece || piece.type !== PIECE_TYPES.HERO) return;

    gameState.selectedPiece = { row, col, piece };
    const pieceDefinition = PIECES[piece.name];

    // Get valid moves (movement to empty squares)
    let moveFunction;
    switch (pieceDefinition.moveStrategy) {
        case 'knight':
            moveFunction = getKnightMoves;
            break;
        case 'bishop': // Used by archer
            moveFunction = getBishopMoves;
            break;
        case 'king': // Used by warrior and ogre
            moveFunction = getKingMoves;
            break;
        case 'pawn': // Used by goblin
            moveFunction = getPawnMoves;
            break;
        case 'rook': // Used by orc
            moveFunction = getRookMoves;
            break;
        default:
            console.error('Unknown moveStrategy:', pieceDefinition.moveStrategy);
            gameState.validMoves = [];
            break;
    }

    if (moveFunction) {
        gameState.validMoves = moveFunction(row, col, gameState.board, pieceDefinition)
            .filter(move => !gameState.board[move[0]][move[1]]);
    } else {
        // Ensure validMoves is empty if no move function was found (already handled by default in switch)
        gameState.validMoves = [];
    }

    // Get valid attack moves (targeting enemy pieces within Attack_Range using hex distance)
    gameState.validAttackMoves = [];
    if (pieceDefinition.Attack_Range > 0) {
        const startCube = offsetToCube(row, col);
        const range = pieceDefinition.Attack_Range;

        for (let q = -range; q <= range; q++) {
            for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
                let s = -q - r;
                if (q === 0 && r === 0 && s === 0) continue; // Cannot attack self

                const targetCube = {q: startCube.q + q, r: startCube.r + r, s: startCube.s + s};
                const targetOffset = cubeToOffset(targetCube.q, targetCube.r, targetCube.s);
                const targetRow = targetOffset.row;
                const targetCol = targetOffset.col;

                if (isValidSquare(targetRow, targetCol)) {
                    const targetPiece = gameState.board[targetRow][targetCol];
                    if (targetPiece && targetPiece.type === PIECE_TYPES.MONSTER) {
                        gameState.validAttackMoves.push([targetRow, targetCol]);
                    }
                }
            }
        }
    }
    highlightValidMoves();
}

function deselectPiece() {
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    gameState.validAttackMoves = []; // Add this line
    renderBoard(); // Rerender to remove highlights
}

function movePiece(selected, toPos) {
    const { row: fromRow, col: fromCol } = selected;
    const [toRow, toCol] = toPos;

    // Move piece in the board state
    gameState.board[toRow][toCol] = selected.piece;
    gameState.board[fromRow][fromCol] = null;

    gameState.movesLeft--;
    updateMovesCounter();
    deselectPiece(); // This also triggers a rerender

    checkGameStatus();
}

function executeAttack(selectedAttacker, targetPos) {
    const [toRow, toCol] = targetPos;
    const targetPiece = gameState.board[toRow][toCol]; // Get the piece object from the board

    if (!targetPiece || targetPiece.type !== PIECE_TYPES.MONSTER) {
        console.error("Invalid target for attack:", targetPiece);
        deselectPiece();
        return;
    }

    // Ensure Health and Attack are numbers
    const attackerAttack = Number(selectedAttacker.piece.Attack);
    let targetHealth = Number(targetPiece.Health);

    if (isNaN(attackerAttack) || isNaN(targetHealth)) {
        console.error("Attack or Health is not a number", selectedAttacker.piece, targetPiece);
        deselectPiece();
        return;
    }

    targetHealth -= attackerAttack;
    targetPiece.Health = targetHealth; // Update health on the piece object on the board

    console.log(`${selectedAttacker.piece.name} attacks ${targetPiece.name} at [${toRow},${toCol}]. ${targetPiece.name} HP: ${targetPiece.Health}`);


    if (targetPiece.Health <= 0) {
        gameState.board[toRow][toCol] = null; // Remove monster from board
        console.log(`${targetPiece.name} defeated!`);
    }

    gameState.movesLeft--;
    updateMovesCounter();
    deselectPiece(); // This also triggers a rerender and clears valid moves/attacks
    checkGameStatus();
}

function checkGameStatus() {
    const monsters = gameState.board.flat().filter(p => p && p.type === PIECE_TYPES.MONSTER);

    if (monsters.length === 0) {
        // Win condition
        gameState.isGameOver = true;
        showModal('Victory!', `You have defeated all monsters with ${gameState.movesLeft} moves to spare.`);
    } else if (gameState.movesLeft <= 0) {
        // Lose condition
        gameState.isGameOver = true;
        showModal('Defeat', 'You ran out of moves. The monsters have overwhelmed you.');
    }
}

// --- Rendering & UI Updates ---

function renderBoard() {
    for (let row = 0; row < window.BOARD_HEIGHT; row++) {
        const rowEl = boardContainer.children[row];
        if (!rowEl) continue;
        for (let col = 0; col < window.BOARD_WIDTH; col++) {
            const squareEl = rowEl.children[col];
            if (!squareEl) continue;
            const piece = gameState.board[row][col];
            // Clear previous content
            squareEl.innerHTML = '';
            squareEl.classList.remove('selected');

            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.classList.add('piece');
                pieceEl.textContent = piece.icon;
                squareEl.appendChild(pieceEl);
            }
        }
    }
}

function highlightValidMoves() {
     renderBoard(); // Start with a clean board

    // Highlight selected piece
    if (gameState.selectedPiece) {
        const { row, col } = gameState.selectedPiece;
        const rowEl = boardContainer.children[row];
        if (rowEl) {
            const selectedSquare = rowEl.children[col];
            if (selectedSquare) { // Check if selectedSquare exists
                selectedSquare.classList.add('selected');
            }
        }
    }

    // Highlight valid moves (movement)
    gameState.validMoves.forEach(([r, c]) => {
        const rowEl = boardContainer.children[r];
        if (rowEl) {
            const square = rowEl.children[c];
            if (square) { // Check if square exists
                const highlightEl = document.createElement('div');
                highlightEl.classList.add('highlight'); // Blueish highlight for movement
                // Ensure highlight doesn't cover piece by inserting it first
                if (square.firstChild) {
                    square.insertBefore(highlightEl, square.firstChild);
                } else {
                    square.appendChild(highlightEl);
                }
            }
        }
    });

    // Highlight valid attack moves
    gameState.validAttackMoves.forEach(([r, c]) => {
        const rowEl = boardContainer.children[r];
        if (rowEl) {
            const square = rowEl.children[c];
            if (square) { // Check if square exists
                // If a square is both a move and an attack, the attack highlight will be on top
                // or you might want to merge them or give priority.
                // For now, let's add a separate attack highlight.
                // Remove existing non-attack highlight if present to avoid overlap issues
                const existingHighlight = square.querySelector('.highlight');
                if (existingHighlight) {
                    existingHighlight.remove();
                }

                const highlightEl = document.createElement('div');
                highlightEl.classList.add('highlight-attack'); // Reddish highlight for attacks
                // Ensure highlight doesn't cover piece by inserting it first
                if (square.firstChild) {
                    square.insertBefore(highlightEl, square.firstChild);
                } else {
                    square.appendChild(highlightEl);
                }
            }
        }
    });
}

function updateMovesCounter() {
    movesLeftEl.textContent = gameState.movesLeft;
}

function showModal(title, message) {
    modalTitle.textContent = title;

    const isLastPuzzle = gameState.currentPuzzleIndex >= PUZZLES.length - 1;
    const isVictory = title === 'Victory!';

    if (isVictory && !isLastPuzzle) {
        const nextPuzzleIndex = gameState.currentPuzzleIndex + 1;
        const levelCode = Object.keys(window.LEVEL_CODES).find(key => window.LEVEL_CODES[key] === nextPuzzleIndex);
        if (levelCode) {
            message += `\n\nThe code for the next level is: ${levelCode}`;
        }
    }

    modalMessage.textContent = message;
    modal.style.display = 'flex';
    const modalContent = modal.querySelector('.transform');
    setTimeout(() => {
         modalContent.classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Logic for the 'Next Puzzle' button
    modalNextButton.style.display = (isVictory && !isLastPuzzle) ? 'inline-block' : 'none';
}

function hideModal() {
    const modalContent = modal.querySelector('.transform');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// --- Event Listeners & Initialization ---

// --- Initial Load ---

function init() {
    boardContainer = document.getElementById('board-container');
    movesLeftEl = document.getElementById('moves-left');
    puzzleTitleEl = document.getElementById('puzzle-title');
    puzzleObjectiveEl = document.getElementById('puzzle-objective');
    resetButton = document.getElementById('reset-button');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalNextButton = document.getElementById('modal-next-button');
    modalCloseButton = document.getElementById('modal-close-button');

    PIECES = { ...window.HEROES, ...window.MONSTERS };

    boardWidthInput = document.getElementById('board-width-input');
    boardHeightInput = document.getElementById('board-height-input');
    applySizeButton = document.getElementById('apply-size-button');

    applySizeButton.addEventListener('click', () => {
        const newWidth = parseInt(boardWidthInput.value);
        const newHeight = parseInt(boardHeightInput.value);

        if (newWidth > 0 && newHeight > 0) {
            window.BOARD_WIDTH = newWidth;
            window.BOARD_HEIGHT = newHeight;
            // Create a default map for the new size
            gameState.mapConfig = window.createDefaultMap(newWidth, newHeight);
            createBoard();
            // We can't setup a puzzle because the pieces are hardcoded.
            // So we just create an empty board.
            gameState.board = Array(window.BOARD_HEIGHT).fill(null).map(() => Array(window.BOARD_WIDTH).fill(null));
            renderBoard();
        }
    });

    createBoard();

    const urlParams = new URLSearchParams(window.location.search);
    const levelParam = urlParams.get('level');
    let startingPuzzle = 0;

    if (levelParam && window.LEVEL_CODES && typeof window.LEVEL_CODES[levelParam.toUpperCase()] !== 'undefined') {
        const level = window.LEVEL_CODES[levelParam.toUpperCase()];
        if (level >= 0 && level < PUZZLES.length) {
            startingPuzzle = level;
        }
    }

    setupPuzzle(startingPuzzle);

    resetButton.addEventListener('click', () => setupPuzzle(gameState.currentPuzzleIndex));

    modalCloseButton.addEventListener('click', hideModal);
    modalNextButton.addEventListener('click', () => {
        hideModal();
        const nextPuzzleIndex = gameState.currentPuzzleIndex + 1;
        if (nextPuzzleIndex < PUZZLES.length) {
            setupPuzzle(nextPuzzleIndex);
        }
    });
}

init();
