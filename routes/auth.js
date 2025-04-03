var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
var { CreateSuccessRes, CreateErrorRes } = require("../utils/ResHandler");
let jwt = require("jsonwebtoken");
let constants = require("../utils/constants");
let { check_authentication } = require("../utils/check_auth");
let bcrypt = require("bcrypt");

/* Login route: yêu cầu đăng nhập */
router.post("/login", async function (req, res, next) {
  try {
    let body = req.body;
    let username = body.username;
    let password = body.password;
    let result = await userController.Login(username, password);
    let token = jwt.sign(
      {
        id: result._id,
        expire: new Date(Date.now() + 24 * 3600 * 1000),
      },
      constants.SECRET_KEY
    );
    CreateSuccessRes(res, 200, token);
  } catch (error) {
    next(error);
  }
});

/* Signup route: yêu cầu đăng nhập */
router.post("/signup", async function (req, res, next) {
  try {
    let body = req.body;
    let username = body.username;
    let password = body.password;
    let email = body.email;
    let result = await userController.CreateAnUser(
      username,
      password,
      email,
      "user"
    );
    let token = jwt.sign(
      {
        id: result._id,
        expire: new Date(Date.now() + 24 * 3600 * 1000),
      },
      constants.SECRET_KEY
    );
    CreateSuccessRes(res, 200, token);
  } catch (error) {
    next(error);
  }
});

/* Me route: không yêu cầu xác thực */
router.get("/me", async function (req, res, next) {
  // Không cần xác thực, trực tiếp trả về thông tin người dùng đã đăng nhập
  CreateSuccessRes(res, 200, req.user);
});

/* Change password: yêu cầu đăng nhập */
router.post(
  "/changepassword",
  check_authentication,
  async function (req, res, next) {
    let body = req.body;
    let oldpassword = body.oldpassword;
    let newpassword = body.newpassword;

    // So sánh mật khẩu cũ với mật khẩu trong database
    if (bcrypt.compareSync(oldpassword, req.user.password)) {
      let user = req.user;
      user.password = newpassword;
      await user.save();
      CreateSuccessRes(res, 200, user);
    } else {
      next(new Error("Mật khẩu cũ không đúng"));
    }
  }
);

module.exports = router;
