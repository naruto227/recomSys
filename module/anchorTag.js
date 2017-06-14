/**
 * Created by Michael Allan.
 */
var mysql = require('mysql'),
    config = require('../config'),
    conn = mysql.createConnection(config.db);

//插入主播标签信息
exports.anchorTag = function (ids, callback) {
    var anchor_id = ids[3];
    var tag_id1 = ids[0];
    var tag_id2 = ids[1];
    var tag_id3 = ids[2];
    var values = [];
    values.push([anchor_id, tag_id1]);
    values.push([anchor_id, tag_id2]);
    values.push([anchor_id, tag_id3]);

    var sql = 'insert into anchor_tag (anchor_id, tag_id) values ?';

    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        } else {
            return callback(null);
        }
    });
};

//查找主播标签id
exports.findAnchorId = function (id, callback) {
    var sql1 = "SELECT `tag_id` FROM `anchor_tag` where `anchor_id` = " + id;
    conn.query(sql1, function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, rows);
        }
    });
};

