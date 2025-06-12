let boardContainer;
let movesLeftEl;
let puzzleTitleEl;
let puzzleObjectiveEl;
let resetButton;
let puzzleSelect;
let modal;
let modalTitle;
let modalMessage;
let modalNextButton;
let modalCloseButton;

let PIECES = {};

const PUZZLES = [
    {
        name: "Knight's Charge",
        objective: "Capture the Goblin.",
        moves: 3,
        layout: [
            { piece: 'knight', pos: [7, 1] },
            { piece: 'goblin', pos: [5, 2] }
        ]
    },
    {
        name: "Archer's Perch",
        objective: "Eliminate the Orc and Ogre.",
        moves: 4,
        layout: [
            { piece: 'archer', pos: [7, 0] },
            { piece: 'orc', pos: [4, 3] },
            { piece: 'ogre', pos: [1, 6] }
        ]
    },
    {
        name: "Warrior's Stand",
        objective: "Defeat the mighty Ogre.",
        moves: 5,
        layout: [
            { piece: 'warrior', pos: [4, 4] },
            { piece: 'ogre', pos: [1, 1] },
            { piece: 'goblin', pos: [3, 2] },
            { piece: 'goblin', pos: [3, 6] },
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
    isGameOver: false
};

// --- Piece Movement Logic ---

function getKnightMoves(row, col, board) {
    const moves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    return getValidMovesFromOffsets(row, col, moves, board);
}

function getKingMoves(row, col, board) {
    const moves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    return getValidMovesFromOffsets(row, col, moves, board);
}

function getPawnMoves(row, col, board) {
    // Goblins (pawns) move one step forward (towards lower row index)
     const moves = [[-1, 0]];
     let validMoves = [];
     for (const [dr, dc] of moves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if(isValidSquare(newRow, newCol) && !board[newRow][newCol]) {
            validMoves.push([newRow, newCol]);
        }
     }
     // Capture moves
     const captureMoves = [[-1, -1], [-1, 1]];
     for (const [dr, dc] of captureMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if(isValidSquare(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol].type === PIECE_TYPES.HERO) {
            validMoves.push([newRow, newCol]);
        }
     }
     return validMoves;
}

function getSlidingMoves(row, col, directions, board, range) {
    let moves = [];
    const pieceType = board[row][col].type;

    for (const [dr, dc] of directions) {
        for (let i = 1; i <= range; i++) {
            const newRow = row + i * dr;
            const newCol = col + i * dc;

            if (!isValidSquare(newRow, newCol)) break;

            const targetSquare = board[newRow][newCol];
            if (targetSquare) {
                if (targetSquare.type !== pieceType) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
            moves.push([newRow, newCol]);
        }
    }
    return moves;
}

function getBishopMoves(row, col, board, piece) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    // Use piece.Move for movement range
    return getSlidingMoves(row, col, directions, board, piece.Move);
}

function getRookMoves(row, col, board, piece) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    // Use piece.Move for movement range
    return getSlidingMoves(row, col, directions, board, piece.Move);
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
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}


// --- Game Flow & State Management ---

function createBoard() {
    boardContainer.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            // The event listener is on the square, which is crucial
            square.addEventListener('click', onSquareClick);
            boardContainer.appendChild(square);
        }
    }
}

