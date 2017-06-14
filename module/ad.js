/**
 * Created by Michael Allan on.
 */
var mysql = require('mysql'),
    config = require('../config'),
    conn = mysql.createConnection(config.db);

/**
 *
 * @param ads 广告信息
 * @constructor
 */
function Ad(ads) {
    this.advertiser_id = ads.advertiser_id;
    this.pay = ads.pay;
    this.pic = ads.pic;
    this.remark = ads.remark;
    //this.status = ads.status;
    this.release_time = ads.release_time;
}

module.exports = Ad;
//存储广告信息
Ad.prototype.save = function (callback) {
    var advertiser_id = this.advertiser_id,
        pay = this.pay,
        pic = this.pic,
        remark = this.remark,
        release_time = this.release_time;

    var values = [];
    var info = [advertiser_id, pay, pic, remark, release_time];
    values.push(info);

    var sql = 'INSERT INTO bid_ad (advertiser_id, pay, pic, remark, release_time) VALUES ?';

    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        callback(null);
    });
};

//添加广告标签
Ad.addAdTag = function (ad_id, tags_id, callback) {
    var id = ad_id;
    var tag_array = tags_id;
    var values = [];
    for (var i = 0; i < tag_array.length; i++) {
        values.push([id, tag_array[i]]);
    }

    var sql = 'insert into ad_tag (advertiser_id, tags_id) values ?';

    conn.query(sql, [values], function (err) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        return callback(null);
    });
};

//依据标签搜索广告
Ad.getByTag = function (tagId, callback) {
    var sql = "select `bid_ad`.* from `ad_tag` join `bid_ad` on `ad_tag`.`ad_id` = `bid_ad`.`id` where `ad_tag`.`tag_id` = " + tagId;
    conn.query(sql, function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, rows);
        }
    });
};