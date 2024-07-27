const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "Email is not registered!";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "Password is incorrect!";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = "Email already exists";
    delete errors.password;
    return errors;
  }

  // validation errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 60 * 60 * 24 * 3;
const createToken = (id) => {
  return jwt.sign({ id }, "jijimzi74gfit02725fjj", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("auth/signup");
};

module.exports.signin_get = (req, res) => {
  res.render("auth/signin");
};

module.exports.signup_post = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });

    // res.status(201).json({
    //   success: true,
    //   message: "User registered successfully",
    //   data: user,
    // });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.signin_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signin(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
