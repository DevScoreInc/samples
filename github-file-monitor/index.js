'use strict';

async function main() {

    const getGithubAccessToken = async () => {
        const ret = await _context.getDocument('oauth-github');
        const data = ret.data; 
        if (data && data["token--map"]) {
            const token = data["token--map"];
            const accessToken = token['access_token'];
            return accessToken;
        }
        return null;
    }

    const getSingleCommit = async (commitURI, token) => {
        try {
            await _context.logger('debug', {'commitURI': commitURI});
            if (!token || !commitURI ) {
                return null;
            }
            let data = {
                "uri" : commitURI,
                'headers': {
                    'User-Agent': `DevScore-HTTP-Agent`,
                    'Authorization': 'token ' + token,
                }
            };
            let result = await _context.requestAgent.get(data);
            return JSON.parse(result);
        } catch(error) {
            await _context.logger('error', {'commit-fetch-error': error.toString()});
            return null;
        }
    }

    const getPullRequestCommits = async (commitsURL, token) => {
        try {
            //https://developer.github.com/v3/pulls/#get-a-single-pull-request
            if (!token || !commitsURL ) {
                return null;
            }
            await _context.logger('debug', {'PR-commitsURL': JSON.stringify(commitsURL)});
            let data = {
                "uri" : commitsURL,
                'headers': {
                    'User-Agent': `DevScore-HTTP-Agent`,
                    'Authorization': 'token ' + token,
                }
            };
            let result = await _context.requestAgent.get(data);
            return JSON.parse(result);
        } catch(error) {
            await _context.logger('error', {'pr-fetch-error': error.toString()});
            return null;
        }
    }

    const processPushEvent = (pushEventPayload) => {
        let commitsData = pushEventPayload.commits;
        let repo = pushEventPayload.repository;
        let commitBaseURL = repo['commits_url'].replace('{/sha}', '/');
        let commitURLs = [];
        for (let j=0; j < commitsData.length; j++) {
            //we need something like this
            //https://api.github.com/repos/digvan/xxxx/commits/00a38a307419xxxxxxxx
            let cur = commitsData[j];
            let sha = cur['id'];
            let url = commitBaseURL + sha;
            commitURLs.push(url);
        }
        return commitURLs;
    }

    const doesMyFilesChanged = (myFiles, commitDataList) => {
        const result = [];
        //https://developer.github.com/v3/repos/commits/#get-a-single-commit
        for (let i=0; i < commitDataList.length; i++) {
            let currentSingleCommit = commitDataList[i];
            let singleCommitHTMLURL = currentSingleCommit.html_url;
            let changedFiles = currentSingleCommit.files;
            for (let j=0; j < changedFiles.length; j++) {
                let currentFile = changedFiles[j];
                let filename = currentFile.filename;
                if (myFiles.includes(filename)) {
                    result.push({'html_url': singleCommitHTMLURL, 'filename': filename});
                }
            }
        }
        return result;
    }

    const fetchCommits = async (commitURLList, token) => {
        if (!commitURLList) return;
        let commitDataList = [];
        for (let i=0; i < commitURLList.length; i++) {
            let commitURI = commitURLList[i];
            let commitData = await getSingleCommit(commitURI, token);
            commitDataList.push(commitData);
        }
        return commitDataList;
    }

    const startPoint = async (eventContext, myFiles) => {
        const accessToken = await getGithubAccessToken();
        const isPullRequest = isEventPullRequest(eventContext);
        if (!isPullRequest) { // It is PUSH event (direct commit to master)
            let commitURLList = processPushEvent(eventContext);
            let commitDataList = await fetchCommits(commitURLList, accessToken);
            const blackList = doesMyFilesChanged(myFiles, commitDataList);
            return blackList;
        } else { // It is a PR event
            const commitsURL = eventContext.pull_request.commits_url;
            const prCommits = await getPullRequestCommits(commitsURL, accessToken);
            const commitURLList = prCommits.map((elm) => {
                return elm.url;
            });
            await _context.logger('info', JSON.stringify(commitURLList));
            let commitDataList = await fetchCommits(commitURLList, accessToken);
            const blackList = doesMyFilesChanged(myFiles, commitDataList);
            return blackList;
        }
    }

    const isEventPullRequest = (eventContext) => {
        const pr = eventContext.pull_request;
        const action = eventContext.action; // only check when PR is opened
        return (pr && action === "opened") ? true : false;
    }

    const post_slack_using_webhook = async (endpoint, text) => {
        const options = {
            "uri": endpoint,
            "json": {
                "text": text
            }
        };
        let ret = await _context.requestAgent.post(options);
        return ret;
    }

    const sendChangesToSlack = async (blackList, slack_channel_uri) => {
        if (!blackList || blackList.length === 0) return;
        for (let i=0; i < blackList.length; i++) {
            let cur = blackList[i];
            let text = `${cur.filename} has been changed. ${cur.html_url}`;
            await post_slack_using_webhook(slack_channel_uri, text);
        }
        return;
    }
    
    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";
    const myFiles = ["README.md"]; // TODO: change this list to your desired list of files such as "directoryName/fileName" 
    const blackList = await startPoint(_context.eventContext, myFiles);

    // Optional : send it to Slack
    await sendChangesToSlack(blackList, GENERAL_CHANNEL_WEBHOOK_ENDPOINT);
    
    await _context.logger('info', {'blackList': JSON.stringify(blackList)});
    return blackList;
}

main();

