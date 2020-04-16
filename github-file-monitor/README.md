# GitHub File Monitor


[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=github-file-monitor)

This [Youtube Video](https://youtu.be/6HgxIkT8EQ4) shows you how to deploy this function step by step at [DevScore](https://devscore.com/?res=github-file-monitor)

This Function monitors changes to your files in a github repo and notifies you when someone changes them. The example uses a webhook trigger from a gitbhub event to execute this function running in DevScore's platform. The invoked function ultimately uses a slack channel for notication, but can be easily modified to provide other notifications like email, text, etc. You can further customize the example to take actions and automatically publish diffs as well. 

To run this function you need to obtain your GitHub oauth token with `repo` permission which you can accomplish in [Connection Hub](https://app.devscore.dev/connection-hub) in your DevScore account. 

Second, after you deploy this function and store in your DevScore workspace, you need to create a POST webhook with `HMAC-SH1` security type, `X-Hub-Signature` http header, and your chosen crypto secret. After deploying the webhook and obtaining the Endpoint URL, visit your repo(s) Settings -> Webhooks in GitHub and add webhook. Paste the DevScore WebHook Endpoint URL, select application/json Content Type, use the same secret that you chose when creating Webhook at DevScore, and then under 'Which events would you like to trigger this webhook?' select Pushes and Pull Requests.

Add your files that you like to monitor into `const myFiles = ["README.md"];`. And you should be ready to go!

For Slack integration: 
You need to create a Slack app and Activate Incoming Webhooks to use Slack integration. Please follow [these instructions](https://slack.com/help/articles/115005265063-Incoming-Webhooks-for-Slack) to create your Slack app.

