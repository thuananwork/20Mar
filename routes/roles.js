var express = require("express");
var router = express.Router();
let roleController = require("../controllers/roles");
var { CreateSuccessRes, CreateErrorRes } = require("../utils/ResHandler");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
let constants = require("../utils/constants");

// GET all roles: Không yêu cầu quyền
router.get("/", async function (req, res, next) {
  try {
    let roles = await roleController.GetAllRole();
    CreateSuccessRes(res, 200, roles);
  } catch (error) {
    next(error);
  }
});

// GET role by ID: Không yêu cầu quyền
router.get("/:id", async function (req, res, next) {
  try {
    let role = await roleController.GetRoleById(req.params.id);
    CreateSuccessRes(res, 200, role);
  } catch (error) {
    next(error);
  }
});

// POST: Chỉ cho phép 'admin' tạo role mới
router.post(
  "/",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let newRole = await roleController.CreateRole(req.body.name);
      CreateSuccessRes(res, 200, newRole);
    } catch (error) {
      next(error);
    }
  }
);

// PUT: Chỉ cho phép 'admin' sửa role
router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let role = await roleController.GetRoleById(req.params.id);
      if (!role) {
        return res.status(404).send({
          success: false,
          message: "Role không tồn tại.",
        });
      }
      role.name = req.body.name || role.name;
      await role.save();
      CreateSuccessRes(res, 200, role);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE: Chỉ cho phép 'admin' xóa role
router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    try {
      let role = await roleController.GetRoleById(req.params.id);
      if (!role) {
        return res.status(404).send({
          success: false,
          message: "Role không tồn tại.",
        });
      }
      await role.remove();
      CreateSuccessRes(res, 200, { message: "Role đã bị xóa." });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
