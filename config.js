/**
 * config
 */
var path = require('path');

var config = {
    // debug 为 true 时，用于本地调试
    debug: true,
    cookieSecret: 'session_cookie_recommendSystem',
    address: 'http://localhost:3000/',
    upload: {
        path: path.join(__dirname, 'public/images/'),
        url: '/public/upload/',
        absolute: path.join(__dirname, 'public/'),
        uploadurl: 'http://120.27.94.166:2999/'
    },

    sitesetting: ['huajiao', 'laifeng', 'longzhu', 'ingkee'],//'sixrooms',
    // host:"from 121.42.176.30",
    host: "from 192.168.199.233s",

    /*db: {
     host: 'localhost',
     user: 'root',
     password: 'root',
     database: 'douyu',
     port: 3306
     }*/
    db:{
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'recommend',
        port: 3306
    }

};


module.exports = config;