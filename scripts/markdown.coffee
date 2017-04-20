# Description:
#   Render markdown as image
#
# Commands:
#   markdown usage: [md]write markdown here, line breaks are allowed[/md]
#   markdown code highlight: use fenced code block syntax

sendMarkdown = require('../markdown').sendMarkdown


module.exports = (robot) ->
  robot.hear /^\s*(```[\s\S]+\n\s*```)\s*$/, id: 'markdown', (res) ->
    sendMarkdown(res.match[1], robot, res);

  robot.hear /^\s*\[md\]([\s\S]+)\[\/md\]\s*$/i, id: 'markdown', (res) ->
    sendMarkdown(res.match[1], robot, res);
