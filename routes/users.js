var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
var { CreateSuccessRes, CreateErrorRes } = require("../utils/ResHandler");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
let constants = require("../utils/constants");

// GET all users: Chỉ cho phép 'mod'
router.get(
  "/",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async function (req, res, next) {
    try {
      let users = await userController.GetAllUser();
      CreateSuccessRes(res, 200, users);
    } catch (error) {
      next(error);
    }
  }
);

// GET user by ID: Chỉ cho phép 'mod' (trừ ID của chính user)
router.get(
  "/:id",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async function (req, res, next) {
    try {
      let userId = req.params.id;
      if (userId === req.user._id.toString()) {
        return res.status(403).send({
          success: false,
          message: "Không thể lấy thông tin của chính bạn",
        });
      }
      let user = await userController.GetUserById(userId);
      CreateSuccessRes(res, 200, user);
    } catch (error) {
      next(error);
    }
  }
);

// POST: Chỉ cho phép 'admin' tạo user mới
router.post(
  "/",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let body = req.body;
      let newUser = await userController.CreateAnUser(
        body.username,
        body.password,
        body.email,
        body.role
      );
      CreateSuccessRes(res, 200, newUser);
    } catch (error) {
      next(error);
    }
  }
);

// PUT: Chỉ cho phép 'admin' cập nhật user
router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let updateUser = await userController.UpdateUser(req.params.id, req.body);
      CreateSuccessRes(res, 200, updateUser);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE: Chỉ cho phép 'admin' xóa user
router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let user = await userController.DeleteUser(req.params.id);
      CreateSuccessRes(res, 200, user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
