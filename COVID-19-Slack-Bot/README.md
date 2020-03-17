# Daily Git Activity

[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=COVID-19-Slack-Bot)


Need to create a Slack bot https://api.slack.com/bot-users#bots-overview (add app_mention and im_read, im_write permission)

Enable Slack Event API and create POST Webhook in DevScore (HMAC-256 with 'X-Slack-Signature' header and Signing secret as value) 

Here is details of Slack Request signing -- https://api.slack.com/docs/verifying-requests-from-slack

You need to get Your Signing Secret from Slack app page (Basic information menu option)


