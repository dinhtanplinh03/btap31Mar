var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
let { check_authentication, check_authorization } = require("../utils/check_auth");

/* GET roles - Không yêu cầu quyền và đăng nhập */
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({ success: true, data: roles });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

/* POST roles - Chỉ admin được phép */
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    if (!body.name) {
      return res.status(400).send({ success: false, message: "Tên role không được để trống" });
    }
    let newRole = new roleSchema({ name: body.name });
    await newRole.save();
    res.status(201).send({ success: true, data: newRole });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
