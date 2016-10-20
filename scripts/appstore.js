const _ = require('lodash');

const APP_NAME = 'appstore';


module.exports = (robot) => {

  // list app of the apps
  robot.hear(/^app list$/, { id: APP_NAME }, (res) => {

    // 所有有名字的
    const namedListeners = _.filter(robot.listeners, (listener) => {
      return listener.options.id != null;
    });

    // app 列表，去重、排序
    const apps = _.uniq(_.map(namedListeners, (listener) => {
      return listener.options.id;
    })).sort();

    // 把当前 app 从列表移除
    _.remove(apps, (app) => {
      return app == APP_NAME;
    });

    // 格式化并发送
    res.send(_.map(apps, (app) => { return '* ' + app }).join('\n'));
  });

}
