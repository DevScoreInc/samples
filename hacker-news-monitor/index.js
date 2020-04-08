
'use strict';

async function main() {
    
    let asyncFetchURL = async (url) => {
        let res = await _context.requestAgent.get(url);
        return JSON.parse(res);
    }
    
    let traverseStories = async (ids) => {
        if (!ids || ids.length === 0) {
            return null;
        }
        // only traverse first level of kids and first 30 stories
        const number_of_stories_to_traverse = 30;
        const docs = [];
        let kids = []; 
        for (let i=0; i < Math.max(ids.length, number_of_stories_to_traverse); i++) {
            let current = ids[i];
            let url = `https://hacker-news.firebaseio.com/v0/item/${current}.json`;
            let result = await asyncFetchURL(url);
            if (result && result['id']) {
                docs.push(result);
                if (result['kids'] && result['kids'].length > 0) {
                    kids = kids.concat(result['kids']);
                }
            }
        }
        for (let j=0; j < kids.length; j++) {
            let current = kids[j];
            let url = `https://hacker-news.firebaseio.com/v0/item/${current}.json`;
            let result = await asyncFetchURL(url);
            if (result && result['id']) {
                docs.push(result);
            }
        }
        return docs;
    }

    const indexDocuments = (docs) => {
        const FlexSearch = _context.searchLib.getFlexSearchInstance();
        let index = new FlexSearch('speed', {
            'async': true,
            'doc': {
                'id': "id",
                'field': [
                    "title",
                    "text",
                    "by"
                ]
            }
        });
        index.add(docs);
        return index;
    }

    const search = async (index, query) => {
        let results = await index.search(query);
        return results;
    }

    let sendTextToSlack = async (endpoint, blocks) => {
        const options = {
            "uri": endpoint,
            "json": {
                "blocks": blocks
            }
        };
        let ret = await _context.requestAgent.post(options);
        return ret;
    }

    let sendResultsToSlack = async (slackWebHookEndpoint, searchQuery, searchResults) => {
        if (!searchResults || searchResults.length === 0) {
            return null;
        }
        
        let blocks = [];
        
        blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Alerts for ${searchQuery}`
            }
        });
        blocks.push({
            "type": "divider"
        });

        for (let i=0; i < searchResults.length; i++) {
            let current = searchResults[i];
            let url = current.url;
            let title = current.title;
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": title
                }
            });
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `<${url}> \n :star: \n`
                }
            });
            blocks.push({
                "type": "divider"
            });
        }
        await sendTextToSlack(slackWebHookEndpoint, blocks);
        return;
    }

    
    const searchQuery = "#YOUR_KEYWORD#";
    const topStoriesEndpoint = 'https://hacker-news.firebaseio.com/v0/topstories.json';
    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";

    const topStories = await asyncFetchURL(topStoriesEndpoint);
    await _context.logger('info', {'tops len': topStories.length});
    const docs = await traverseStories(topStories);
    const searchIndex = indexDocuments(docs);
    const searchResults = await search(searchIndex, searchQuery);
    await sendResultsToSlack(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, searchQuery, searchResults);
    
    return true;
}

main().catch((error) => {
    return error;
});

