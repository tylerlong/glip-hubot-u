// Commands:
//   help - show help information

const _ = require('lodash');
const { getApps, getInstalledApps } = require('../apps');


module.exports = (robot) => {
  robot.hear(/^help$/i, { id: 'help' }, (res) => {
    const apps = getApps(robot);
    const installedApps = getInstalledApps(apps, robot, res);
    const regexStr = '/^' + installedApps.join('\\s+|^') + '\\b/';
    const regex = eval(regexStr);
    const commands = robot.helpCommands();
    _.remove(commands, (command) => {
      return command.match(regex) == null;
    });
    res.send(commands.join('\n'));
  });
}
