var express = require("express");
var router = express.Router();
let productModel = require("../schemas/product");
let categoryModel = require("../schemas/category");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");

// GET: Không yêu cầu đăng nhập
router.get("/", async function (req, res, next) {
  try {
    let products = await productModel.find({}).populate("category");
    res.status(200).send({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    let product = await productModel
      .findById(req.params.id)
      .populate("category");
    if (product) {
      res.status(200).send({
        success: true,
        data: product,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy sản phẩm với ID này.",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Lỗi khi tìm sản phẩm.",
    });
  }
});

// POST: Chỉ cho phép 'mod' tạo sản phẩm
router.post(
  "/",
  check_authentication,
  check_authorization(["mod"]),
  async function (req, res, next) {
    try {
      let cate = await categoryModel.findOne({ name: req.body.category });
      if (!cate) {
        return res.status(404).send({
          success: false,
          message: "Danh mục không tồn tại.",
        });
      }

      let newProduct = new productModel({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        category: cate._id,
      });

      await newProduct.save();
      res.status(200).send({
        success: true,
        data: newProduct,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// PUT: Chỉ cho phép 'mod' sửa sản phẩm
router.put(
  "/:id",
  check_authentication,
  check_authorization(["mod"]),
  async function (req, res, next) {
    try {
      let updateObj = {};
      if (req.body.name) updateObj.name = req.body.name;
      if (req.body.price) updateObj.price = req.body.price;
      if (req.body.quantity) updateObj.quantity = req.body.quantity;
      if (req.body.category) {
        let cate = await categoryModel.findOne({ name: req.body.category });
        if (!cate) {
          return res.status(404).send({
            success: false,
            message: "Danh mục không tồn tại.",
          });
        }
        updateObj.category = cate._id;
      }

      let updatedProduct = await productModel.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).send({
          success: false,
          message: "Sản phẩm không tồn tại.",
        });
      }

      res.status(200).send({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE: Chỉ cho phép 'admin' xóa sản phẩm
router.delete(
  "/:id",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    try {
      let product = await productModel.findById(req.params.id);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Sản phẩm không tồn tại.",
        });
      }

      let deletedProduct = await productModel.findByIdAndDelete(req.params.id);
      res.status(200).send({
        success: true,
        message: "Sản phẩm đã bị xóa.",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
