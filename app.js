//Loading Modules
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParse = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Post");
const Post = mongoose.model("posts");
require("./models/Category");
const Category = mongoose.model("categories");
const users = require("./routes/user");
const passport = require("passport");
require("./config/auth")(passport);

//configurations

//session
app.use(
  session({
    secret: "nodeBlogApp",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//body-parser
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
//midleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp", {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log("Connected to Mongodb!");
  })
  .catch(err => {
    console.log("Erro when connecting to Mongodb" + err);
  });

//public (folder)
app.use(express.static(path.join(__dirname, "public")));

//routes
app.get("/", (req, res) => {
  Post.find()
    .populate("category")
    .sort({ data: "desc" })
    .then(posts => {
      res.render("index", { posts: posts });
    })
    .catch(err => {
      req.flash("error_msg", "Some internal error occurred");
      res.redirect("/404");
    });
});
app.get("/post/:slug", (req, res) => {
  Post.findOne({ slug: req.params.slug })
    .then(post => {
      if (post) {
        res.render("post/index", { post: post });
      } else {
        req.flash("error_msg", "This post doesn't exit");
        res.redirect("/");
      }
    })
    .catch(err => {
      req.flash("error_msg", "Some internal error may occurr");
      res.redirect("/");
    });
});

app.get("/categories/:slug", (req, res) => {
  Category.findOne({ slug: req.params.slug })
    .then(category => {
      if (category) {
        Post.find({ category: category._id })
          .then(posts => {
            res.render("categories/posts", {
              posts: posts,
              category: category
            });
          })
          .catch(err => {
            req.flash("error_msg", "Error occured while listing posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "That category doesn't exist");
        res.redirect("/");
      }
    })
    .catch(err => {
      req.flash(
        "error_msg",
        "Some error occurred while loading this category page"
      );
      res.redirect("/");
    });
});

app.get("/categories", (req, res) => {
  Category.find()
    .then(categories => {
      res.render("categories/index", { categories: categories });
    })
    .catch(err => {
      req.flash(
        "error_msg",
        "Some internal error occurred while listing categories"
      );
      res.redirect("/");
    });
});

app.get("/posts", (req, res) => {
  res.send("List of posts");
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.use("/admin", admin);
app.use("/users", users);

//others
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Server working properly");
});
