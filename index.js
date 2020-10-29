var makeworkbook = require("./excel/workbookcreation");

var argv = require('minimist')(process.argv.slice(2));

var dbconfig = {
    host: argv.h,
    user: argv.u,
    password: argv.p,
    database: argv.d
}

makeworkbook.createWorkbook(argv.c, dbconfig);