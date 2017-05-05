/**
 * Created by lixuc on 2017/5/2.
 */
var express = require("express");
var config = require("../modules/configuration");
var User = require("../modules/user");
var Profile = require("../modules/profile");
var Chain = require("../modules/chain");

var router = express.Router();

router.post("/login", function(req, res) {
    var user = new User();
    user.validate(req.body.username, req.body.password).then(function(result) {
        return user.account(result.apikey);
    }).then(function(result) {
        var userInfo = {
            username: result.username,
            apikey: result.apikey,
            isActivated: result.isActivated
        };
        //将用户的blue points保存到session中，有效期24小时
        req.session.balance = result.balance;
        //将用户信息保存到cookie，如果remember me，保存一年
        if (req.body.rememberme == "true") {
            res.cookie(config.cookieName, JSON.stringify(userInfo), {
                maxAge: 365*24*60*60*1000
            });
        } else {
            res.cookie(config.cookieName, JSON.stringify(userInfo));
        }
        res.json(Object.assign(userInfo, { success: true }));
    }).catch(function(err) {
        res.json(err);
    });
});
router.post("/register", function(req, res) {
    var user = new User();
    user.register(req.body.username, req.body.password).then(function(result) {
        return user.account(result.apikey);
    }).then(function(result) {
        var userInfo = {
            username: result.username,
            apikey: result.apikey,
            isActivated: result.isActivated
        };
        //将用户的blue points保存到session中，有效期24小时
        req.session.balance = result.balance;
        //将用户信息暂存到cookie
        res.cookie(config.cookieName, JSON.stringify(userInfo));
        res.json(Object.assign(userInfo, { success: true }));
    }).catch(function(err) {
        res.json(err);
    });
});
router.get("/:apikey/profile", function(req, res) {
    var profile = new Profile(req.params.apikey);
    profile.load().then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.post("/:apikey/profile/update", function(req, res) {
    var profile = new Profile(req.params.apikey);
    profile.update(req.body.name,
                   req.body.email,
                   req.body.bio,
                   req.body.url,
                   req.body.location)
    .then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.get("/:apikey/chain/list", function(req, res) {
    var chain = new Chain(req.params.apikey);
    chain.list(req.query.page).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.post("/:apikey/chain/apply", function(req, res) {
    var chain = new Chain(req.params.apikey);
    chain.apply(req.body.name,
                req.body.description,
                req.body.plugin,
                req.body.mode,
                req.body.size)
    .then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.post("/:apikey/chain/:id/edit", function(req, res) {
    var chain = new Chain(req.params.apikey);
    chain.edit(req.params.id, req.body.name, req.body.description).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.post("/:apikey/chain/:id/release", function(req, res) {
    var chain = new Chain(req.params.apikey);
    chain.release(req.params.id).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
router.get("/chain/:id/operate", function(req, res) {
    var chain = new Chain();
    chain.operate(req.params.id, req.query.action).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        res.json(err);
    });
});
module.exports = router;