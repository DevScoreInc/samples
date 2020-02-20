
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

    const calendarId = "#YOUR_CALENDAR_ID#"; //It might be your email address
    const timeMin = "2020-02-18T00:00:00-08:00";
    const timeMax = "2020-02-20T23:59:59-08:00";
    let tokens = await get_google_refresh_token();
    let access_token = await refresh_google_token();
    let events = await get_calendar_events(access_token, calendarId, timeMin, timeMax);
    await _context.logger('info', {'events': events});
    return {'message': events};
}
main();


