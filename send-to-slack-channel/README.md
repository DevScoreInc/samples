# Send Caller Results to Slack Channel

[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=send-to-slack-channel)


This function is usuful when you want to create a flow such as your first function (let's call it Function1) returns a JSON object such as `{'channel_webhook_uri': 'xxx', 'message': 'xxxxx'}` and then you set `on-success-event-name` of your Function1 to something you like (let's call it NotifyMyChannelEvent) and then go ahead and create a `Function Connector` (https://app.devscore.dev/functions/connector) with NotifyMyChannelEvent as event-name and then choose send-to-slack-channel from function picker. 

In this case, when your Function1 finishes it's execution successfully, then it invokes send-to-slack-channel function to post it's return value to your slack channel.

This [Youtube Video](https://youtu.be/pon8ywx0xJk) shows you how to deply this and use function connectors step by step. 

For Slack integration: 
You need to create a Slack app and Activate Incoming Webhooks to use Slack integration. Please follow this (https://slack.com/help/articles/115005265063-Incoming-Webhooks-for-Slack) to create your Slack app.

