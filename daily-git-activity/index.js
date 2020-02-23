'use strict';

async function main() {

    const errorToString = (error) => {
        if (typeof error === 'object') {
            if (error.stack && error.message) {
                return `message=${error.message}, stack=${error.stack}`;
            }
            else if (error.toString()) {
                return error.toString();
            } 
            else if (error.message) {
                return error.message;
            }
        } else if (typeof error === 'string') {
            return error;
        } 
        return JSON.stringify(error);
    }

    const fetchStats = async (fromDate, toDate, reportType) => {
        try {
            let res = await _context.gitLib.getStatsReport(reportType, fromDate, toDate);
            return res;
        } catch(error) {
            await _context.logger('error', {'fetchStatsError': errorToString(error)});
            return null;
        }
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

    const parse_git_commit_stats = (stat) => {
        if (stat) {
            let commitData = stat.commitData;
            let commitDataSummary = commitData.summary;
            let total_number_of_commits = commitDataSummary.total_number_of_commits;
            return total_number_of_commits;
        } 
        return 0;
    }

    const parse_git_issue_stats = (stat) => {
        if (stat) {
            let issueData = stat.issueData;
            let summary = issueData.summary;
            let total_number_of_issues_closed = summary.total_number_of_issues_closed;
            return total_number_of_issues_closed;
        } 
        return 0;
    }

    const parse_git_pull_stats = (stat) => {
        if (stat) {
            let pullData = stat.pullData;
            let summary = pullData.summary;
            let total_number_of_merged_pulls = summary.total_number_of_merged_pulls;
            return total_number_of_merged_pulls;
        } 
        return 0;
    }

    const parse_git_release_stats = (stat) => {
        if (stat) {
            let releaseData = stat.releaseData;
            let summary = releaseData.summary;
            let total_number_of_releases = summary.total_number_of_releases;
            return total_number_of_releases;
        } 
        return 0;
    }

    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";
    
    const reportType = 'all'; //["all", "issues", "collab-scores", "collabs", "commits", "pulls", "releases"]
    const fromDate = _context.momentLib().utc().subtract(2, 'days').startOf('day'); 
    const toDate = _context.momentLib().utc().subtract(2, 'days').endOf('day'); 
    const statResponse = await fetchStats(fromDate.valueOf(), toDate.valueOf(), reportType);

    // await _context.logger('info', {'eventResponse': eventResponse});
    const total_number_of_commits = parse_git_commit_stats(statResponse.data);
    const total_number_of_issues_closed = parse_git_issue_stats(statResponse.data);
    const total_number_of_merged_pulls = parse_git_pull_stats(statResponse.data);
    const total_number_of_releases = parse_git_release_stats(statResponse.data);
    const commit_text = `You pushed ${total_number_of_commits} commits from ${fromDate.format()} to ${toDate.format()}`;
    const issue_text = `You closed ${total_number_of_issues_closed} issues from ${fromDate.format()} to ${toDate.format()}`;
    const pull_text = `You merged ${total_number_of_merged_pulls} PRs from ${fromDate.format()} to ${toDate.format()}`;
    const release_text = `You released ${total_number_of_releases} times from ${fromDate.format()} to ${toDate.format()}`;
    let ret1 = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, commit_text);
    let ret2 = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, issue_text);
    let ret3 = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, pull_text);
    let ret4 = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, release_text);
    
    return {'message': total_number_of_commits};
}

main();


