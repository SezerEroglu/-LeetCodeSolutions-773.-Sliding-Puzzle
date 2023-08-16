/**
 * @param {number[][]} board
 * @return {number}
 */

var generateRandomPuzzle = function () {

    const defaultPuzzle = [[1, 2, 3], [4, 5, 0]];
    var shuffleCount = Math.floor(Math.random() * 200 + 1);
    var currentPuzzle = [[...defaultPuzzle[0]], [...defaultPuzzle[1]]];

    for (let i = 0; i < shuffleCount; i++) {
        var moves = [...findPossibleMoves(currentPuzzle)]
        var move = moves[Math.floor(Math.random() * (moves.length))];
        currentPuzzle = makeMove(currentPuzzle, move)
    }
    return currentPuzzle;
}

var generateMaybeUn

var findPossibleMoves = function (board = []) {
    var dimesions = { i: board.length - 1, j: board[0].length - 1 };
    var poz = findZeroPosition(board);
    var defaultMoves = [{ i: -1, j: 0 } /* Up */, { i: 1, j: 0 } /* Down */, { i: 0, j: -1 } /* Left */, { i: 0, j: 1 } /* Right */];
    if (poz.j == dimesions.j) defaultMoves.splice(3, 1); // Remove Right
    if (poz.j == 0) defaultMoves.splice(2, 1); // Remove Left
    if (poz.i == dimesions.i) defaultMoves.splice(1, 1); // Remove Down
    if (poz.i == 0) defaultMoves.splice(0, 1); // Remove up

    return defaultMoves
}

var checkIfSorted = function (board = []) {
    var list = [];
    if (board[board.length - 1][board[0].length - 1] !== 0) return false;
    for (let i = 1; i < board.length; i++) {
        if (board[i - 1][0] > board[i][0]) return false;
    }

    for (let i = 0; i < board.length; i++) {
        list = list.concat(board[i])
    }
    for (let i = 1; i < list.length - 1; i++) {
        if (list[i - 1] > list[i]) return false;

    }

    return true;

}

var makeMove = function (board = [], move = { i, j }) {
    var poz = findZeroPosition(board);
    var tempBoard = [[...board[0],], [...board[1]]]
    var temp = tempBoard[poz.i + move.i][poz.j + move.j];
    tempBoard[poz.i][poz.j] = temp;
    tempBoard[poz.i + move.i][poz.j + move.j] = 0;
    return tempBoard
}

var findZeroPosition = function (board = []) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 0) return { i: i, j: j }
        }
    }
}

var calculateHeuristic = function (board) {
    let heuristic = 0;
    var target = [[1, 2, 3], [4, 5, 0]];

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const value = board[i][j];
            if (value !== 0) {
                const targetPosition = findValuePosition(value, target);
                heuristic += Math.abs(i - targetPosition.row) + Math.abs(j - targetPosition.col);

                if (i === targetPosition.row) {
                    for (let k = j + 1; k < board[i].length; k++) {
                        const otherValue = board[i][k];
                        if (otherValue !== 0) {
                            const otherTargetPosition = findValuePosition(otherValue, target);
                            if (otherTargetPosition.row === i && otherTargetPosition.col < j) {
                                heuristic += 2; // Linear conflict in the same row
                            }
                        }
                    }
                }

                if (j === targetPosition.col) {
                    for (let k = i + 1; k < board.length; k++) {
                        const otherValue = board[k][j];
                        if (otherValue !== 0) {
                            const otherTargetPosition = findValuePosition(otherValue, target);
                            if (otherTargetPosition.col === j && otherTargetPosition.row < i) {
                                heuristic += 2; // Linear conflict in the same column
                            }
                        }
                    }
                }
            }
        }
    }

    return heuristic;
}

var findValuePosition = function (value, board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === value) {
                return { row: i, col: j };
            }
        }
    }
}

var searchInversedDir = function (dirs, move = { i, j }) {
    if (!dirs || dirs.length === 0) return false
    var lastDir = dirs[dirs.length - 1];
    if (lastDir.i === -move.i && lastDir.j === -move.j) return true
    return false
}

var findPatternInPath = function (path, currentState) {
    for (let i = 0; i < path.length; i++) {
        var match = true;
        for (let j = 0; j < path[i].length; j++) {
            for (let k = 0; k < path[i][j].length; k++) {
                if (path[i][j][k] !== currentState[j][k]) match = false
            }

        }
        if (match) return true
    }
}

var checkIfSolvable = function (board = []) {
    var tempBoard = [[...board[0]], [...board[1]]];
    var numberOfCrosses = 0;
    for (let i = 0; i < board.length; i++) {
        tempBoard = tempBoard.concat(board[i])
    }
    for (let i = 0; i < tempBoard.length; i++) {
        if (tempBoard[i] === 0) continue
        for (let j = i + 1; j < tempBoard.length; j++) {
            if (tempBoard[j] === 0) continue
            if (tempBoard[i] > tempBoard[j]) numberOfCrosses += 1

        }

    }
    if ((numberOfCrosses) % 2 !== 0) return false
    return true;

}

var printState = function (currentState = [], f, depth, min) {

    for (let i = 0; i < currentState.length; i++) {
        const row = currentState[i].join(' ');
        console.log(row);
    }

    console.log(`----- f value: ${f} depth: ${depth} min: ${min || "min not calculated"}`)
}

var search = function (path = [], g, bound, dirs = []) {
    var currentState = path[path.length - 1];
    var f = g + calculateHeuristic(currentState)

    if (f > bound) {
        console.log("bound exceeded. f: " + f)
        return f
    }
    if (checkIfSorted(currentState))
        return true
    var min = Infinity;

    var moves = [...findPossibleMoves(currentState)]

    for (let i = 0; i < moves.length; i++) {
        var move = moves[i];
        if (searchInversedDir(dirs, move)) continue;
        var nextState = [...makeMove(currentState, move)]
        if (findPatternInPath(path, nextState)) continue;

        path.push(nextState);
        dirs.push(move);

        t = search(path, g + 1, bound, dirs);

        if (t === true) return true

        if (t < min) min = t

        path.pop();
        dirs.pop();

    }
    return min;

}

var slidingPuzzle = function (board = []) {
    if (!checkIfSolvable(board)) return -1
    if (checkIfSorted(board)) return []
    bound = calculateHeuristic(board);
    path = [board];
    dirs = [];
    while (true) {
        rem = search(path, 0, bound, dirs);
        if (rem === true) {
            return dirs
        } else if (rem === Infinity) {
            return -1
        }
        bound = rem;
    }
};


const randomPuzzle = generateRandomPuzzle();
console.log("Random Puzzle:", randomPuzzle);

// var randomPuzzle = [[3, 0, 1], [4, 2, 5]]
var solution = slidingPuzzle(randomPuzzle);


if (solution !== -1) {
    console.log(`Puzzle is solved!! \n Original puzzle: \n ${randomPuzzle}`)
    solution.forEach(dir => {
        console.log(JSON.stringify(dir))
    });
} else {
    console.log("Puzzle can not be solved.")
}


