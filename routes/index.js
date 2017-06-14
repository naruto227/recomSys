var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var url = require('url');

var User = require('../module/user');
var advertiserTag = require('../module/advertiserTag');
var Tags = require('../module/tags');
var anchorTag = require('../module/anchorTag');
var adTag = require('../module/adTag');
var Ad = require('../module/ad');
var config = require('../config');

var formidable = require('formidable');
// var TITLE = 'formidable上传示例';
/* GET home page. */
/*router.get('/', function (req, res, next) {

    /!*var tags = new Tags('熊猫');
     tags.tagId(function(err,id){
     if (err) {
     return res.json({status: false, 'msg': err});
     }
     console.log(id);
     // res.render('index', {title: 'Express'});
     });*!/
    res.render('index', {title: 'Express'});
});*/

router.get('/', function (req, res, next) {
    if (req.session.user == undefined) {
        return res.sendFile(config.upload.absolute + "login.html");

    }
    else
        return res.sendFile(config.upload.absolute + "test.html");

    //return res.render('http://localhost:3001/login"');
});

router.post('/uploadFile', function (req, res) {

    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = config.upload.path;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    form.parse(req, function (err, fields, files) {

        if (err) {
            /*res.locals.error = err;
             res.render('index', { title: TITLE });
             return;*/
            return res.json({status: false, 'msg': err});
        }

        var extName = '';  //后缀名
        switch (files.fulAvatar.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        if (extName.length == 0) {
            /*res.locals.error = '只支持png和jpg格式图片';
             res.render('index', { title: TITLE });
             return;*/
            return res.json({status: false, 'msg': '只支持png和jpg格式图片'});
        }

        var avatarName = files.fulAvatar.name;
        /*Math.random() + '.' + extName*/
        var filename = avatarName.substr(0, avatarName.lastIndexOf('.'));
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5');
        //Cannot read property 'filename' of undefined
        var imgname = md5.update(filename + String((new Date()).getTime())).digest('hex');
        console.log(imgname);
        var newFileName = imgname + "." + extName;
        var newPath = form.uploadDir + newFileName;

        console.log(newPath);
        fs.renameSync(files.fulAvatar.path, newPath);  //重命名
        res.locals.success = '上传成功';
        // res.render('index', { title: TITLE });
        res.json({status: true, 'msg': '上传成功', 'imgurl': config.address + "images/" + newFileName});
    });
});

/*注册*/
router.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'],
        email = req.body.email,
        phone = req.body.phone,
        role = req.body.role,//0表示广告主，1表示主播
        tags = req.body.tags;//主播的三个标签信息
    //req.body["tags[]"].split(';') 传参：tags[]
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        return res.json({status: false, 'msg': '两次输入的密码不一致!'});
    }
    var ids = tags.split(";");
    var newUser = new User({
        name: name,
        password: password,
        email: email,
        phone: phone,
        role: role,
        reg_time: new Date().getTime()
    });
    //检查用户名是否已经存在
    User.get(name, function (err, user) {
        if (err) {
            return res.json({status: false, 'msg': err});
        }
        if (user.length > 0) {
            return res.json({status: false, 'msg': '用户已存在!'});
        }
        //如果不存在则新增用户
        //获取最新插入的数据 SELECT id FROM `users` WHERE `id` = (select max(`id`) from `users`)
        newUser.save(function (err) {
            if (err) {
                res.json({status: false, 'msg': err});
            }
            //主播注册，添加标签
            if (role) {
                User.getMaxId('users', function (err, id) {
                    if (err) {
                        return res.json({status: false, 'msg': err});
                    }
                    ids.push(id);
                    anchorTag.anchorTag(ids, function (err) {
                        if (err) {
                            return res.json({status: false, 'msg': err});
                        } else {
                            res.json({status: true, 'msg': '注册成功!'});
                        }
                    });
                    /*var str = id + ";" + tags;
                     console.log(str);*/
                });
            }
        })
    });
});

//获得热门标签信息
router.get('/tagInfo', function (req, res) {
    Tags.getTags(function (err, tags) {
        if (err) {
            return res.json({status: false, 'msg': err});
        } else {
            // console.log(tags);
            res.json({status: true, 'msg': tags});
        }
    });
});

router.post('/login', checkNotLogin);//不能用checkNotLogin()，空方法，未传参数
router.post('/login', function (req, res) {
    User.get(req.body.name, function (err, user) {
        if (err) {
            return res.json({status: false, 'msg': err});
        }
        if (user.length == 0) {
            res.json({status: false, 'msg': '用户不存在!'});
        } else {
            //检查密码是否一致
            if (user["0"].password != req.body.password) {    //‘数据表user’的密码与请求的密码对比
                return res.json({status: false, 'msg': '密码错误!'});
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user["0"];
            res.json({status: true, 'msg': '登陆成功!'});
        }
    });
});

router.post('/logout', checkLogin);
router.post('/logout', function (req, res) {
    req.session.user = null;
    res.json({status: true, 'msg': '登出成功!'});
});

/**
 * 文件上传
 * 加入了是否登陆验证
 */
router.post('/upload', checkLogin);
router.post('/upload', multipartMiddleware, function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5');
    //Cannot read property 'filename' of undefined
    var imgname = md5.update(req.files.filename.name + String((new Date()).getTime())).digest('hex');
    var exname = req.files.filename.name.substring(req.files.filename.name.lastIndexOf('.') + 1);
    var des_file = config.upload.path + imgname + "." + exname;
    try {
        fs.readFile(req.files.filename.path + "", function (err, data) {
            fs.writeFile(des_file, data, function (err) {
                var response;
                if (err) {
                    console.log(err);
                } else {
                    response = {
                        status: true,
                        'msg': '上传成功',
                        'imgurl': config.address + "images/" + imgname + "." + exname
                    };
                }
                console.log(response);
                res.end(JSON.stringify(response));
            });
        });
    } catch (e) {
        res.json({status: e.toString()});
    }

    //已经可以做进一步处理 req.files
});


