
'use strict';


async function main() {
    
    const getSendGridToken = async () => {
        let result = await _context.dbLib.getDocument('token-sendgrid');
        let map = result.data["token--map"];
        return map.token;
    }
    
    const sendMail = async (to, from, subject, html_content, text_content) => {
        const token = await getSendGridToken();
        const messageData = {
            'api_key': token, 
            'to': to,
            'cc': null,
            'bcc': null,
            'reply_to': null,
            'from': from,
            'subject': subject,
            'html': html_content,
            'text': text_content,
            'isMultiple': false
        }
        let result = await _context.emailLib.sendMail(messageData);
        return result;
    }
    
    const to_email_address = "#TO_EMAIL_ADDRESS#";
    const from_email_address = "#FROM_EMAIL_ADDRESS#";
    const email_subject = "#EMAIL_SUBJECT#";
    const email_html_body = "<h1>Hello World</h1>";
    const email_text_body = "hello world";
    const result = await sendMail(to_email_address, from_email_address, email_subject, email_html_body, email_text_body);
    return {'message': result};
}
main();


