const cloneDeep = require('clone-deep')
const BPromise = require('bluebird')
const jsonfile = BPromise.promisifyAll(require('jsonfile'))
const prompt = BPromise.promisifyAll(require('prompt'))
const { ShowHighScores } = require('./high-scores')
const {
  tiles,
  highScoreFileLocation
} = require('../globals')

const { PLAYER, COMP } = tiles

/**
 * Helper method for getting a random int between 2 ints
 * @param       {Number} min Min value inclusive
 * @param       {Number} max Max value inclusive
 *
 * @return      {Number} a new random number
 */
function GetRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

/**
 * Determins the best move the computer can make
 * @param       {Object} move         The previous move made (if one exists)
 * @param       {Number} player       The person who made the previous move
 * @param       {2DArray} boardState  The current board state
 * @param       {Number} depth        Current recusion depth
 * @constructor
 */
function Minimax (move, player, boardState, depth) {
  // Did someone win?
  if (move && CheckWinCondition(move, player, boardState)) {
    // Player wins?
    if (player === PLAYER) {
      return { score: -10 - depth, move }
    }
    // Computer wins?
    return { score: 10 + depth, move }
  }

  const moves = GetRemainingMoves(boardState)
  // Was it a Draw?
  if (CheckDrawCondition(9 - moves.length)) {
    return { score: 0, move }
  }

  // Swap the current player to simulate the next move in the game
  let opponent = COMP
  if (player === COMP) {
    opponent = PLAYER
  }

  // Simuilate/look for the best move the player can make
  const scores = moves.map((move) => {
    const possibleBoardState = Move(move, opponent, cloneDeep(boardState))
    return Minimax(move, opponent, possibleBoardState, depth + 1)
  })

  // After all moves have been discovered, determin the best move based on
  // the movement score
  let bestMove
  // if its the player moving we want to chose the lowest score
  if (player === PLAYER) {
    let bestScore = 10000
    moves.forEach((move, i) => {
      if (scores[i].score < bestScore) {
        bestScore = scores[i].score
        bestMove = scores[i]
      }
    })
  } else {
    // if its the computer moving, we want to chose the highest score
    let bestScore = -10000
    moves.forEach((move, i) => {
      if (scores[i].score > bestScore) {
        bestScore = scores[i].score
        bestMove = scores[i]
      }
    })
  }
  return bestMove
}

/**
 * Determine what moves are still available to be made
 * @param       {2DArray} boardState The current state of the board
 *
 * @return    {Array<Object>} Returns a list of all remaining moves
 */
function GetRemainingMoves (boardState) {
  const remaingMoves = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (boardState[j][i] === 0) {
        remaingMoves.push({ x: i, y: j })
      }
    }
  }
  return remaingMoves
}

/**
 * Updates the board state with the new players chosen move
 * @param       {Object} location     The players chosen location
 * @param       {Number} player       The players ID
 * @param       {2DArray} boardState  The current state of the board
 *
 * @return      {2DArray} Update state of the board
 */
function Move (location, player, boardState) {
  if (boardState[location.y][location.x] === 0) {
    boardState[location.y][location.x] = player
  }
  return boardState
}

/**
 * Checks the given grid square to see if its the correct type, if so then
 * recurses deeper to max depth
 * @param       {Object}  location    The x/y location to check win condition from
 * @param       {Number}  player      The player Id to look for
 * @param       {2DArray} boardState  The current state of the board
 *
 * @return      {Bool}    True if current player has won
 */
function CheckWinCondition (location, player, boardState) {
  // check col
  for (let i = 0; i < 3; i++) {
    if (boardState[i][location.x] !== player) {
      break
    }
    if (i === 3 - 1) {
      return true
    }
  }

  // check row
  for (let i = 0; i < 3; i++) {
    if (boardState[location.y][i] !== player) {
      break
    }
    if (i === 3 - 1) {
      return true
    }
  }

  // check diag
  if (location.x === location.y) {
      // we're on a diagonal
    for (let i = 0; i < 3; i++) {
      if (boardState[i][i] !== player) {
        break
      }
      if (i === 3 - 1) {
        return true
      }
    }
  }

  // check anti diag (thanks rampion)
  if (location.x + location.y === 3 - 1) {
    for (let i = 0; i < 3; i++) {
      if (boardState[i][(3 - 1) - i] !== player) {
        break
      }
      if (i === 3 - 1) {
        return true
      }
    }
  }

  return false
}

/**
 * Checks to see if a draw condition has occurred
 * @param       {Number} moves The total number of moves that have been made so far
 *
 * @return      {Bool} True if draw condition met
 */
function CheckDrawCondition (moves) {
  return moves === Math.pow(3, 2)
}

/**
 * Prompts the player for a 3 letter arcade style name and saves it to the json file
 * @param       {Number} score The players current score
 *
 * @promise
 */
function SaveScore (score) {
  return BPromise.props({
    prompt: prompt.getAsync([{
      name: 'name',
      description: 'Your 3 letter arcade name: ',
      type: 'string',
      required: true,
      before (val) {
        return val.toUpperCase()
      },
      conform (val) {
        return val.length === 3
      },
      message: 'Invalid Name Given. Please provide only 3 letter/numbers/symbols.'
    }]),
    json: jsonfile.readFileAsync(highScoreFileLocation)
  })
    .then(res => {
      res.json.scores.push({
        name: res.prompt.name,
        score: score
      })
      return jsonfile.writeFile(highScoreFileLocation, res.json)
    })
    .then(() => {
      console.log('\n')
      return ShowHighScores()
    })
}

/**
 * Helper method for validating a Y/N Yes/No text input
 * @param       {String} val The input
 *
 * @return      {Bool}  True if valid
 */
function ValidateYesNo (val) {
  const normalized = val.toLowerCase()
  if (normalized.length && (normalized[0] === 'y' || normalized[0] === 'n')) {
    return true
  }
  return false
}

/**
 * Converts a  Y/N or Yes/No input to true/false
 * @param       {String} val The input value
 *
 * @return      {Bool} The result
 */
function ConvertYNtoTrueFalse (val) {
  const normalized = val.toLowerCase()
  if (normalized[0] === 'y') {
    return true
  }
  return false
}

/**
 * Gets the current time in Unix (seconds from epoch)
 *
 * @return    {Number} Seconds from Epoch
 */
function GetUnixTime () {
  return (new Date()).getTime() / 1000 | 0
}

/**
 * Converts a 1 based float value to a 0-based int value
 * @param       {Number} val 1-based float value
 *
 * @return      {Number} 0-based int value
 */
function ToIntZeroBase (val) {
  return Math.floor(parseFloat(val) - 1)
}

module.exports = {
  GetRandomInt,
  CheckWinCondition,
  CheckDrawCondition,
  Minimax,
  Move,
  GetRemainingMoves,
  SaveScore,
  ValidateYesNo,
  ConvertYNtoTrueFalse,
  GetUnixTime,
  ToIntZeroBase
}
