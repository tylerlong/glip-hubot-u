// Commands:
//   help - show help information
//   help <keyword> - show help information which contains the keyword

const _ = require('lodash')
const { getApps, getInstalledApps } = require('../apps')
const { engine } = require('../nunjucks')

const getCommands = (robot, res) => {
  const apps = getApps(robot)
  const installedApps = getInstalledApps(apps, robot, res)
  let commands = []
  if (installedApps.length > 0) {
    const regexStr = '/^' + installedApps.join('\\s+|^') + '\\b/'
    const regex = eval(regexStr) // eslint-disable-line no-eval
    commands = _.filter(robot.helpCommands(), (command) => {
      return command.match(regex) != null
    })
  }
  return commands
}

module.exports = (robot) => {
  robot.hear(/^help$/i, { id: 'help' }, (res) => {
    const commands = getCommands(robot, res)
    const markdown = engine.render('help/list.njk', { commands })
    res.send(markdown)
  })

  robot.hear(/^help\s+(.+?)$/i, { id: 'help' }, (res) => {
    let commands = getCommands(robot, res)
    const keyword = _.toLower(res.match[1].trim())
    commands = _.filter(commands, (command) => {
      return _.includes(_.toLower(command), keyword)
    })
    const markdown = engine.render('help/list.njk', { commands, keyword: true })
    res.send(markdown)
  })
}
