# glip-hubot-u

Ultimate/Universal bot.

It's currently running in RingCentral with the name ***Co-Bot***.


## how to run

```
HUBOT_GLIP_EMAIL=*** \
HUBOT_GLIP_PASSWORD=*** \
HUBOT_GLIP_HOST=app.glip.com \
GLIP_BOT_HOST=*** \
HUBOT_JIRA_USERNAME=*** \
HUBOT_JIRA_PASSWORD=*** \
HUBOT_JIRA_URL=*** \
HUBOT_ZENDESK_USER=*** \
HUBOT_ZENDESK_PASSWORD=*** \
HUBOT_ZENDESK_SUBDOMAIN=*** \
SF_INSTANCE_URL=*** \
SF_CONSUMER_KEY=*** \
SF_CONSUMER_SECRET=*** \
SF_USERNAME=*** \
SF_PASSWORD=*** \
./bin/hubot -a glip -n u
```

You don't need to specify all of the credentials in order to run this project.

For example, if you don't want to support ZendDesk and SalessForce, you can leave their credentials empty.

Mandatory configuration items are `HUBOT_GLIP_EMAIL` and `HUBOT_GLIP_PASSWORD`.
