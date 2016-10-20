// Description:
//   Show glip app reviews
//
const request = require('request');
const _ = require('lodash');
const { send_markdown } = require('../markdown');


module.exports = (robot) => {

  robot.respond(/reviews$/i, { id: 'appreviews' }, (res) => {
    request({ url: 'https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=715886894/json' }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        let result = `#.\tRating\tTitle\n`;
        result += _.tail(json.feed.entry).map((entry, index) => {
          return `#${index + 1}.\t${':star:'.repeat(entry['im:rating'].label)}\t${entry.title.label}`;
        }).join('\n');
        res.send(result);
      }
    });
  });

  robot.respond(/reviews (\d+)$/i, { id: 'appreviews' }, (res) => {
    request({ url: 'https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=715886894/json' }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        const entry = json.feed.entry[res.match[1]]
        const result = `${':star:'.repeat(entry['im:rating'].label)}\t${entry.title.label}\n\n${entry.content.label}`
        res.send(result);
      }
    });
  });

  robot.respond(/markdown (.+?)$/i, { id: 'markdown' }, (res) => {
    send_markdown(res.match[1], robot, res);
  });

  robot.respond(/bad$/i, { id: 'bad' }, (res) => {
    res.send('bad');
  });

  robot.respond(/good$/i, { id: 'good' }, (res) => {
    res.send('good');
  });

}
