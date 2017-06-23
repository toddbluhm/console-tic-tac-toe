const program = require('commander')
const { ShowHighScores } = require('./game/high-scores')
const { NewGame } = require('./game')

program
  .version('1.0.0')
  .option('-s, --high-scores', 'View high scores')
  .option('-p, --play', 'Start a new game')
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

if (program.highScores) {
  ShowHighScores()
}

if (program.play) {
  NewGame()
}
