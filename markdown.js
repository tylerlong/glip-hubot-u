const uuid = require('uuid');
const spawn = require('child_process').spawnSync;


const send_markdown = (markdown, robot, res) => {
  const uid = uuid.v4();
  spawn('phantomjs', ['preview_markdown.js', markdown, uid]);
  const url = `#{process.env.GLIP_BOT_HOST}/${uid}.png`;
  const envelope = { user: res.message.user, message_type: 'image_url' };
  robot.send(envelope, url)
}


module.exports = { send_markdown };
