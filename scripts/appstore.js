const _ = require('lodash');

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


module.exports = (robot) => {

  // list app of the apps
  robot.hear(/^app list$/, { id: APP_NAME }, (res) => {
    // app 列表
    const apps = getApps(robot);

    // 格式化并发送
    res.send(_.map(apps, (app) => { return '* ' + app }).join('\n'));
  });

  // install app
  robot.hear(/^app install (.+?)$/, { id: APP_NAME }, (res) => {
    // 用户输入的 app name
    const app = res.match[1].trim();

    // app 列表
    const apps = getApps(robot);

    // 用户输入有误
    if(!_.includes(apps, app)) {
      res.send('Unknown app');
      return;
    }

    // install app to current room
    robot.brain.data.appstore[res.envelope.room] = robot.brain.data.appstore[res.envelope.room] || {};
    robot.brain.data.appstore[res.envelope.room][app] = true;
    res.send('App installed');
  });

}
