'use strict';

async function main() {
    
    let refresh_google_token = async (refresh_token) => {
        try {
            let ret = await _context.authLib.refreshGoogleAccessToken(refresh_token);
            if (ret && ret['access_token']) {
                return ret['access_token'];
            }
            return ret;
        } catch(error) {
            return null;
        }
    }

    let get_google_refresh_token = async () => {
        let ret = await _context.getDocument('oauth-google');
        let data = ret.data; 
        if (data && data["token--map"]) {
            let token = data["token--map"];
            let refreshToken = token['refresh_token'];
            return refreshToken;
        }
        return null;
    }

    let get_user_calendars = async (token) => {
        const base_uri = "https://www.googleapis.com/calendar/v3";
        const endpoint = "/users/me/calendarList";
        let data = {
            "uri" : `${base_uri}${endpoint}`,
            'auth': {
                'bearer': `${token}`
            },
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let get_calendar_events = async (token, calendarId, timeMin, timeMax) => {
        const base_uri = "https://www.googleapis.com/calendar/v3";
        const endpoint = `/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`;
        let data = {
                "uri" : `${base_uri}${endpoint}`,
                'auth': {
                    'bearer': `${token}`
                },
            };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let post_slack_using_webhook = async (endpoint, text, blocks) => {
        const options = {
            "uri": endpoint,
            "json": {
                "text": text,
                "blocks": blocks
            }
        };
        let ret = await _context.requestAgent.post(options);
        return ret;
    }

    let parse_calendar_events = (events) => {
        if (events && events.items && events.items.length > 0) {
            let taxt = `Hey, you have ${events.items.length} events planned for today`;
            let items = events.items;
            let blocks = [];
            for (let i=0; i < items.length; i++) {
                let current = items[i];
                const link = current.htmlLink;
                const summary = current.summary || 'no summary provided';
                const description = current.description || 'no description provided';
                const location = current.location || 'no location provided';
                const start = current.start.dateTime || 'no start time provided';
                const end = current.end.dateTime || 'no end time provided';
                const attendees = current.attendees;
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": summary
                    }
                });
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": description
                    }
                });
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Location: ${location}`
                    }
                });
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Start: ${start}`
                    }
                });
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `End: ${end}`
                    }
                });
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `<${link}> \n :star: \n`
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://is5-ssl.mzstatic.com/image/thumb/Purple3/v4/d3/72/5c/d3725c8f-c642-5d69-1904-aa36e4297885/source/256x256bb.jpg",
                        "alt_text": "Haunted hotel image"
                    }
                });
                blocks.push({
                    "type": "divider"
                });
            } //end for loop
            return {'text': taxt, 'blocks': blocks};

        } else {
            return {'text': 'You do not have anything planned today', 'blocks': []};
        }
    }

    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";
    const calendarId = "#YOUR_CALENDAR_ID#"; //It might be your email address
    const TIMEZONE_UTC_OFFSET = -480; //America/Los_Angeles
    const timeMin = _context.momentLib().utcOffset(TIMEZONE_UTC_OFFSET).startOf('day').format(); // "2020-02-18T00:00:00-08:00";
    const timeMax = _context.momentLib().utcOffset(TIMEZONE_UTC_OFFSET).endOf('day').format(); //"2020-02-20T23:59:59-08:00";
    let refreshToken = await get_google_refresh_token();
    let access_token = await refresh_google_token(refreshToken);
    let eventResponse = await get_calendar_events(access_token, calendarId, timeMin, timeMax);
    // await _context.logger('info', {'eventResponse': eventResponse});
    let parsed_events = parse_calendar_events(JSON.parse(eventResponse));
    // await _context.logger('info', {'events': parsed_events});
    let ret = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, parsed_events.text, parsed_events.blocks);
    
    return {'message': parsed_events};
}
main();


