const _ = require('lodash')
const { getApps, getInstalledApps } = require('../apps')
const { engine } = require('../nunjucks')
const appMetadata = require('../app_metadata')

const APP_NAME = 'appstore'

module.exports = (robot) => {
  // list app of the apps
  robot.hear(/^app\s+list$/i, { id: APP_NAME }, (res) => {
    // app 列表
    const apps = getApps(robot)
    // 已安装的 app
    const installedApps = getInstalledApps(apps, robot, res)
    // other apps
    const otherApps = _.difference(apps, installedApps)
    const markdown = engine.render('appstore/list.njk', { apps, installedApps, otherApps, appMetadata })
    res.send(markdown)
  })

  // install app
  robot.hear(/^app\s+(?:install|add)\s+(.+?)$/i, { id: APP_NAME }, (res) => {
    // 用户输入的 app name
    const app = res.match[1].trim()

    // app 列表
    const apps = getApps(robot)

    // 用户输入有误
    if (!_.includes(apps, app)) {
      res.send(`Unknown app: **${app}**, did you make a typo?`)
      return
    }

    // install app to current room
    robot.brain.data.appstore[res.envelope.room] = robot.brain.data.appstore[res.envelope.room] || {}
    robot.brain.data.appstore[res.envelope.room][app] = true
    res.send(`App **${app}** has been installed.`)
  })

  robot.hear(/^app\s+(?:uninstall|remove|rm|delete)\s+(.+?)$/i, { id: APP_NAME }, (res) => {
    const app = res.match[1].trim()
    const apps = getApps(robot)

    // 用户输入有误
    if (!_.includes(apps, app)) {
      res.send(`Unknown app: **${app}**, did you make a typo?`)
      return
    }

    const installedApps = getInstalledApps(apps, robot, res)

    if (!_.includes(installedApps, app)) {
      res.send(`App **${app}** isn't installed.`)
      return
    }

    robot.brain.data.appstore[res.envelope.room] = robot.brain.data.appstore[res.envelope.room] || {}
    delete robot.brain.data.appstore[res.envelope.room][app]

    res.send(`App **${app}** has been uninstalled.`)
  })
}
