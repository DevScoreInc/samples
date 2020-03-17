# COVID-19 Slack Bot

[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=COVID-19-Slack-Bot)


Covid-19 slack bot is a simple bot with two commands: 

1- 'stats' which gets the latest data from https://github.com/ExpDev07/coronavirus-tracker-api and post it 

2- 'symptoms' which post the COVID-19 symptoms from CDC guideline https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html 



To use this bot you need to create a Slack bot https://api.slack.com/bot-users#bots-overview (add app_mention and im_read, im_write permission)

Then, Enable Slack Event API and get Your 'Signing Secret' from Slack app page (Basic information menu option)
Then Create POST Webhook in DevScore (use HMAC-256 with 'X-Slack-Signature' header and 'Signing Secret' as value) 

P.S

Slack Request signing -- https://api.slack.com/docs/verifying-requests-from-slack




