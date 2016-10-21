// Description:
//   Render a line of markdown into image
//
// Commands:
//   markdown <a line of markdown> - Render a line of markdown into image



const { send_markdown } = require('../markdown');


module.exports = (robot) => {

  robot.hear(/^markdown (.+?)$/i, { id: 'markdown' }, (res) => {
    send_markdown(res.match[1], robot, res);
  });

}
