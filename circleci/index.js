
'use strict';

async function main() {
    
    let get_circleci_token = async () => {
        let ret = await _context.getDocument('token-circleci');
        let data = ret.data; 
        if (data && data["token--map"]) {
            const tokenMap = data["token--map"];
            const token = tokenMap['token'];
            return token;
        }
        return null;
    }
    
    let validateCircleCIToken = async (token) => {
        const endpoint = "https://circleci.com/api/v2/me";
        let data = {
            "uri" : `${endpoint}`,
            headers: {
                'Circle-Token': `${token}`
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }
    const token = await get_circleci_token();
    const isValid = await validateCircleCIToken(token);
    await _context.logger('debug', {'message': JSON.stringify(isValid)});
    return true;
}

main();


