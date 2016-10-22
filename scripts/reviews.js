// Description:
//   Show glip app reviews
//
// Commands:
//   reviews <app name or ID> - List recent 50 reviews of the specific app
//   reviews <app name or ID> <n> - Show detail of No. #n review of the specific app

const request = require('request');
const _ = require('lodash');
const { engine } = require('../nunjucks');


const apps = {
  glip: 715886894,
  ringcentral: 293305984,
  meetings: 688920955
}


const getApp = (res) => {
  let app = _.toLower(res.match[1].trim());
  if (!apps[app] && !app.match(/^(?:id)?\d+$/)) {
    return null;
  }
  app = apps[app] || app;
  if (_.startsWith(app, 'id')) {
    app = app.substring(2);
  }
  return app;
}


module.exports = (robot) => {

  robot.hear(/^reviews\s+([^\s]+?)$/i, { id: 'reviews' }, (res) => {
    let app = getApp(res);
    if (app == null) {
      let message = `Non RingCentral apps (glip, ringcentral and meetings), specify app ID instead.`;
      message += `\n\nFor example: Slack's ID is 803453959, HipChat's ID is 418168984...etc`;
      res.send(message);
      return;
    }
    request({ url: `https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=${app}/json` }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        const reviews = _.tail(json.feed.entry).map((entry) => {
          return {
            title: entry.title.label.trim(),
            stars: parseInt(entry['im:rating'].label.trim()),
          }
        });
        const first = json.feed.entry[0];
        let name = first['im:name'].label;
        name += ' ' + first.rights.label;
        const markdown = engine.render('reviews/list.njk', { name, reviews });
        res.send(markdown);
      }
    });
  });

  robot.hear(/^reviews\s+(.+?)\s+(\d+)$/i, { id: 'reviews' }, (res) => {
    let app = getApp(res);
    if (app == null) {
      let message = `Non RingCentral apps (glip, ringcentral and meetings), specify app ID instead.`;
      message += `\n\nFor example: Slack's ID is 803453959, HipChat's ID is 418168984...etc`;
      res.send(message);
      return;
    }
    let number = parseInt(res.match[2]);
    if(number > 50 || number < 1) {
      res.send("Currently only the most recent 50 reviews could be retrived.")
      return;
    }
    request({ url: `https://itunes.apple.com/us/rss/customerreviews/page=1/sortBy=mostRecent/id=${app}/json` }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        const entry = json.feed.entry[number];
        const review = {
          title: entry.title.label.trim(),
          stars: parseInt(entry['im:rating'].label.trim()),
          content: entry.content.label,
        }
        const first = json.feed.entry[0];
        let name = first['im:name'].label;
        name += ' ' + first.rights.label;
        const markdown = engine.render('reviews/show.njk', { number, name, review });
        res.send(markdown);
      }
    });
  });

}
