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

    let get_user_calendars = async () => {
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

    let post_slack_using_webhook = async (endpoint, text) => {
        const options = {
            "uri": endpoint,
            "json": {
                "text": text
            }
        };
        let ret = await _context.requestAgent.post(options);
        return ret;
    }

    let parse_calendar_events = (events) => {
        if (events && events.items && events.items.length > 0) {
            let items = events.items;
            let total_time_spent_in_meetings = 0;
            for (let i=0; i < items.length; i++) {
                let current = items[i];
                const start = current.start.dateTime;
                const end = current.end.dateTime;
                const start_time = _context.momentLib(start).valueOf();
                const end_time = _context.momentLib(end).valueOf();
                const duration_in_minute = ((end_time - start_time) / 1000) / 60;
                total_time_spent_in_meetings += duration_in_minute;
                
            } //end for loop
            return total_time_spent_in_meetings;

        } 
        return 0;
    }

    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";
    const calendarId = "#YOUR_CALENDAR_ID#"; //It might be your email address
    const TIMEZONE_UTC_OFFSET = -480; //America/Los_Angeles
    const timeMin = _context.momentLib().utcOffset(TIMEZONE_UTC_OFFSET).startOf('month').format(); 
    const timeMax = _context.momentLib().utcOffset(TIMEZONE_UTC_OFFSET).endOf('month').format(); 
    let refreshToken = await get_google_refresh_token();
    let access_token = await refresh_google_token(refreshToken);
    let eventResponse = await get_calendar_events(access_token, calendarId, timeMin, timeMax);
    // await _context.logger('info', {'eventResponse': eventResponse});
    const total_duration = parse_calendar_events(JSON.parse(eventResponse));
    const text = `You spent ${total_duration} minutes from ${timeMin} to ${timeMax}`;
    // await _context.logger('info', {'events': parsed_events});
    let ret = await post_slack_using_webhook(GENERAL_CHANNEL_WEBHOOK_ENDPOINT, text);
    
    return {'message': total_duration};
}

main();


