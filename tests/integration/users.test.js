const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { User } = require("../../models/user");

describe("/api/users", () => {
  let userId;
  let payload;

  function exec() {
    return request(app).post("/api/users").send(payload);
  }

  const createUser = () => {
    const user = new User({
      _id: userId,
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
    return user.register();
  };

  beforeEach(async () => {
    userId = mongoose.Types.ObjectId();

    payload = {
      name: "12345",
      email: "demo2@gmail.com",
      password: "123456",
    };
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should work", async () => {
    await createUser();
    const userInDb = await User.findOne({ _id: userId });
    expect(userInDb).not.toBeNull();
  });

  it("should return 400 if input is invalid", async () => {
    delete payload.name;
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if user is already registered ", async () => {
    await createUser();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if request is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return the user if input is valid", async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["id", "name", "email"])
    );
  });
});
