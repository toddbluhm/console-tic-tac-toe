const assert = require('better-assert')
const { describe, it } = require('mocha')
const {
  GetRandomInt,
  Minimax,
  GetRemainingMoves,
  Move,
  CheckWinCondition,
  CheckDrawCondition,
  ValidateYesNo,
  ConvertYNtoTrueFalse,
  ToIntZeroBase
} = require('../../game/utils')

describe('game/utils', function () {
  describe('GetRandomInt', function () {
    it('should get a random int between the 4 & 6', function () {
      const val = GetRandomInt(4, 5)
      assert(val >= 4)
      assert(val <= 6)
      assert(parseInt(val, 10) === val)
    })
  })

  describe('Minimax', function () {
    it('should return the best move to make', function () {
      const boardState = [[2, 2, 0], [0, 0, 0], [0, 0, 0]]
      const move = Minimax(null, 1, boardState, 0)
      assert(move.move.x === 2)
      assert(move.move.y === 0)
      assert(move.score === 11)
    })

    it('should return the best move to make', function () {
      const boardState = [[2, 0, 0], [0, 2, 0], [0, 0, 0]]
      const move = Minimax(null, 1, boardState, 0)
      assert(move.move.x === 2)
      assert(move.move.y === 2)
      assert(move.score === 11)
    })

    it('should return the best move to make', function () {
      const boardState = [[2, 0, 0], [0, 2, 1], [0, 0, 1]]
      const move = Minimax(null, 1, boardState, 0)
      assert(move.move.x === 2)
      assert(move.move.y === 0)
      assert(move.score === 0)
    })
  })

  describe('GetRemainingMoves', function () {
    it('should get all possible remaining moves on the board', function () {
      const moves = GetRemainingMoves([[2, 2, 2], [2, 2, 2], [2, 2, 0]])
      assert(moves.length === 1)
      assert(moves[0].x === 2)
      assert(moves[0].y === 2)
    })
    it('should get all possible remaining moves on the board', function () {
      const moves = GetRemainingMoves([[0, 0, 2], [2, 0, 2], [2, 2, 0]])
      assert(moves.length === 4)
    })
  })

  describe('Move', function () {
    it('should update the board state with the given move and player Id', function () {
      const board = Move({x: 1, y: 1}, 2, [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
      assert(board[0][0] === 0)
      assert(board[0][1] === 0)
      assert(board[0][2] === 0)
      assert(board[1][0] === 0)
      assert(board[1][2] === 0)
      assert(board[2][0] === 0)
      assert(board[2][1] === 0)
      assert(board[2][2] === 0)
      assert(board[1][1] === 2)
    })
  })

  describe('Move', function () {
    it('should update the board state with the given move and player Id', function () {
      const board = Move({x: 1, y: 1}, 2, [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
      assert(board[0][0] === 0)
      assert(board[0][1] === 0)
      assert(board[0][2] === 0)
      assert(board[1][0] === 0)
      assert(board[1][2] === 0)
      assert(board[2][0] === 0)
      assert(board[2][1] === 0)
      assert(board[2][2] === 0)
      assert(board[1][1] === 2)
    })
  })

  describe('CheckWinCondition', function () {
    it('should return true if winning by row', function () {
      const boardState = [[2, 2, 2], [0, 0, 0], [0, 0, 0]]

      assert(CheckWinCondition({ x: 1, y: 0 }, 2, boardState) === true)
    })

    it('should return true if winning by col', function () {
      const boardState = [[2, 0, 0], [2, 0, 0], [2, 0, 0]]

      assert(CheckWinCondition({ x: 0, y: 2 }, 2, boardState) === true)
    })

    it('should return true if winning by diagonal', function () {
      const boardState = [[2, 0, 0], [0, 2, 0], [0, 0, 2]]

      assert(CheckWinCondition({ x: 1, y: 1 }, 2, boardState) === true)
    })

    it('should return true if winning by anti-diagonal', function () {
      const boardState = [[0, 0, 2], [0, 2, 0], [2, 0, 0]]

      assert(CheckWinCondition({ x: 0, y: 2 }, 2, boardState) === true)
    })

    it('should return false if NO win condition found', function () {
      const boardState = [[0, 0, 2], [0, 0, 0], [2, 0, 0]]

      assert(CheckWinCondition({ x: 0, y: 2 }, 2, boardState) === false)
    })
  })

  describe('CheckDrawCondition', function () {
    it('should return true if draw condition met', function () {
      assert(CheckDrawCondition(9) === true)
    })

    it('should return false if draw condition NOT met', function () {
      assert(CheckDrawCondition(7) === false)
    })
  })

  describe('ValidateYesNo', function () {
    it('should return true if string is "Y"', function () {
      assert(ValidateYesNo('Y') === true)
    })

    it('should return true if string is "y"', function () {
      assert(ValidateYesNo('y') === true)
    })

    it('should return true if string is "N"', function () {
      assert(ValidateYesNo('N') === true)
    })

    it('should return true if string is "n"', function () {
      assert(ValidateYesNo('n') === true)
    })

    it('should return false if string is "something else"', function () {
      assert(ValidateYesNo('something else') === false)
    })
  })

  describe('ConvertYNtoTrueFalse', function () {
    it('should return true if string is "Y"', function () {
      assert(ConvertYNtoTrueFalse('Y') === true)
    })

    it('should return true if string is "y"', function () {
      assert(ConvertYNtoTrueFalse('y') === true)
    })

    it('should return true if string is "N"', function () {
      assert(ConvertYNtoTrueFalse('N') === false)
    })

    it('should return true if string is "n"', function () {
      assert(ConvertYNtoTrueFalse('n') === false)
    })
  })

  describe('ToIntZeroBase', function () {
    it('should convert 1.5 to 0', function () {
      assert(ToIntZeroBase(1.5) === 0)
    })

    it('should convert 3.6 to 2', function () {
      assert(ToIntZeroBase(3.6) === 2)
    })

    it('should convert 2 to 1', function () {
      assert(ToIntZeroBase(2) === 1)
    })
  })
})
