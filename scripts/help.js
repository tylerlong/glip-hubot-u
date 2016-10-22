// Commands:
//   help - show help information

const _ = require('lodash');
const { getApps, getInstalledApps } = require('../apps');
const { engine } = require('../nunjucks');


module.exports = (robot) => {
  robot.hear(/^help$/i, { id: 'help' }, (res) => {
    const apps = getApps(robot);
    const installedApps = getInstalledApps(apps, robot, res);
    let commands = [];
    if(installedApps.length > 0) {
      const regexStr = '/^' + installedApps.join('\\s+|^') + '\\b/';
      const regex = eval(regexStr);
      commands = _.filter(robot.helpCommands(), (command) => {
        return command.match(regex) != null;
      });
    }
    const markdown = engine.render('help/list.njk', { commands });
    res.send(markdown);
  });
}
