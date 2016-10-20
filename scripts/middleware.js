// Description:
//   Middleware to allow certain commands to be run in certain rooms
//

module.exports = function(robot) {

  robot.brain.data.appstore = robot.brain.data.appstore || {};

  robot.listenerMiddleware(function(context, next, done){
    const room = context.response.envelope.room;
    const app = context.listener.options.id;

    // 不要误杀 appstore
    if(app == 'appstore') {
      next(done);
      return;
    }

    // 在数据库白名单查找，当前 room 是否 install 了当前 app。
    if(robot.brain.data.appstore[room] && robot.brain.data.appstore[room][app] == true) {
      // 白名单验证通过
      next(done);
    } else {
      // 不在白名单
      done();
      // todo: 提示用户安装？
    }
  });

}
