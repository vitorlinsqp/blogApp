const express = require("express");
const router = express.Router();
const mongoogse = require("mongoose");
require("../models/User");
const User = mongoogse.model("users");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", (req, res) => {
  var errs = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    errs.push({ text: "Invalid Name" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    errs.push({ text: "Invalid Email" });
  }
  if (
    !req.body.password ||
    typeof req.body.password == undefined ||
    req.body.password == null
  ) {
    errs.push({ text: "Invalid Password" });
  }

  if (req.body.password.length < 4) {
    errs.push({ text: "Too short password" });
  }

  if (req.body.password != req.body.password2) {
    errs.push({ text: "Password doesn't match. Please try again." });
  }

  if (errs.length > 0) {
    res.render("users/register", { errs: errs });
  } else {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash("error_msg", "Email already registered in our system");
          res.redirect("/users/register");
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                req.flash("error_msg", "Error occurred while saving User");
                res.redirect("/");
              }

              newUser.password = hash;
              newUser
                .save()
                .then(() => {
                  req.flash("success_msg", "New User succesfully created");
                  res.redirect("/");
                })
                .catch(err => {
                  req.flash(
                    "error_msg",
                    "An error occurr while creating new user, try again"
                  );
                  res.redirect("/users/register");
                });
            });
          });
        }
      })
      .catch(err => {
        req.flash("error_msg", "Internal Error");
        res.redirect("/register");
      });
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

module.exports = router;