router.post('/uploadfile', checkLogin);
router.post('/uploadfile', multipartMiddleware, function (req, res) {
    var file = req.files.file;
    if (!(file instanceof Array)) {
        file = [file];
    }
    var imageurls = [];
    file.forEach(function (element, index, array) {
        var extension_name = '';
        var type = element.type;
        switch (type) {
            case 'image/pjpeg':
                extension_name = 'jpg';
                break;
            case 'image/jpeg':
                extension_name = 'jpg';
                break;
            case 'image/gif':
                extension_name = 'gif';
                break;
            case 'image/png':
                extension_name = 'png';
                break;
            case 'image/x-png':
                extension_name = 'png';
                break;
            case 'image/bmp':
                extension_name = 'bmp';
                break;
        }
        if (extension_name.length === 0) {
            return res.json({success: false, msg: "上传类型只支持jpg/gif/png/bmp"});
        }
        fs.readFile(element.path, function (err, data) {
            var filename = uuid.v1() + '.' + extension_name;
            var newPath = config.upload.path + filename;
            fs.writeFile(newPath, data, function (err) {
                if (err) {
                    return res.json({success: false, msg: err});
                }
                imageurls.push(filename);
                if (index === (file.length - 1)) {
                    return res.json({success: true, msg: "上传成功", imgurls: imageurls});
                }
            });
        });
    });
});

/**
 * 发布广告
 */
router.post('/postAd', checkLogin);
router.post('/postAd', function (req, res) {
    var advertiser_id = req.session.user.id,//广告主id号
        pay = req.body.pay,//广告价格
        pic = req.body.pic,//广告图
        remark = req.body.remark,//广告备注信息
        //status = req.body.status,//广告是否被接单
        release_time = new Date().getTime(),//广告发布时间
        tags = req.body.tags;//广告标签信息id

    // var tags = req.body["tags[]"];
    var newAd = new Ad({
        advertiser_id: advertiser_id,
        pay: pay,
        pic: pic,
        remark: remark,
        //status: status,
        release_time: release_time
    });

    var tag_array = tags.split(';');
    var length = tag_array.length;

    newAd.save(function (err) {
        if (err) {
            return res.json({status: false, 'msg': err});
        } else {
            User.getMaxId('bid_ad', function (err, id) {
                if (err) {
                    return res.json({status: false, 'msg': err});
                } else {
                    adTag.addAdTag(id, tag_array, function (err) {
                        if (err) {
                            return res.json({status: false, 'msg': err});
                        } else {
                            res.json({status: true, 'msg': '发布广告成功'});
                        }
                    })
                }
            })
        }
    });
});

/**
 * 依据标签搜索主播
 * SELECT `users`.* FROM `anchor_tag` join `users` on `anchor_tag`.anchor_id = `users`.id where `anchor_tag`.tag_id = 2
 * SELECT `users`.*, `tags`.tag FROM `anchor_tag` join `users` on `anchor_tag`.anchor_id = `users`.id join `tags` on `anchor_tag`.tag_id = `tags`.id  where `anchor_tag`.tag_id = 2
 */
router.get('/findanchor', function (req, res) {
    User.getByTag(req.query.tag_id, function (err, info) {
        if (err) {
            return res.json({status: false, 'msg': err});
        } else {
            res.json({status: true, 'msg': info});
        }
    })
});

/**
 * 依据标签搜索广告
 * select `bid_ad`.* from `ad_tag` join `bid_ad` on `ad_tag`.`ad_id` = `bid_ad`.`id` where `ad_tag`.`tag_id` = 4
 */
router.get('/findad', function (req, res) {
    Ad.getByTag(req.query.tag_id, function (err, info) {
        if (err) {
            return res.json({status: false, 'msg': err});
        } else {
            res.json({status: true, 'msg': info});
        }
    });
});

/**
 * 发布广告时添加的标签
 */
router.post('/addtag', function (req, res) {
    Tags.addTag(req.body.tag, function (err) {
        if (err) {
            return res.json({status: false, 'msg': err});
        } else {
            User.getMaxId('tags', function (err, id) {
                if (err) {
                    return res.json({status: false, 'msg': err});
                } else {
                    res.json({status: true, 'msg': '添加成功', 'id': id});
                }
            });
        }
    })
});

function checkLogin(req, res, next) {
    if (!req.session.user) {
        /**
         * 此处要加retrun
         * 不然next（）会继续执行下一条
         */
        //return res.sendFile(config.upload.absolute + "login.html");
        return res.json({status: false, 'msg': '未登录!'});
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session != undefined) {
        if (req.session.user) {
            return res.json({status: false, 'msg': '已登录!'});
        }
    }
    next();
}

module.exports = router;
