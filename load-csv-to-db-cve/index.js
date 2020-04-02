
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
            
    let loadCSVFile = (filePath) => {
        if (!filePath || typeof filePath != "string") return null;
        return new Promise((resolve, reject) => { 
            let csv = _context.fileLib.getCSVParserInstance();
            let stream = _context.fileLib.getFileReadStreamInstance(filePath);
            let rows = [];
            // replace "/" in CSV file header with "--" because you cannot have "*~/[]" in the fields
            stream.pipe(csv.parse({
                headers: headers => headers.map(h => h.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '--')),
            })).on('error', (error) => {
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

    //querty the db for any record that was published on a specific date. 2020-01-08 in this example. 
    let getDataForDate = async (varName, cveDate, documentId) => {
        const ret = await _context.dbLib.getTableRowsWithFilterAndSort(varName, "Notes--Note--1--__text", "==", cveDate, false, 100, documentId);
        return ret;
    }
    
    const filePath = await downloadCSVFileFromFileStorage('2020CVE-Data.csv');
    const dataArray = await loadCSVFile(filePath);
    const varName = '2020CVE-Data';
    const documentId = '2020CVE-DataDoc';
    const cveDate = '2020-01-08';
    const storeToDBResponse = await storeRowsToDB(varName, dataArray, documentId);
    const cveDataforDate = await getDataForDate(varName, cveDate, documentId);
    await _context.logger('debug', {'res': JSON.stringify(cveDataforDate)});
    return true;
}
main().catch((error) => {
    return error;
});
