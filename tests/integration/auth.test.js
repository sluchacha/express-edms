const request = require("supertest");
const { User } = require("../../models/user");
const app = require("../../app");

describe("auth middleware", () => {
  let token;
  const exec = () => {
    return request(app)
      .get("/api/users/me")
      .set("x-auth-token", token)
      .send({});
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});

describe("/api/auth", () => {
  let payload;

  const exec = () => {
    return request(app).post("/api/auth").send(payload);
  };

  const createUser = () => {
    return new User({
      name: "12345",
      email: payload.email,
      password: payload.password,
    }).register();
  };

  beforeEach(async () => {
    await User.deleteMany({});

    payload = { email: "user1@gmail.com", password: "123456" };
    await createUser();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("Should return 400 if email is not provided", async () => {
    delete payload.email;
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("Should return 400 if password is not provided", async () => {
    delete payload.password;
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("Should return 400 if email is more than 255 characters", async () => {
    payload.email = new Array(255).join("a") + "@gmail.com";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if email is not found", async () => {
    payload.email = "notindb@gmail.com";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if password is not found", async () => {
    payload.password = "654321";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if input is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return a valid token if input is valid", async () => {
    const res = await exec();
    expect(res.text).toBeDefined();
    // expect(res.header("x-auth-token")).toBe(1);
  });
});
