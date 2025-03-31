var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, 'i');
  }
  result.price = {};
  if (query.price) {
    result.price.$gte = query.price.$gte ? Number(query.price.$gte) : 0;
    result.price.$lte = query.price.$lte ? Number(query.price.$lte) : 10000;
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// Lấy danh sách sản phẩm (không yêu cầu đăng nhập)
router.get('/', async function (req, res) {
  try {
    let products = await productSchema.find(BuildQuery(req.query)).populate({ path: 'category', select: 'name' });
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Lấy chi tiết sản phẩm theo ID (không yêu cầu đăng nhập)
router.get('/:id', async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo sản phẩm (chỉ mod)
router.post('/', authenticate, authorize(['mod']), async function (req, res) {
  try {
    let { name, price, quantity, category } = req.body;
    let getCategory = await categorySchema.findOne({ name: category });
    if (!getCategory) {
      return res.status(404).send({ success: false, message: 'Danh mục không hợp lệ' });
    }
    let newProduct = new productSchema({ name, price: price || 0, quantity: quantity || 0, category: getCategory._id });
    await newProduct.save();
    res.status(200).send({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// Cập nhật sản phẩm (chỉ mod)
router.put('/:id', authenticate, authorize(['mod']), async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    Object.assign(product, req.body);
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// Xóa sản phẩm (chỉ admin)
router.delete('/:id', authenticate, authorize(['admin']), async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    product.isDeleted = true;
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;
