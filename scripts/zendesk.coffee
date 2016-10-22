# Description:
#   Queries Zendesk for information about support tickets
#
# Configuration:
#   HUBOT_ZENDESK_USER
#   HUBOT_ZENDESK_PASSWORD
#   HUBOT_ZENDESK_SUBDOMAIN
#
# Commands:
#   zendesk count unsolved/new/open/pending/escalated - returns the count of unsolved/new/open/pending/escalated tickets
#   zendesk list unsolved/new/open/pending/escalated - returns a list of unsolved/new/open/pending/escalated tickets, maximium 100 tickets returned
#   zendesk get <ID> - returns information about the specified ticket

sys = require 'sys' # Used for debugging
tickets_url = "https://#{process.env.HUBOT_ZENDESK_SUBDOMAIN}.zendesk.com/tickets"
queries =
  unsolved: "search.json?query=status<solved+type:ticket"
  open: "search.json?query=status:open+type:ticket"
  new: "search.json?query=status:new+type:ticket"
  escalated: "search.json?query=tags:escalated+status:open+status:pending+type:ticket"
  pending: "search.json?query=status:pending+type:ticket"
  tickets: "tickets"
  users: "users"


zendesk_request = (msg, url, handler) ->
  zendesk_user = "#{process.env.HUBOT_ZENDESK_USER}"
  zendesk_password = "#{process.env.HUBOT_ZENDESK_PASSWORD}"
  auth = new Buffer("#{zendesk_user}:#{zendesk_password}").toString('base64')
  zendesk_url = "https://#{process.env.HUBOT_ZENDESK_SUBDOMAIN}.zendesk.com/api/v2"

  msg.http("#{zendesk_url}/#{url}")
    .headers(Authorization: "Basic #{auth}", Accept: "application/json")
      .get() (err, res, body) ->
        if err
          msg.send "Zendesk says: #{err}"
          return

        content = JSON.parse(body)

        if content.error?
          if content.error?.title
            msg.send "Zendesk says: #{content.error.title}"
          else
            msg.send "Zendesk says: #{content.error}"
          return

        handler content

# FIXME this works about as well as a brick floats
zendesk_user = (msg, user_id) ->
  zendesk_request msg, "#{queries.users}/#{user_id}.json", (result) ->
    if result.error
      msg.send result.description
      return
    result.user


module.exports = (robot) ->

  robot.hear /^zendesk\s+count\s+(unsolved|new|open|pending|escalated)/i, { id: 'zendesk' }, (res) ->
    zendesk_request res, queries[res.match[1]], (results) ->
      res.send "#{results.count} #{res.match[1]} tickets"

  robot.hear /^zendesk\s+list\s+(unsolved|new|open|pending|escalated)/i, { id: 'zendesk' }, (res) ->
    zendesk_request res, queries[res.match[1]], (results) ->
      message = ''
      for result in results.results[0...100]
        message += "Ticket #{result.id} is #{result.status}: #{tickets_url}/#{result.id}\n"
      res.send message

  robot.hear /^zendesk\s+get\s+(\d+)$/i, { id: 'zendesk' }, (msg) ->
    ticket_id = msg.match[1]
    zendesk_request msg, "#{queries.tickets}/#{ticket_id}.json", (result) ->
      if result.error
        msg.send result.description
        return
      message = "#{tickets_url}/#{result.ticket.id} ##{result.ticket.id} (#{result.ticket.status.toUpperCase()})"
      message += "\n\n> Updated: #{result.ticket.updated_at}"
      message += "\n> Added: #{result.ticket.created_at}"
      message += "\n> Description:"
      message += "\n"
      message += "\n> #{result.ticket.description}"
      msg.send message
