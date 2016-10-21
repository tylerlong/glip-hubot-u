# Description:
#   Queries Zendesk for information about support tickets
#
# Configuration:
#   HUBOT_ZENDESK_USER
#   HUBOT_ZENDESK_PASSWORD
#   HUBOT_ZENDESK_SUBDOMAIN
#
# Commands:
#   zendesk (all) tickets - returns the total count of all unsolved tickets. The 'all' keyword is optional.
#   zendesk new tickets - returns the count of all new (unassigned) tickets
#   zendesk open tickets - returns the count of all open tickets
#   zendesk escalated tickets - returns a count of tickets with escalated tag that are open or pending
#   zendesk pending tickets - returns a count of tickets that are pending
#   zendesk list (all) tickets - returns a list of all unsolved tickets. The 'all' keyword is optional.
#   zendesk list new tickets - returns a list of all new tickets
#   zendesk list open tickets - returns a list of all open tickets
#   zendesk list pending tickets - returns a list of pending tickets
#   zendesk list escalated tickets - returns a list of escalated tickets
#   zendesk ticket <ID> - returns information about the specified ticket

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

  robot.hear/^(?:zendesk|zd) (all )?tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.unsolved, (results) ->
      ticket_count = results.count
      msg.send "#{ticket_count} unsolved tickets"

  robot.hear/^(?:zendesk|zd) pending tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.pending, (results) ->
      ticket_count = results.count
      msg.send "#{ticket_count} unsolved tickets"

  robot.hear/^(?:zendesk|zd) new tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.new, (results) ->
      ticket_count = results.count
      msg.send "#{ticket_count} new tickets"

  robot.hear/^(?:zendesk|zd) escalated tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.escalated, (results) ->
      ticket_count = results.count
      msg.send "#{ticket_count} escalated tickets"

  robot.hear/^(?:zendesk|zd) open tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.open, (results) ->
      ticket_count = results.count
      msg.send "#{ticket_count} open tickets"

  robot.hear/^(?:zendesk|zd) list (all )?tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.unsolved, (results) ->
      for result in results.results
        msg.send "Ticket #{result.id} is #{result.status}: #{tickets_url}/#{result.id}"

  robot.hear/^(?:zendesk|zd) list new tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.new, (results) ->
      for result in results.results
        msg.send "Ticket #{result.id} is #{result.status}: #{tickets_url}/#{result.id}"

  robot.hear/^(?:zendesk|zd) list pending tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.pending, (results) ->
      for result in results.results
        msg.send "Ticket #{result.id} is #{result.status}: #{tickets_url}/#{result.id}"

  robot.hear/^(?:zendesk|zd) list escalated tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.escalated, (results) ->
      for result in results.results
        msg.send "Ticket #{result.id} is escalated and #{result.status}: #{tickets_url}/#{result.id}"

  robot.hear/^(?:zendesk|zd) list open tickets$/i, { id: 'zendesk' }, (msg) ->
    zendesk_request msg, queries.open, (results) ->
      for result in results.results
        msg.send "Ticket #{result.id} is #{result.status}: #{tickets_url}/#{result.id}"

  robot.hear/^(?:zendesk|zd) ticket ([\d]+)$/i, { id: 'zendesk' }, (msg) ->
    ticket_id = msg.match[1]
    zendesk_request msg, "#{queries.tickets}/#{ticket_id}.json", (result) ->
      if result.error
        msg.send result.description
        return
      message = "#{tickets_url}/#{result.ticket.id} ##{result.ticket.id} (#{result.ticket.status.toUpperCase()})"
      message += "\n>Updated: #{result.ticket.updated_at}"
      message += "\n>Added: #{result.ticket.created_at}"
      message += "\n>Description:"
      message += "\n>-------"
      message += "\n>#{result.ticket.description}"
      msg.send message
