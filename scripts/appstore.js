const _ = require('lodash');
const { engine } = require('../nunjucks');


const APP_NAME = 'appstore';


// helper method: app list
const getApps = (robot) => {
  // 所有有名字的
  const namedListeners = _.filter(robot.listeners, (listener) => {
    return listener.options.id != null;
  });

  // app 列表，去重、排序
  const apps = _.uniq(_.map(namedListeners, (listener) => {
    return listener.options.id;
  })).sort();

  // 把当前 app 也就是 appstore 从列表移除
  _.remove(apps, (app) => {
    return app == APP_NAME;
  });

  return apps;
};

const getInstalledApps = (apps = null, robot, res) => {
  if(apps == null) {
    apps = getApps();
  }
  const installedApps = Object.keys(robot.brain.data.appstore[res.envelope.room] || {});

  // 移除已经从总列表消失的 app
  _.remove(installedApps, (app) => { return !_.includes(apps, app) });
  return installedApps;
}


module.exports = (robot) => {

  // list app of the apps
  robot.hear(/^app list$/i, { id: APP_NAME }, (res) => {
    // app 列表
    const apps = getApps(robot);
    // 已安装的 app
    const installedApps = getInstalledApps(apps, robot, res);
    // other apps
    const otherApps = _.difference(apps, installedApps);

    res.send(engine.render('appstore/list.njk', { apps, installedApps, otherApps }));
  });

  // install app
  robot.hear(/^app (?:install|add) (.+?)$/i, { id: APP_NAME }, (res) => {
    // 用户输入的 app name
    const app = res.match[1].trim();

    // app 列表
    const apps = getApps(robot);

    // 用户输入有误
    if(!_.includes(apps, app)) {
      res.send(`Unknown app: **${app}**, did you make a typo?`);
      return;
    }

    // install app to current room
    robot.brain.data.appstore[res.envelope.room] = robot.brain.data.appstore[res.envelope.room] || {};
    robot.brain.data.appstore[res.envelope.room][app] = true;
    res.send(`App **${app}** has been installed.`);
  });

  robot.hear(/^app (?:uninstall|remove) (.+?)$/i, { id: APP_NAME }, (res) => {
    const app = res.match[1].trim();
    const apps = getApps(robot);

    // 用户输入有误
    if (!_.includes(apps, app)) {
      res.send(`Unknown app: **${app}**, did you make a typo?`);
      return;
    }

    const installedApps = getInstalledApps(apps, robot, res);

    if (!_.includes(installedApps, app)) {
      res.send(`App **${app}** isn't installed.`);
      return;
    }

    robot.brain.data.appstore[res.envelope.room] = robot.brain.data.appstore[res.envelope.room] || {};
    delete robot.brain.data.appstore[res.envelope.room][app];

    res.send(`App **${app}** has been uninstalled.`);
  });

}
