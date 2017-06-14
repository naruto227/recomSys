/**
 * Created by Michael Allan.
 */
var mysql = require('mysql'),
    config = require('../config'),
    conn = mysql.createConnection(config.db);
var anchorTag = require('./anchorTag');
var Tags = require('./tags');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.reg_time = user.reg_time;
}

module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
//    要存入数据库的用户信息
    var name = this.name,
        password = this.password,
        email = this.email,
        phone = this.phone,
        role = this.role,
        reg_time = this.reg_time;

    var values = [];
    var user = [name, password, email, phone, role, reg_time];
    values.push(user);

    var sql = 'INSERT INTO users (name, password, email, phone, role, reg_time) VALUES ?';

    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        callback(null);
    });
};

User.getMaxId = function (tablename, callback) {
    var sql = 'SELECT id FROM ' + tablename + ' WHERE id = (select max(id) from ' + tablename + ')';
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        } else {
            callback(null, rows["0"].id);
        }
    });
};
//读取用户信息
User.get = function (name, callback) {
    var sql = 'SELECT * FROM users where name = ' + "'" + name + "'" + ';';
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, rows);
        }
    });
};

//依据标签获得主播信息
User.getByTag = function (tagId, callback) {
    //SELECT `users`.`id`, `users`.`name`,`users`.`email`,`users`.`phone`,`users`.`reg_time`,`tags`.`tag` FROM `users` join `anchor_tag` on `users`.`id` = `anchor_tag`.`anchor_id` join `tags` on `anchor_tag`.`tag_id` = `tags`.`id` where `tags`.`id` = 2
    var sql = 'SELECT users.* FROM anchor_tag join users on anchor_tag.anchor_id = users.id where anchor_tag.tag_id = ' + tagId;
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                rows[i].tags = [];
                var tags = [];
                anchorTag.findAnchorId(rows[i].id, function (err, info) {
                    if (err) {
                        return callback(err);
                    } else {
                        //info["0"].tag_id
                        for (var j = 0; j < info.length; j++) {
                            Tags.findTag(info[j].tag_id, function (err, tag_info) {
                                if (err) {
                                    return callback(err);
                                } else {
                                    tags.push(tag_info);
                                }
                            });
                        }
                        // rows[i].tags.push(tags);
                    }
                });
            }
            return callback(null, rows);
        }
    });
};