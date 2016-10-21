const { send_markdown } = require('../markdown');


module.exports = (robot) => {

  robot.respond(/markdown (.+?)$/i, { id: 'markdown' }, (res) => {
    send_markdown(res.match[1], robot, res);
  });

}
