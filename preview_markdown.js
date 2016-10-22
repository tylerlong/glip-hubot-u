const page = require('webpage').create();
const system = require('system');

page.viewportSize = { width: 800, height: 128 };

page.open('index.html', function (status) {
  if (status !== "success") {
    return;
  }
  const data = system.args[1];
  const uid = system.args[2];
  page.evaluate(function (data) {
    mdc.init(data, false);
  }, data);
  setTimeout(function () {
    page.render('static/' + uid + '.png');
    phantom.exit();
  }, 1000);
});
