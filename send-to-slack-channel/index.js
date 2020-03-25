
'use strict';
/*
Global variables
    '_context' : it is an object with following attributes 
        'eventContext.devscore_function_exec_result': Object (JSON) which will be present if this function runs as a result of previous function execution - the value of this attribute is the return value of previous function

    Please visit https://github.com/DevScoreInc/docs for up-to-date documentation
*/

async function main() {
    
    const post_to_slack_using_webhook = async (endpoint, text, blocks) => {
        const options = {
            "uri": endpoint,
            "json": {
                "text": text,
                "blocks": blocks || null
            }
        };
        let ret = await _context.requestAgent.post(options);
        return ret;
    }
    
    const GENERAL_CHANNEL_WEBHOOK_ENDPOINT = "#YOUR_SLACK_CHANNEL_WEBHOOK_URL#";
    const retValueFromCaller = (_context.eventContext && _context.eventContext.devscore_function_exec_result) ? _context.eventContext.devscore_function_exec_result['return'] : {};
    const endpoint = retValueFromCaller['channel_webhook_uri'] || GENERAL_CHANNEL_WEBHOOK_ENDPOINT;
    const text = retValueFromCaller['message'] || 'no-text-provided';
    const blocks = retValueFromCaller['blocks'] || null;
    await post_to_slack_using_webhook(endpoint, text, blocks);
   
    return true;
}
main();

