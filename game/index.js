const cloneDeep = require('clone-deep')
const columnify = require('columnify')
const BPromise = require('bluebird')
const chalk = require('chalk')
const prompt = BPromise.promisifyAll(require('prompt'))

const {
  GetRandomInt,
  Minimax,
  CheckWinCondition,
  CheckDrawCondition,
  Move,
  GetRemainingMoves,
  SaveScore,
  ValidateYesNo,
  ConvertYNtoTrueFalse,
  GetUnixTime,
  ToIntZeroBase
} = require('./utils')

const {
  tiles,
  avatarInfo,
  defaultBoardState
} = require('../globals')
const { PLAYER, COMP } = tiles

let turn
let boardState
let startTime
let movesCount

/**
 * Public method for starting a game
 *
 * @promise
 */
function NewGame () {
  prompt.message = ''
  prompt.delimiter = ''
  prompt.start()

  return Start()
}

/**
 * Private method for starting an new game. Resets all current data
 *
 * @promise
 */
function Start () {
  // Randomly Select Turn
  turn = GetRandomInt(PLAYER, COMP)

  // Reset game data
  boardState = cloneDeep(defaultBoardState)
  startTime = GetUnixTime()
  movesCount = 0

  // Display the initial game board
  DisplayBoard()

  // Announce who goes first
  console.log(`${chalk[avatarInfo[turn].color](avatarInfo[turn].name)} goes first!`)

  return NextTick()
}

/**
 * Advances the game by a single frame. Because this is a simple turn based game,
 * we do not use a typical game loop that runs at a constant 60 frames per second.
 *
 * @promise
 */
function NextTick () {
  // Start off an async chain to make error handling and async ops cleaner
  return BPromise.resolve()
    .then(() => {
      // Who's turn is it?
      if (turn === COMP) {
        return HandleComputerMove()
      } else {
        return HandlePlayerMove()
      }
    })
    .then(move => {
      // A move was made so lets keep track of that
      movesCount++

      // Let display the updated board to the user
      DisplayBoard()

      // Lets also display in text the move the current player just made
      console.log(
        `${avatarInfo[turn].name} placed ${avatarInfo[turn].avatar} at position ${chalk.magenta(`(${move.y + 1}, ${move.x + 1})`)}`
      )

      // Check for a win condition
      if (CheckWinCondition(move, turn, boardState)) {
        console.log(chalk.green(`${chalk.bold(avatarInfo[turn].name)} Wins!`))

        // If its the player who wins, show their score
        if (turn === PLAYER) {
          return ShowScore(CalculateScore())
        }
        // Otherwise just offer to play again
        return PlayAgain()
      }

      // Is this game a draw?
      if (CheckDrawCondition(movesCount)) {
        console.log(chalk.magenta('Game is a Draw.'))
        return PlayAgain()
      }

      // Change to the next player
      ToggleTurn()

      // Advance to the next frame
      return NextTick()
    })
}

/**
 * Swaps whos turn it currently is
 *
 */
