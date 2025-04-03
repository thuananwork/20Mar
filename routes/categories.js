var express = require("express");
var router = express.Router();
let categoryModel = require("../schemas/category");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");

// GET: Không yêu cầu đăng nhập
router.get("/", async function (req, res, next) {
  try {
    let categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      data: categories,
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
    let category = await categoryModel.findById(req.params.id);
    if (category) {
      res.status(200).send({
        success: true,
        data: category,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục với ID này.",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Lỗi khi tìm danh mục.",
    });
  }
});

// POST: Chỉ cho phép 'mod' tạo danh mục
router.post(
  "/",
  check_authentication,
  check_authorization(["mod"]),
  async function (req, res, next) {
    try {
      let newCategory = new categoryModel({
        name: req.body.name,
      });
      await newCategory.save();
      res.status(200).send({
        success: true,
        data: newCategory,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// PUT: Chỉ cho phép 'mod' sửa danh mục
router.put(
  "/:id",
  check_authentication,
  check_authorization(["mod"]),
  async function (req, res, next) {
    try {
      let updateObj = {};
      if (req.body.name) updateObj.name = req.body.name;

      let updatedCategory = await categoryModel.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).send({
          success: false,
          message: "Danh mục không tồn tại.",
        });
      }

      res.status(200).send({
        success: true,
        data: updatedCategory,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE: Chỉ cho phép 'admin' xóa danh mục
router.delete(
  "/:id",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    try {
      let deletedCategory = await categoryModel.findByIdAndDelete(
        req.params.id
      );
      if (!deletedCategory) {
        return res.status(404).send({
          success: false,
          message: "Danh mục không tồn tại.",
        });
      }

      res.status(200).send({
        success: true,
        message: "Danh mục đã bị xóa.",
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
