const glipRequest = (robot, endpoint, method, options) => {
  return new Promise((resolve, reject) => {
    robot.adapter.client.request(endpoint, method, options, (error, pack) => {
      if (error) {
        reject(error)
      }
      resolve(pack)
    })
  })
}

module.exports = { glipRequest }
