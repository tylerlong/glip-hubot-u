// Description:
//   Show glip app reviews
//
// Commands:
//   reviews <app name or ID> - List recent 50 reviews of the specified app
//   reviews <app name or ID> <n> - Show detail of No. #n review of the specified app
//   reviews monitor <app name or ID> - monitor the app, post notifications for new reviews
//   reviews unmonitor <app name or ID> - unmonitor the specified app
//   reviews pie <app name or ID> - Pie chart of the most recent 100 reviews of the specified app

const request = require('request');
const _ = require('lodash');
const { engine } = require('../nunjucks');
const { CronJob } = require('cron');
const { TextMessage, User } = require('hubot');
const { send_markdown } = require('../markdown');


// RingCental apps
const apps = {
  glip: 715886894,
  ringcentral: 293305984,
  meetings: 688920955
};


// monitor instances. Keep references so we could stop them.
const monitors = {};


// get the app entered by user
const getApp = (res) => {
  let app = _.toLower(res.match[1].trim());
  if (!apps[app] && !app.match(/^(?:id)?\d+$/)) {
    let message = `Non RingCentral apps (glip, ringcentral and meetings), specify app ID instead.`;
    message += `\n\nFor example: Slack's ID is 803453959, HipChat's ID is 418168984...etc`;
    res.send(message);
    return null;
  }
  app = apps[app] || app;
  if (_.startsWith(app, 'id')) {
    app = app.substring(2);
  }
  return app;
};


// get reviews of app #id, pagination supported
const getReviews = (id, page = 1) => {
  return new Promise((resolve, reject) => {
    if (page > 10) {
      resolve([]);
      return;
    }
    request({ url: `https://itunes.apple.com/us/rss/customerreviews/page=${page}/sortBy=mostRecent/id=${id}/json` }, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }
      if (response.statusCode != 200) {
        reject('response.statusCode != 200');
        return;
      }
      const json = JSON.parse(body);
      if (!json.feed.entry) {
        resolve([]);
        return;
      }
      resolve(json.feed.entry);
    });
  });
};


// start a monitor cron job
const startMonitor = (robot, group, app) => {
  const monitor = new CronJob('0 */10 * * * *', () => {
    // the content of the cron job
    getReviews(app, 1).then((entries) => {
      for (let i = 1; i < Math.min(9, entries.length); i++) {
        const latest_id = entries[i].id.label;
        if (_.includes(robot.brain.data.reviews.monitors[group][app].latest_ids, latest_id)) {
          break;
        }
        // receive a fake message to trigger displaying of the first review
        const user = new User('fake-user', {
          room: parseInt(group),
          reply_to: parseInt(group),
          name: "Fake message"
        });
        const message = new TextMessage(user, `reviews ${app} 1`, `MSG-${new Date().getTime()}`);
        robot.adapter.robot.receive(message);

        // don't forget to save the latest ID
        robot.brain.data.reviews.monitors[group][app].latest_ids.push(latest_id);
        robot.brain.data.reviews.monitors[group][app].latest_ids = _.takeRight(robot.brain.data.reviews.monitors[group][app].latest_ids, 10);
      } // end-for
    }).catch(() => {
      // cron job failed, do nothing
    });
  }, null, false, 'Asia/Shanghai');
  monitor.start();
  monitors[group] = monitors[group] || {};
  monitors[group][app] = monitor;
};


// start all the monitors. This should only be called once on restart
const startMonitors = (robot) => {
  _.forEach(Object.keys(robot.brain.data.reviews.monitors), (group) => {
    _.forEach(Object.keys(robot.brain.data.reviews.monitors[group]), (app) => {
      startMonitor(robot, group, app);
    });
  });
};


// remove a monitor
const removeMonitor = (robot, group, app) => {
  if (!robot.brain.data.reviews.monitors[group] || !robot.brain.data.reviews.monitors[group][app]) {
    return;
  }
  if (monitors[group] && monitors[group][app]) {
    monitors[group][app].stop();
    delete monitors[group][app];
  }
  delete robot.brain.data.reviews.monitors[group][app];
}


// create a monitor
const addMonitor = (robot, group, app) => {
  return new Promise((resolve, reject) => {
    robot.brain.data.reviews.monitors[group] = robot.brain.data.reviews.monitors[group] || {};
    if (robot.brain.data.reviews.monitors[group][app]) {
      removeMonitor(robot, group, app); // already monitored, remove it
    }
    robot.brain.data.reviews.monitors[group][app] = {};

    // fetch initial data
    getReviews(app, 1).then((entries) => {
      if (entries.length < 2) {
        robot.brain.data.reviews.monitors[group][app].latest_ids = [];
      } else {
        robot.brain.data.reviews.monitors[group][app].latest_ids = _.map(_.take(_.tail(entries), 10), 'id.label');
        robot.brain.data.reviews.monitors[group][app].name = entries[0]['im:name'].label;
      }
      startMonitor(robot, group, app);
      resolve(null);
    }).catch(() => {
      reject(null);
    });
  });
};


