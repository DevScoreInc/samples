
'use strict';
/*
SLACK eventContext
{
   "authed_users":[
      "xx"
   ],
   "devscore_webhook_url":"https://hooks.devscore.dev/function-runner/user-webhook/xx/xxx/?api_key=ddd1d407e",
   "devscore_event_type":"webhook-functions",
   "event_id":"Ev0106KQBBJB",
   "userId":"1T514ki2NJgkEm1QB3Ez5eTRKrT2",
   "event_time":1584424852,
   "event":{
      "channel":"CMPEZC27N",
      "blocks":[
         {
            "elements":[
               {
                  "elements":[
                     {
                        "user_id":"U0104NAH4KS",
                        "type":"user"
                     },
                     {
                        "text":" yey",
                        "type":"text"
                     }
                  ],
                  "type":"rich_text_section"
               }
            ],
            "block_id":"Evx",
            "type":"rich_text"
         }
      ],
      "client_msg_id":"aee81074-4aae-49d3-959a-28b42fbacca2",
      "event_ts":"1584424852.000800",
      "user":"UMPUPL1CY",
      "team":"TMHHJG0SV",
      "text":"<@U0104NAH4KS> yey",
      "type":"app_mention",
      "ts":"1584424852.000800"
   },
   "devscore_received_timestamp":1584424853858,
   "devscore_project_id":"xx",
   "devscore_webhook_name":"SLACK-COVID-19-BOT",
   "devscore_resource_uri":"https://hooks.devscore.dev/function-runner/user-webhook/xx/xxx/?api_key=ddd1d407e",
   "devscore_function_name":"COVID-19",
   "team_id":"TMHHJG0SV",
   "type":"event_callback",
   "devscore_webhook_formatted_name":"SLACK-COVID-19-BOT",
   "devscore_userId":"xx",
   "api_app_id":"xxx",
   "devscore_webhook_type":"POST",
   "function_name":"COVID-19",
   "devscore_api_key":"xx",
   "token":"xx",
   "devscore_webhook_created_by":"xx"
}

*/

async function main() {
    // Need to create a Slack bot https://api.slack.com/bot-users#bots-overview (add app_mention and im_read, im_write permission)
    // Enable Slack Event API and create POST Webhook in DevScore (HMAC-256 with 'X-Slack-Signature' header and Signing secret as value) 
    // Here is details of Slack Request signing -- https://api.slack.com/docs/verifying-requests-from-slack
    // You need to get Your Signing Secret from Slack app page (Basic information menu option)

    let getTextFromSlackEventApi = (payload) => {
        if (payload && payload.event && payload.event.text) {
            const regex = /<\s*@[^>]*>/gi;  //remove the username "<@UTU0D4SQ1> hi"
            const ret = payload.event.text;
            return ret.replace(regex, '');
        } else if (payload && payload.event && payload.event.reaction) {
            return payload.event.reaction;
        }
        return null;
    }

    let getChannelAndUserFromSlackEventApi = (payload) => {
        if (payload && payload.event && payload.event.channel && payload.event.user) {
            return {
                'user': payload.event.user,
                'channel': payload.event.channel
            }
        }
        return null;
    }
    
    let asyncFetchURL = async (url) => {
        let res = await _context.requestAgent.get(url);
        return res;
    }

    let postToSlackWithWebAPI = async (botToken, channel, text) => {
        const endpoint = 'https://slack.com/api/chat.postMessage';
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Authorization': `Bearer ${botToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            'body': {
                'text': text,
                'channel': channel
            },
            'json': true
        };
        let res = await _context.requestAgent.post(data);
        return res;
    }

    let fetchCovid19Data = async () => {
        // https://github.com/ExpDev07/coronavirus-tracker-api
        const API_URI = 'https://coronavirus-tracker-api.herokuapp.com/all';
        let data = await asyncFetchURL(API_URI);
        data = JSON.parse(data);
        if (data && data.latest) {
            return data.latest;
        }
        return data;
    }

    let getCOVID19Symptoms = () => {
        // https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html
        const ret = [`
            The following symptoms may appear 2-14 days after exposure:
            Fever
            Cough
            Shortness of breath
        `, 
        `If you develop emergency warning signs for COVID-19 get medical attention immediately. Emergency warning signs include:
            Difficulty breathing or shortness of breath
            Persistent pain or pressure in the chest
            New confusion or inability to arouse
            Bluish lips or face`];
        return ret;
    }

    let compileTheResponse = async (text) => {
        const STATS_SLACK_COMMANDS = 'stats'; 
        const SYMPTOMS_SLACK_COMMANDS = 'symptoms';
        const userAndChannel = getChannelAndUserFromSlackEventApi(_context.eventContext);
        if (text.includes(STATS_SLACK_COMMANDS)) {
            const COVID19Data = await fetchCovid19Data();
            const response = `Hello <@${userAndChannel.user}>! The latest COVID-19 stats are: ${COVID19Data.confirmed} confirmed, ${COVID19Data.recovered} recovered, ${COVID19Data.deaths} deaths.`;
            return response;
        }
        if (text.includes(SYMPTOMS_SLACK_COMMANDS)) {
            let symptoms = getCOVID19Symptoms();
            return symptoms.join(',');
        }
        return `Hello <@${userAndChannel.user}>! You can use <stats>, or <symptoms> to get started`;
    }

    const botToken = '#YOUR_SLACK_BOT_TOKEN#'; // Slack 'Bot User OAuth Access Token' that you can find in Slack app page under Settings->Install App menu
    const text = getTextFromSlackEventApi(_context.eventContext);
    const response = await compileTheResponse(text);
    const userAndChannel = getChannelAndUserFromSlackEventApi(_context.eventContext);
    const result = await postToSlackWithWebAPI(botToken, userAndChannel.channel, response);
    return true;
}
main();

