// utils/check_auth.js
let jwt = require("jsonwebtoken");
let constants = require("../utils/constants");
let userController = require("../controllers/users");

module.exports = {
  // Middleware kiểm tra xác thực người dùng
  check_authentication: async function (req, res, next) {
    // Kiểm tra nếu không phải là yêu cầu cần đăng nhập, bỏ qua middleware
    if (req.skipAuth) {
      return next(); // Bỏ qua kiểm tra đăng nhập nếu yêu cầu không cần xác thực
    }

    // Kiểm tra header authorization
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).send({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    let authorization = req.headers.authorization;
    if (authorization.startsWith("Bearer")) {
      let token = authorization.split(" ")[1];
      try {
        let result = jwt.verify(token, constants.SECRET_KEY);
        if (result) {
          let id = result.id;
          let user = await userController.GetUserById(id);
          req.user = user; // Lưu thông tin người dùng vào req.user
          return next(); // Tiếp tục nếu đăng nhập hợp lệ
        }
      } catch (error) {
        return res.status(401).send({
          success: false,
          message: "Token không hợp lệ",
        });
      }
    } else {
      return res.status(401).send({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }
  },

  // Middleware kiểm tra quyền
  check_authorization: function (requiredRole) {
    return function (req, res, next) {
      let role = req.user.role.name;
      if (requiredRole.includes(role)) {
        return next(); // Tiếp tục nếu có quyền
      } else {
        return res.status(403).send({
          success: false,
          message: "Bạn không có quyền",
        });
      }
    };
  },
};
