const boardContainer = document.getElementById('board-container');
const movesLeftEl = document.getElementById('moves-left');
const puzzleTitleEl = document.getElementById('puzzle-title');
const puzzleObjectiveEl = document.getElementById('puzzle-objective');
const resetButton = document.getElementById('reset-button');
const puzzleSelect = document.getElementById('puzzle-select');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalNextButton = document.getElementById('modal-next-button');
const modalCloseButton = document.getElementById('modal-close-button');

const PIECES = { ...window.HEROES, ...window.MONSTERS };

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
    return getSlidingMoves(row, col, directions, board, piece.range || 8);
}

function getRookMoves(row, col, board, piece) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return getSlidingMoves(row, col, directions, board, piece.range || 8);
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
    const piece = gameState.board[row][col];

    if (gameState.selectedPiece) {
        const isValidMove = gameState.validMoves.some(m => m[0] === row && m[1] === col);
        if (isValidMove) {
            movePiece(gameState.selectedPiece, [row, col]);
        } else {
            deselectPiece();
            // If player clicks another of their own pieces, select it
            if (piece && piece.type === PIECE_TYPES.HERO) {
                 selectPiece(row, col);
            }
        }
    } else if (piece && piece.type === PIECE_TYPES.HERO) {
        selectPiece(row, col);
    }
}

function selectPiece(row, col) {
    deselectPiece(); // Clear any previous selection
    const piece = gameState.board[row][col];
    if (!piece || piece.type !== PIECE_TYPES.HERO) return;

    gameState.selectedPiece = { row, col, piece };
    const pieceDefinition = PIECES[piece.name];
    gameState.validMoves = pieceDefinition.moves(row, col, gameState.board, pieceDefinition);

    highlightValidMoves();
}

function deselectPiece() {
    gameState.selectedPiece = null;
    gameState.validMoves = [];
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
    const { row, col } = gameState.selectedPiece;
    const selectedSquare = boardContainer.children[row * 8 + col];
    selectedSquare.classList.add('selected');

    // Highlight valid moves
    gameState.validMoves.forEach(([r, c]) => {
        const square = boardContainer.children[r * 8 + c];
        const highlightEl = document.createElement('div');
        highlightEl.classList.add('highlight');
        // Ensure highlight doesn't cover piece by inserting it first
        if (square.firstChild) {
            square.insertBefore(highlightEl, square.firstChild);
        } else {
            square.appendChild(highlightEl);
        }
    });
}

function updateMovesCounter() {
    movesLeftEl.textContent = gameState.movesLeft;
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
    createBoard();
    populatePuzzleSelect();
    setupPuzzle(0);
}

init();
