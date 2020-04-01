
'use strict';


async function main() {
    
    let downloadCSVFileFromFileStorage = async (filename) => {
        try {
            let filePath = await _context.fileLib.downloadAsset(filename);
            return filePath;
        } catch(error) {
            return null;
        }
    }

    let storeRowsToDB = async (name, rows, documentId) => {
        try {
            let i,j,temparray,chunk = 199; //Maximum number of rows per DB call is 200
            for (i=0, j=rows.length; i < j; i += chunk) {
                temparray = rows.slice(i,i+chunk);
                let resp = await _context.dbLib.batchAddRowToTable(name, temparray, documentId);
            }
            return true;
        } catch(error) {
            _logger.error(error);
        }
    }
            
    let loadCSVFile = async (filePath) => {
        if (!filePath || typeof filePath != "string") return null;
        return new Promise(async (resolve, reject) => { 
            let csv = _context.fileLib.getCSVParserInstance();
            let stream = _context.fileLib.getFileReadStreamInstance(filePath);
            let rows = [];
            stream.pipe(csv.parse({ headers: true }))
            .on('error', (error) => {
                reject(error);
                return false;
            })
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', (rowCount) => {
                resolve(rows);
                return true;
            });
        });
    }

    let getStatsForCalifornia = async (varName, documentId) => {
        let ret = await _context.dbLib.getTableRowsWithFilterAndSort(varName, "state", "==", "California", false, 100, documentId);
        return ret;
    }
    
    //Download the CSV file from here ... https://github.com/nytimes/covid-19-data and then upload to your File Storage in DevScore (https://app.devscore.dev/filestorage)
    const filePath = await downloadCSVFileFromFileStorage('us-states.csv');
    let dataArray = await loadCSVFile(filePath);
    const varName = 'covid19';
    const documentId = 'covid19Doc';
    let storeToDBResponse = await storeRowsToDB(varName, dataArray, documentId);
    // let californiaStats = await getStatsForCalifornia(varName, documentId);
    // _context.logger('debug', {'res': JSON.stringify(californiaStats)});
    return true;
}
main().catch((error) => {
    return error;
});

