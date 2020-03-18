
'use strict';

async function main() {
    //https://developers.google.com/sheets/api/reference/rest

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

    let getSheetValues = async (token, spreadsheetId, range) => {
        //https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
        let data = {
                "uri" : `${endpoint}`,
                'auth': {
                    'bearer': `${token}`
                },
            };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let appendValues = async (token, spreadsheetId, range, values) => {
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
       
        let data = {
                "uri" : `${endpoint}`,
                'auth': {
                    'bearer': `${token}`
                },
                'body': {
                    'values': values
                },
                'json': true
            };
        let res = await _context.requestAgent.post(data);
        return res;
    }

    //https://developers.google.com/sheets/api/samples/sheet

    let refreshToken = await get_google_refresh_token();
    let token = await refresh_google_token(refreshToken); 
    const sheetId = "#SHEET_ID#";
    const range = `${sheetId}!A:E`;
    const spreadsheetId = "#SPREAD_SHEET_ID#"; 
    const sample_values = [
        ['PAPA', '1/1/2001', 'Website'],
        ['MAMA', '2018-03-14', 'Fun'],
    ];
    // let ret = await getSheetValues(token, spreadsheetId, range);
    let ret = await appendValues(token, spreadsheetId, range, sample_values);
    return true;
}

main();



