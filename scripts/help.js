// Commands:
//   help - show help information

const _ = require('lodash');
const { getApps, getInstalledApps } = require('../apps');


module.exports = (robot) => {
  robot.hear(/^help$/i, { id: 'help' }, (res) => {
    const apps = getApps(robot);
    const installedApps = getInstalledApps(apps, robot, res);
    console.log(installedApps);
    const regexStr = '/^' + installedApps.join('\\s+|^') + '\\b/';
    const regex = eval(regexStr);
    let commands = robot.helpCommands();
    console.log(commands);
    commands = _.filter(commands, (command) => {
      return command.match(regex) != null;
    });
    console.log(commands);
    res.send(commands.join('\n'));
  });
}
