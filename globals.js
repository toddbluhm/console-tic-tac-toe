module.exports = {
  highScoreFileLocation: './high-scores.json',
  tiles: {
    EMPTY: 0,
    PLAYER: 1,
    COMP: 2
  },
  avatarInfo: {
    0: {
      avatar: '',
      color: 'black'
    },
    1: {
      name: 'Player',
      avatar: 'X',
      color: 'green'
    },
    2: {
      name: 'Computer',
      avatar: 'O',
      color: 'red'
    }
  },
  defaultBoardState: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
}
