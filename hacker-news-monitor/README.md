# Hacker News keyword monitor

[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=hacker-news-monitor)


With this example you can monitor for a keyword or phrase on hacker news tops posts (and corresponding 1st level responses), and receive an alert on your Slack channel. Create a [CronJob](https://app.devscore.dev/functions/manage) for this function to continuously monitor Hacker News. 

This [youtube video](https://youtu.be/5nEab7ALc3c) shows you how to deploy it and how to modify it to search for multiple terms and phrases to create different notifcation.

You need to create a Slack app and Activate Incoming Webhooks to use Slack integration. Please follow [these instructions](https://slack.com/help/articles/115005265063-Incoming-Webhooks-for-Slack) to create your Slack app.

You can also modify this fucntion to add email notifications using the [email funcationality](https://github.com/DevScoreInc/docs#emaillib) built into our SDK. This is left as an excercise for the reader, but if you really want it and get stuck send us a note and we'll try to help you. 




