const _ = require('lodash');


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

  // 把当前 appstore, help 从列表移除
  return _.filter(apps, (app) => {
    return app != "appstore" && app != "help";
  });
};

const getInstalledApps = (apps = null, robot, res) => {
  if(apps == null) {
    apps = getApps();
  }
  const installedApps = Object.keys(robot.brain.data.appstore[res.envelope.room] || {});

  // 移除已经从总列表消失的 app
  return _.filter(installedApps, (app) => { return _.includes(apps, app) });
}


module.exports = { getApps, getInstalledApps }
