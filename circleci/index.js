
'use strict';

async function main() {

    const baseURI = 'https://circleci.com/api/v2';

    let getProjectSlug = (version_control_system, username, repo_name) => {
        // version_control_system can be 'VCS', 'gh', or 'bb'
        // username can be org name or username

        return `${version_control_system}/${username}/${repo_name}`;
    }

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
        const endpoint = `${baseURI}/me`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let triggerPipeline = async (token, project_slug, params) => {
        // Pipelien -> Workflow -> Job (build job, test job, deploy job)
        const endpoint = `${baseURI}/project/${project_slug}/pipeline`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            'body': {
                'parameters': params
            },
            'json': true
        };
        let res = await _context.requestAgent.post(data);
        return res;
    }

    let getProjectDetail = async (token, project_slug) => {
        const endpoint = `${baseURI}/project/${project_slug}`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let getListOfWorkflows = async (token, pipelineId) => {
        const endpoint = `${baseURI}/pipeline/${pipelineId}/workflow`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let getListOfPipelines = async (token, project_slug) => {
        const endpoint = `${baseURI}/project/${project_slug}/pipeline`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let getListOfJobs = async (token, workflowId) => {
        const endpoint = `${baseURI}/workflow/${workflowId}/job`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        let res = await _context.requestAgent.get(data);
        return res;
    }

    let getJobDetail = async (token, project_slug, job_number) => {
        const endpoint = `${baseURI}/project/${project_slug}/job/${job_number}`;
        let data = {
            "uri" : `${endpoint}`,
            'headers': {
                'Circle-Token': `${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
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


