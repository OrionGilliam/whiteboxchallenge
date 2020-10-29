const mysql = require("mysql2");

let conn = null;

async function getClientDeliveries(clientId, shippingSpeed, callback) {
    conn.execute('SELECT DISTINCT zone from rates WHERE client_id = ? AND shipping_speed = ?', [clientId, shippingSpeed], function (error, results) {
        if (error) {
            callback(error);
        } else if (results.length > 0) {
            constructZones(results.map(zone => zone.zone), clientId, shippingSpeed, callback);
        }
    })
}

function constructZones(zones, clientId, shippingSpeed, callback) {
    let querySums = '';
    for (const zone of zones) {
        querySums += 'SUM(CASE WHEN zone = \'' + zone + '\' THEN rate END) \'Zone ' + zone + '\','
    }
    const query = 'SELECT start_weight as \'Start Weight\', end_weight as \'End Weight\', ' + querySums.slice(0, -1) + ' FROM rates WHERE client_id = ? AND shipping_speed = ? GROUP BY start_weight, end_weight';
    conn.execute(query, [clientId, shippingSpeed], function (error, results) {
        if (error) {
            callback(error)
        } else {
            callback(results)
        }
    })
}

module.exports = {

    setConnection: function (config) {
        conn = mysql.createConnection(config);
        conn.connect((err) => {
            if (err) throw err;
            console.log("connection established");
        })
    },

    clientDeliveryQuery: function (clientId, shippingSpeed) {
        return new Promise(resolve =>
            getClientDeliveries(clientId, shippingSpeed, (res) => {
                resolve(res)
            })
        )
    },

    close: function(){
        conn.close();
    }
};
