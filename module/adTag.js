/**
 * Created by Michael Allan.
 * 广告标签
 */
var mysql = require('mysql'),
    config = require('../config'),
    conn = mysql.createConnection(config.db);

//添加广告标签
exports.addAdTag = function (ad_id, tags_id, callback) {
    var id = ad_id;
    var tag_array = tags_id;
    var values = [];
    for (var i = 0; i < tag_array.length; i++) {
        values.push([id, tag_array[i]]);
    }

    var sql = 'insert into ad_tag (ad_id, tag_id) values ?';

    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        return callback(null);
    });
};
