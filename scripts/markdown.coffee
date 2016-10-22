# Description:
#   Render markdown as image
#
# Commands:
#   markdown usage: [md]write markdown here, line breaks are allowed[/md]
#   markdown code highlight: use fenced code block syntax

send_markdown = require('../markdown').send_markdown


module.exports = (robot) ->
  robot.hear /^\s*(```[\s\S]+\n\s*```)\s*$/, id: 'markdown', (res) ->
    send_markdown(res.match[1], robot, res);

  robot.hear /^\s*\[md\]([\s\S]+)\[\/md\]\s*$/i, id: 'markdown', (res) ->
    send_markdown(res.match[1], robot, res);
