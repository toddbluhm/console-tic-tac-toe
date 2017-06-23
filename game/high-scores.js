const columnify = require('columnify')
const chalk = require('chalk')
const BPromise = require('bluebird')
const jsonfile = BPromise.promisifyAll(require('jsonfile'))

const { highScoreFileLocation } = require('../globals')
const headingTransform = (headerText) => chalk.cyan(headerText.toUpperCase())

/**
 * Prints out a sorted listing of high scores from the high scores .json file
 *
 * @promise
 */
function ShowHighScores () {
  return jsonfile.readFileAsync(highScoreFileLocation)
    .catch(() => {
      return jsonfile.writeFileAsync(highScoreFileLocation, {scores: []})
        .return({scores: []})
    })
    .then(json => {
      json.scores.sort((p1, p2) => {
        if (p1.score === p2.score) {
          return p1.name > p2.name
        }

        return p1.score < p2.score
      })
      console.log(
        columnify(json.scores, {
          columns: ['score', 'name'],
          config: {
            name: {
              headingTransform
            },
            score: {
              headingTransform
            }
          },
          minWidth: 10
        }
        )
      )
    })
}

module.exports = {
  ShowHighScores
}