module.exports = (robot) => {

  // Init DB and start existing monitors
  robot.brain.on('loaded', () => {
    robot.brain.data.reviews = robot.brain.data.reviews || {};
    robot.brain.data.reviews.monitors = robot.brain.data.reviews.monitors || {};
    startMonitors(robot);
  });

  // create a monitor
  robot.hear(/^reviews\s+monitor\s+([^\s]+?)$/, { id: 'reviews' }, (res) => {
    const app = getApp(res);
    if (app == null) {
      return;
    }
    const group = res.envelope.room;
    addMonitor(robot, group, app).then(() => {
      let message = `App #${app} has been monitored. I will post notifications here whenever there are new reviews for this app.`;
      const apps = Object.keys(robot.brain.data.reviews.monitors[group]).map((app) => {
        return {
          id: app,
          name: robot.brain.data.reviews.monitors[group][app].name
        }
      });
      message += '\n\n' + engine.render('reviews/monitors.njk', { apps });
      res.send(message);
    }).catch(() => {
      res.send(`Failed to monitor app #${app}, try again later.`);
    });
  });

  // remove a monitor
  robot.hear(/^reviews\s+unmonitor\s+([^\s]+?)$/, { id: 'reviews' }, (res) => {
    const app = getApp(res);
    if (app == null) {
      return;
    }
    const group = res.envelope.room;
    removeMonitor(robot, group, app);
    let message = `App #${app} is no longer being monitored.`
    const apps = Object.keys(robot.brain.data.reviews.monitors[group]).map((app) => {
      return {
        id: app,
        name: robot.brain.data.reviews.monitors[group][app].name
      }
    });
    message += '\n\n' + engine.render('reviews/monitors.njk', { apps });
    res.send(message);
  });


  // get most recent 50 reviews
  robot.hear(/^reviews\s+([^\s]+?)$/i, { id: 'reviews' }, (res) => {
    const app = getApp(res);
    if (app == null) {
      return;
    }
    getReviews(app, 1).then((entries) => {
      if (entries == []) {
        res.send("No reviews found for this app");
        return;
      }
      const reviews = _.tail(entries).map((entry) => {
        return {
          title: entry.title.label.trim(),
          stars: parseInt(entry['im:rating'].label.trim()),
          author: entry.author.name.label,
        }
      });
      const first = entries[0];
      let name = first['im:name'].label;
      name += ' ' + first.rights.label;
      const markdown = engine.render('reviews/list.njk', { name, reviews });
      res.send(markdown);
    }).catch(() => {
      res.send("Error fetching reviews");
    });
  });


  // get a specified review
  robot.hear(/^reviews\s+([^\s]+?)\s+(\d{1,2})$/i, { id: 'reviews' }, (res) => {
    const app = getApp(res);
    if (app == null) {
      return;
    }
    let number = parseInt(res.match[2]);
    if (number > 50 || number < 1) {
      res.send("Currently only the most recent 50 reviews could be retrived.")
      return;
    }
    getReviews(app, 1).then((entries) => {
      if (number >= entries.length) {
        res.send("The review you requested doesn't exist");
        return;
      }
      const entry = entries[number];
      const review = {
        title: entry.title.label.trim(),
        stars: parseInt(entry['im:rating'].label.trim()),
        content: entry.content.label.split('\n').map((line) => '> ' + line).join('\n'),
        author: entry.author.name.label,
      }
      const first = entries[0];
      let name = first['im:name'].label;
      name += ' ' + first.rights.label;
      const markdown = engine.render('reviews/show.njk', { number, name, review });
      res.send(markdown);
    }).catch(() => {
      res.send('Error fetching review');
    });
  });


  // pie chart of the most recent 100 reviews.
  robot.hear(/^reviews\s+pie\s+([^\s]+?)$/i, { id: 'reviews' }, (res) => {
    const app = getApp(res);
    if (app == null) {
      return;
    }
    Promise.all([1, 2].map((page) => {
      return getReviews(app, page);
    })).then((arrays) => {
      let reviews = arrays[0];
      if (reviews.length < 2) {
        res.send("There aren't enough reviews to generate a chart");
        return;
      }
      const first = reviews[0];
      let name = first['im:name'].label;
      reviews = _.tail(reviews);
      if (arrays[1].length > 1) {
        reviews = _.concat(reviews, _.tail(arrays[1]));
      }
      const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      _.forEach(reviews, (review) => {
        stars[review['im:rating'].label] += 1;
      });
      const markdown = engine.render('reviews/pie.njk', { name, stars });
      send_markdown(markdown, robot, res);
    }).catch((error) => {
      console.log(error);
      res.send('Error fetching reviews')
    });
  });

  robot.hear(/!reviews reset!/, { id: 'reviews' }, (res) => {
    _.forEach(Object.keys(robot.brain.data.reviews.monitors), (group) => {
      _.forEach(Object.keys(robot.brain.data.reviews.monitors[group]), (app) => {
        addMonitor(robot, group, app);
      });
    });
    res.send('reviews monitors have been reset');
  });

}
