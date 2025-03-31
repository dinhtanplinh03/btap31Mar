var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/users');
let { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

/* GET all users (chỉ mod được phép, trừ id của chính user) */
router.get('/', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    let users = await userControllers.getAllUsers(req.user.id);
    res.send({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

/* GET user by ID (chỉ mod được phép, trừ id của chính user) */
router.get('/:id', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(403).send({ success: false, message: "Không thể xem thông tin chính mình." });
    }
    let user = await userControllers.getUserById(req.params.id);
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/* POST - Tạo user (chỉ admin) */
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userControllers.createAnUser(body.username, body.password, body.email, body.role);
    res.status(200).send({ success: true, message: newUser });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

/* PUT - Cập nhật user (chỉ admin) */
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let updatedUser = await userControllers.updateAnUser(req.params.id, req.body);
    res.status(200).send({ success: true, message: updatedUser });
  } catch (error) {
    next(error);
  }
});

/* DELETE - Xóa user (chỉ admin) */
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let deleteUser = await userControllers.deleteAnUser(req.params.id);
    res.status(200).send({ success: true, message: deleteUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
