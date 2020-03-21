# GitHub File Monitor

[<img src="https://firebasestorage.googleapis.com/v0/b/bkind-a71be.appspot.com/o/images%2Fpublic%2Fdeploy_on_devscore2-high-res.png?alt=media&token=ec117ba5-3915-482e-b011-e25304bb94b4" height="44px" width="180px">](https://app.devscore.dev/functions/editor?gitPath=https://github.com/DevScoreInc/samples&dirPath=github-file-monitor)


This Function monitor changes to you files and notify you if someone changes them.

To run this function you need to obtain your GitHub oauth token with `repo` permission which you can accomplish in Connection-Hub.

Second, after you deploy this function and store in your DevScore workspace, you need to create a POST webhook with `HMAC-SH1` security type, `X-Hub-Signature` http header, and your chosen crypto secret. After deploying the webhook and obtaining the Endpoint URL, visit your repo(s) Settings -> Webhooks in GitHub and add webhook. Paste the Endpoint URL, select application/json Content Type, use the same secret that you chose when creating Webhook at DevScore, and then under 'Which events would you like to trigger this webhook?' select Pushes and Pull Requests.

add your files that you like to monitor into `const myFiles = ["README.md"];`. And you should be ready to go!