function setupPuzzle(puzzleIndex) {
    gameState.isGameOver = false;
    gameState.currentPuzzleIndex = puzzleIndex;
    const puzzle = PUZZLES[puzzleIndex];

    // Setup board state
    gameState.board = Array(8).fill(null).map(() => Array(8).fill(null));
    puzzle.layout.forEach(p => {
        const [row, col] = p.pos;
        gameState.board[row][col] = { ...PIECES[p.piece], name: p.piece };
    });

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
    gameState.validMoves = pieceDefinition.moves(row, col, gameState.board, pieceDefinition)
        .filter(move => !gameState.board[move[0]][move[1]]); // Ensure target square is empty for movement

    // Get valid attack moves (targeting enemy pieces within Attack_Range)
    gameState.validAttackMoves = [];
    if (pieceDefinition.Attack_Range > 0) {
        for (let r_offset = -pieceDefinition.Attack_Range; r_offset <= pieceDefinition.Attack_Range; r_offset++) {
            for (let c_offset = -pieceDefinition.Attack_Range; c_offset <= pieceDefinition.Attack_Range; c_offset++) {
                if (r_offset === 0 && c_offset === 0) continue; // Cannot attack self

                // Allow attacks only within a square (Manhattan distance) for now for simplicity with Attack_Range
                // This means Attack_Range = 1 is adjacent squares (including diagonals)
                // Attack_Range = 2 is squares up to 2 units away, etc.
                if (Math.abs(r_offset) + Math.abs(c_offset) > pieceDefinition.Attack_Range) continue;


                const targetRow = row + r_offset;
                const targetCol = col + c_offset;

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
    const squares = boardContainer.children;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareEl = squares[row * 8 + col];
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
        const selectedSquare = boardContainer.children[row * 8 + col];
        if (selectedSquare) { // Check if selectedSquare exists
            selectedSquare.classList.add('selected');
        }
    }

    // Highlight valid moves (movement)
    gameState.validMoves.forEach(([r, c]) => {
        const square = boardContainer.children[r * 8 + c];
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
    });

    // Highlight valid attack moves
    gameState.validAttackMoves.forEach(([r, c]) => {
        const square = boardContainer.children[r * 8 + c];
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
    });
}

function updateMovesCounter() {
   console.log('updateMovesCounter called. movesLeftEl:', movesLeftEl);
   console.log('gameState.movesLeft:', gameState.movesLeft);
    movesLeftEl.textContent = gameState.movesLeft;
   console.log('movesLeftEl.textContent after update:', movesLeftEl ? movesLeftEl.textContent : 'movesLeftEl is null');
}

function populatePuzzleSelect() {
     PUZZLES.forEach((puzzle, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = puzzle.name;
        puzzleSelect.appendChild(option);
     });
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    const modalContent = modal.querySelector('.transform');
    setTimeout(() => {
         modalContent.classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Logic for the 'Next Puzzle' button
    const isLastPuzzle = gameState.currentPuzzleIndex >= PUZZLES.length - 1;
    modalNextButton.style.display = (title === 'Victory!' && !isLastPuzzle) ? 'inline-block' : 'none';
}

function hideModal() {
    const modalContent = modal.querySelector('.transform');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// --- Event Listeners & Initialization ---

resetButton.addEventListener('click', () => setupPuzzle(gameState.currentPuzzleIndex));
puzzleSelect.addEventListener('change', (e) => setupPuzzle(parseInt(e.target.value)));

modalCloseButton.addEventListener('click', hideModal);
modalNextButton.addEventListener('click', () => {
    hideModal();
    const nextPuzzleIndex = gameState.currentPuzzleIndex + 1;
    if (nextPuzzleIndex < PUZZLES.length) {
        puzzleSelect.value = nextPuzzleIndex;
        setupPuzzle(nextPuzzleIndex);
    }
});

// --- Initial Load ---

function init() {
    boardContainer = document.getElementById('board-container');
    movesLeftEl = document.getElementById('moves-left');
    puzzleTitleEl = document.getElementById('puzzle-title');
    puzzleObjectiveEl = document.getElementById('puzzle-objective');
    resetButton = document.getElementById('reset-button');
    puzzleSelect = document.getElementById('puzzle-select');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalNextButton = document.getElementById('modal-next-button');
    modalCloseButton = document.getElementById('modal-close-button');

    PIECES = { ...window.HEROES, ...window.MONSTERS };
    createBoard();
    populatePuzzleSelect();
    setupPuzzle(0);
}

init();