function ToggleTurn () {
  if (turn === PLAYER) {
    turn = COMP
  } else {
    turn = PLAYER
  }

  console.log(`${chalk[avatarInfo[turn].color].bold(`${avatarInfo[turn].name}'s`)} turn!`)
}

/**
 * This method handles the Players input and updating the board state
 *
 * @promise   {Object} The move the player made
 */
function HandlePlayerMove () {
  // Get the remaing moves so we can do some basic input validation
  const remainingMoves = GetRemainingMoves(boardState)

  // Send out the prompts and wait for input
  return prompt.getAsync([{
    name: 'row',
    description: 'Enter Row:',
    required: true,
    // 0-base the value and force to int
    before: ToIntZeroBase,
    // Valide the input agains the available moves
    conform (val) {
      const normalized = ToIntZeroBase(val)
      let isValid = false
      remainingMoves.forEach(move => {
        if (move.y === normalized) {
          isValid = true
        }
      })
      return isValid
    },
    message: 'Invalid Row given. Try again.'
  }, {
    name: 'col',
    description: 'Enter Column:',
    required: true,
    // 0-base the value and force to int
    before: ToIntZeroBase,
    // Valide the input agains the available moves
    conform (val) {
      const normalized = ToIntZeroBase(val)
      const row = prompt.history('row').value // also grab previous value to use
      let isValid = false
      remainingMoves.forEach(move => {
        if (move.y === row && move.x === normalized) {
          isValid = true
        }
      })
      return isValid
    },
    message: 'Invalid Row Column combination given. Try again.'
  }])
  .then(res => {
    // Generate our move object and perform the state change
    const move = { x: res.col, y: res.row }
    boardState = Move(move, PLAYER, boardState)
    return move
  })
}

/**
 * Handle how the computer determines its next move and then update the board state
 *
 * @promise   {Object}  The move the computer made
 */
function HandleComputerMove () {
  // Should make the computer make a mistake?
  if (GetRandomInt(0, 1) === 0) {
    // Randomly get a move from the available moves list
    const remainingMoves = GetRemainingMoves(boardState)
    const badMove = remainingMoves[GetRandomInt(0, remainingMoves.length - 1)]
    boardState = Move(badMove, COMP, boardState)
    return badMove
  }
  // Otherwise calcule the best possible move and make that move
  const bestMove = Minimax(null, PLAYER, boardState, 0)
  boardState = Move(bestMove.move, COMP, boardState)
  return bestMove.move
}

/**
 * Serialized the board state into a nice console display version
 *
 */
function DisplayBoard () {
  // Format the board state into a presentable state
  let diplayBoard = boardState.map(row => {
    return row.map(col => {
      const info = avatarInfo[col]
      return chalk[info.color](info.avatar)
    })
  })

  // Add in board dividers
  diplayBoard.splice(2, 0, [chalk.cyan('-'), chalk.cyan('-'), chalk.cyan('-')])
  diplayBoard.splice(1, 0, [chalk.cyan('-'), chalk.cyan('-'), chalk.cyan('-')])
  diplayBoard = diplayBoard.map(row => {
    row.splice(2, 0, chalk.cyan('|'))
    row.splice(1, 0, chalk.cyan('|'))
    return row
  })

  // Print our the current board state
  console.log(`\n`)
  console.log(columnify(diplayBoard, { showHeaders: false }))
  console.log(`\n`)
}

/**
 * The algorithm for generating the players score. Its based on whose the winner,
 * the number of moves required to win, and how long the game lasted.
 *
 * @return    {Number} The players total score
 */
function CalculateScore () {
  // Calculate number of points for move count
  const movePoints = (9 - movesCount) * 100

  // Calculate number of points for game time length
  const timePoints = 20000 / (GetUnixTime() - startTime)

  // Calcule winner points
  const winnerPoints = 1000

  return Math.round(movePoints + timePoints + winnerPoints)
}

/**
 * Displays the users score in the console and offers to save it
 * @param       {Number} score  The users total score
 *
 * @promise
 */
function ShowScore (score) {
  // Displays the users score
  console.log(chalk.green(`You scored ${chalk.underline(score)}`))

  // Offer to save the users score
  console.log(`Do you wish to save your score?`)
  return prompt.getAsync([{
    name: 'save',
    description: 'Save Score (Y/N)?',
    type: 'string',
    required: true,
    message: 'Invalid response!',
    conform: ValidateYesNo,
    before: ConvertYNtoTrueFalse
  }])
  .then(res => {
    if (res.save) {
      return SaveScore(score)
    }
  })
  // Allow the player to play again
  .then(() => PlayAgain())
}

/**
 * Asks the player if they would like to play again
 *
 * @promise
 */
function PlayAgain () {
  console.log('Do you want to play again?')
  return prompt.getAsync([{
    name: 'again',
    description: 'Play Again (Y/N)?',
    type: 'string',
    required: true,
    message: 'Invalid response!',
    conform: ValidateYesNo,
    before: ConvertYNtoTrueFalse
  }])
    .then(res => {
      if (res.again) {
        return Start()
      }
    })
}

module.exports = {
  NewGame
}
