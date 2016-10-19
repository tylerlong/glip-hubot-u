const request = require('request');

module.exports = (robot) => {
  robot.respond(/reviews$/i, (res) => {
    request({ url: 'https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=715886894/json' }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        res.send(json.feed.entry[1].title.label)
      }
    });
  });
}
