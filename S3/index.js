
'use strict';


async function main() {
    
    let get_aws_tokens = async () => {
        let ret = await _context.getDocument('token-aws');
        let data = ret.data; 
        if (data && data["token--map"]) {
            let token = data["token--map"];
            return {
                "accessKeyId": token.accessKeyId,
                "secretAccessKey": token.secretAccessKey
            };
        }
        return null;
    }

    let getS3Buckets = async (tokens, region) => {
        try {

            let AWS = _context.awsLib.getAWSInstance();
            AWS.config = new AWS.Config({
                'accessKeyId': tokens.accessKeyId,
                'secretAccessKey': tokens.secretAccessKey,
                'region': region, 
            });
            let s3 = new AWS.S3();
            let ret = await s3.listBuckets().promise();
            return ret;
        } catch(error) {
            await _logger('error', error.toString());
            return null;
        }
    }
    
    const tokens = await get_aws_tokens();
    const buckets = await getS3Buckets(tokens, 'us-east-1');
    _context.logger('info', buckets);
    return true;
}
main();

