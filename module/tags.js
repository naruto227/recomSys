/**
 * Created by Michael Allan on.
 */
var mysql = require('mysql'),
    config = require('../config'),
    conn = mysql.createConnection(config.db);

exports.getTagId = function (tag, callback) {
    var id = 0;
    var sql = 'SELECT id FROM tags WHERE tag = ' + "'" + tag + "'" + ';';
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        } else {
            id = rows["0"].id;
            return callback(null, id);
        }
    });
};

exports.getTags = function (callback) {
    var sql = 'SELECT * FROM tags LIMIT 0,34';
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        } else {
            return callback(null, rows);
        }
    });
};

exports.addTag = function (tag, callback) {
    var sql = 'insert into tags (tag, sort) values ?';
    var values = [];
    var info = [tag, 4];
    values.push(info);
    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        return callback(null);
    });
};

//依据id查找标签
exports.findTag = function (id, callback) {
    var sql = "SELECT `tag` FROM `tags` where `id` = " + id;
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, rows['0'].tag);
        }
    });
};
/*
 function Tags(tag) {
 this.tag = tag;
 }

 module.exports = Tags;

 Tags.prototype.tagId = function (callback) {
 var sql = 'SELECT id FROM tags WHERE tag = '  + "'" + this.tag + "'" + ';';
 conn.query(sql,function (err, rows) {
 if (err) {
 callback(err);//错误，返回 err 信息
 }else {
 callback(null, rows["0"].id);/!*rows["0"].id*!/;
 }
 });
 };*/
