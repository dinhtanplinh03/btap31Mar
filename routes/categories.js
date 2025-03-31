var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/category');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Lấy danh sách danh mục (không yêu cầu đăng nhập)
router.get('/', async function (req, res) {
  try {
    let categories = await categorySchema.find({});
    res.status(200).send({ success: true, data: categories });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Lấy danh mục theo ID (không yêu cầu đăng nhập)
router.get('/:id', async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo danh mục (chỉ mod)
router.post('/', authenticate, authorize(['mod']), async function (req, res) {
  try {
    let newCategory = new categorySchema({ name: req.body.name });
    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// Cập nhật danh mục (chỉ mod)
router.put('/:id', authenticate, authorize(['mod']), async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ success: false, message: 'Danh mục không tồn tại' });
    }
    category.name = req.body.name || category.name;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// Xóa danh mục (chỉ admin)
router.delete('/:id', authenticate, authorize(['admin']), async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ success: false, message: 'Danh mục không tồn tại' });
    }
    category.isDeleted = true;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;
