var userSchema = require("../schemas/user");
var bcrypt = require("bcrypt");
let roleController = require("../controllers/roles");

module.exports = {
  // Lấy tất cả người dùng
  GetAllUser: async () => {
    return await userSchema.find({}).populate("role");
  },

  // Lấy người dùng theo ID
  GetUserById: async (id) => {
    return await userSchema.findById(id).populate("role");
  },

  // Tạo một người dùng mới
  CreateAnUser: async (username, password, email, role) => {
    let GetRole = await roleController.GetRoleByName(role);
    if (GetRole) {
      let newUser = new userSchema({
        username: username,
        password: password,
        email: email,
        role: GetRole._id,
      });
      return await newUser.save();
    } else {
      throw new Error("Role không hợp lệ.");
    }
  },

  // Cập nhật thông tin người dùng
  UpdateUser: async function (id, body) {
    let allowFields = ["password", "email", "imgURL"];
    let user = await userSchema.findById(id);
    if (user) {
      for (const key of Object.keys(body)) {
        if (allowFields.includes(key)) {
          user[key] = body[key];
        }
      }
      return await user.save();
    }
  },

  // Xóa người dùng (đặt trạng thái `status = false`)
  DeleteUser: async function (id) {
    let user = await userSchema.findById(id);
    if (user) {
      user.status = false;
      return await user.save();
    }
  },

  // Đăng nhập người dùng
  Login: async function (username, password) {
    let user = await userSchema.findOne({
      username: username,
    });
    if (!user) {
      throw new Error("Tài khoản hoặc mật khẩu không đúng.");
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      } else {
        throw new Error("Tài khoản hoặc mật khẩu không đúng.");
      }
    }
  },
};
