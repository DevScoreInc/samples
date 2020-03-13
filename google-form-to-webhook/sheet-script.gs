// Add the follwoing code to your Google Sheet Script Editor (under Tools menu)
// You need to create webhook in DevScore and replace following
//  -- url : to your webhook endpoint
//  -- headers: to your Bearer token header and value 

function Initialize() {
    try {
        var triggers = ScriptApp.getProjectTriggers();
        for (var i in triggers) {
            ScriptApp.deleteTrigger(triggers[i]);
        }
        
        ScriptApp.newTrigger("SubmitGoogleFormData")
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onFormSubmit().create();
    } catch (error) {
        throw new Error("Please add this code in the Google Spreadsheet");
    }
}

function SubmitGoogleFormData(e) {
  if (!e) {
    throw new Error("Please go the Run menu and choose Initialize");
  }
 
  try {
        var
            ss = SpreadsheetApp.getActiveSheet(),      // get the active sheet
            lr = ss.getLastRow(),                        // get the last row
            fn = ss.getRange(lr, 2, 1, 1).getValue(),  // column 2 
            pn = ss.getRange(lr, 3, 1, 1).getValue(),  // column 3 
            em = ss.getRange(lr, 4, 1, 1).getValue(),  // column 4 
            r = ss.getRange(lr, 5, 1, 1).getValue(),   // column 5 
            p = ss.getRange(lr, 6, 1, 1).getValue();   // column 6 

        var payload = {
            "timestamp": String(pn),
            "name": String(fn),
            "email":  String(pn),
            "address": String(em),
            "phone": String(r) ,
            "comment":p,
        }

        var headers = {
            "Authorization" : "#BEARER_TOKEN#"
        };

        var options = {
            'method': 'post',
            "contentType" : "application/json",
            'headers': headers,
            'payload': JSON.stringify(payload),
            'muteHttpExceptions': false
        };
        var url = "#WEBHOOK_ENDPOINT#";
        var response = UrlFetchApp.fetch(url, options);
        Logger.log(JSON.stringify(response));
    } catch (error) {
        Logger.log(error.toString());
    }
}

