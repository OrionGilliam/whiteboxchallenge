const xl = require('excel4node');
const dbcon = require('../databaseconnection/dbconnection');

const shippingSpeed = {
    STANDARD: 'standard',
    EXPEDITED: 'expedited',
    NEXTDAY: 'nextDay',
    INTERNATIONALECONOMY: 'intlEconomy',
    INTERNATIONALEXPEDITED: 'intlExpedited',
};

function constructWorkbook(rows) {
    let wb = new xl.Workbook();
    let stdWS = wb.addWorksheet("Domestic Standard Rates");
    let expWS = wb.addWorksheet("Domestic Expedited Rates");
    let ndWS = wb.addWorksheet("Domestic Next Day Rates");
    let ieWS = wb.addWorksheet("International Economy Rates");
    let iexWS = wb.addWorksheet("International Expedited Rates");

    applyRows(stdWS, rows.standard);
    applyRows(expWS, rows.expedited);
    applyRows(ndWS, rows.nextDay);
    applyRows(ieWS, rows.intlEconomy);
    applyRows(iexWS, rows.intlExpedited);

    wb.write("output.xlsx");
    dbcon.close()

}

function applyRows(sheet, rows) {
    const fields = Object.keys(rows[0]);
    for (let i = 0; i < fields.length; i++) {
        sheet.cell(1, i+1).string(fields[i])
    }

    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < fields.length; j++) {
            sheet.cell(i + 2, j+1).string(rows[i][fields[j]])
        }
    }
}

module.exports = {
    createWorkbook: async function (clientid, dbconfig) {
        dbcon.setConnection(dbconfig);
        const shippingRows = {
            standard: [],
            expedited: [],
            nextDay: [],
            intlEconomy: [],
            intlExpedited: [],
        };

        for (const prop in shippingSpeed) {
            shippingRows[shippingSpeed[prop]] = await dbcon.clientDeliveryQuery(clientid, shippingSpeed[prop]);
        }

        constructWorkbook(shippingRows);

    }
};


/*
queries to use:
SELECT shipping_speed, start_weight, end_weight,
SUM(CASE WHEN zone = '1' THEN rate END) 'Zone 1',
SUM(CASE WHEN zone = '2' THEN rate END) 'Zone 2',
SUM(CASE WHEN zone = '3' THEN rate END) 'Zone 3',
SUM(CASE WHEN zone = '4' THEN rate END) 'Zone 4',
SUM(CASE WHEN zone = '5' THEN rate END) 'Zone 5',
SUM(CASE WHEN zone = '6' THEN rate END) 'Zone 6',
SUM(CASE WHEN zone = '7' THEN rate END) 'Zone 7',
SUM(CASE WHEN zone = '8' THEN rate END) 'Zone 8'
FROM rates
WHERE client_id = 1240 AND shipping_speed = 'expedited'  GROUP BY start_weight, end_weight


select DISTINCT zone from rates WHERE client_id = 1240 AND shipping_speed = 'expedited'
 */