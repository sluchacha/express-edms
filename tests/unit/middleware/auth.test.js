const auth = require("../../../middleware/auth");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");

describe.skip("auth middleware", () => {
  it("should populate req.user with the payload of a valid JWT", () => {
    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
      name: "12345",
      email: "demo@gmail.com",
      password: "123456",
    };
    const token = new User(user).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
