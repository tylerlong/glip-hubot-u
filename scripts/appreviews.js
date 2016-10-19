const request = require('request');
const _ = require('lodash');

module.exports = (robot) => {
  robot.respond(/reviews$/i, (res) => {
    request({ url: 'https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=715886894/json' }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        let result = `#.\tRating\tTitle\n`;
        result += _.tail(json.feed.entry).map((item, index) => {
          return `#${index + 1}.\t${item['im:rating'].label}\t${item.title.label}`;
        }).join('\n');
        res.send(result);
      }
    });
  });
}
