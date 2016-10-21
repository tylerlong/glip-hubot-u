// Description:
//   Show glip app reviews
//
// Commands:
//   reviews <app name> - List recent 50 reviews of the specific app

const request = require('request');
const _ = require('lodash');


module.exports = (robot) => {

  robot.hear(/reviews$/i, { id: 'reviews' }, (res) => {
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

  robot.hear(/reviews (\d+)$/i, { id: 'reviews' }, (res) => {
    request({ url: 'https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=715886894/json' }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        const entry = json.feed.entry[res.match[1]]
        const result = `${':star:'.repeat(entry['im:rating'].label)}\t${entry.title.label}\n\n${entry.content.label}`
        res.send(result);
      }
    });
  });

}
