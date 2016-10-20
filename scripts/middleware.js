// Description:
//   Middleware to allow certain commands to be run in certain rooms
//
module.exports = function(robot) {

  robot.listenerMiddleware(function(context, next, done){
    var commandId = context.listener.options.id;
    if(commandId == 'bad') { // if command id is 'bad', don't execute
      done();
    } else {
      next(done);
    }
  });

}
