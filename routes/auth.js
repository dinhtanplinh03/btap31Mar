var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
let { check_authentication } = require("../utils/check_auth");
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ success: false, message: "Thiếu username hoặc password" });
        }

        let user = await userControllers.checkLogin(username, password);
        if (!user) {
            return res.status(401).send({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        let token = jwt.sign({ id: user.id }, constants.SECRET_KEY, { expiresIn: '1h' });

        res.status(200).send({ success: true, token });
    } catch (error) {
        next(error);
    }
});

router.post('/signup', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send({ success: false, message: "Thiếu thông tin đăng ký" });
        }

        let newUser = await userControllers.createAnUser(username, password, email, 'user');
        res.status(201).send({ success: true, data: newUser });
    } catch (error) {
        next(error);
    }
});

// Áp dụng middleware kiểm tra đăng nhập cho tất cả route từ đây trở xuống
router.use(check_authentication);

router.get('/me', async function (req, res, next) {
    try {
        res.send({ success: true, data: req.user });
    } catch (error) {
        next(error);
    }
});

router.post('/changepassword', async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        if (!oldpassword || !newpassword) {
            return res.status(400).send({ success: false, message: "Thiếu mật khẩu cũ hoặc mới" });
        }

        let user = await userControllers.changePassword(req.user.id, oldpassword, newpassword);
        if (!user) {
            return res.status(401).send({ success: false, message: "Mật khẩu cũ không đúng" });
        }

        res.send({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
