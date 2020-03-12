const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
const Category = mongoose.model("categories");
require("../models/Post");
const Post = mongoose.model("posts");
const { isAdmin } = require("../helpers/isAdmin");

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/posts", isAdmin, (req, res) => {
  Post.find()
    .populate("category")
    .sort({ date: "desc" })
    .then(posts => {
      res.render("admin/posts", { posts: posts });
    })
    .catch(err => {
      req.flash("error_msg", "Some error ocurred while listing the posts");
      req.redirect("/admin");
    });
});

router.get("/categories", isAdmin, (req, res) => {
  Category.find()
    .then(categories => {
      res.render("admin/categories", { categories: categories });
    })
    .catch(err => {
      req.flash("error_msg", "An eror occurred while listing categories");
      res.redirect("/admin");
    });
});

router.get("/categories/add", isAdmin, (req, res) => {
  res.render("admin/addcategories");
});

router.post("/categories/new", isAdmin, (req, res) => {
  //manual created validation
  var errs = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    errs.push({ text: "Invalid name" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    errs.push({ text: "Invalid slug" });
  }
  if (req.body.name.length < 2) {
    errs.push({ text: "To short category name" });
  }
  if (errs.length > 0) {
    res.render("admin/addcategories", { errs: errs });
  } else {
    const newCategory = {
      name: req.body.name,
      slug: req.body.slug
    };
    new Category(newCategory)
      .save()
      .then(() => {
        req.flash("success_msg", "Category added!");
        res.redirect("/admin/categories");
      })
      .catch(err => {
        req.flash("error_msg", "Some error occurred :(");
        res.redirect("/admin");
      });
  }
});

router.get("/categories/edit/:id", isAdmin, (req, res) => {
  Category.findOne({ _id: req.params.id })
    .then(category => {
      res.render("admin/editcategories", { category: category });
    })
    .catch(err => {
      req.flash("error_msg", "This Category doesn't exist yet.");
      res.redirect("/admincategories");
    });
});

router.post("/categories/edit", isAdmin, (req, res) => {
  Category.findOne({ _id: req.body.id })
    .then(category => {
      category.name = req.body.name;
      category.slug = req.body.slug;

      category
        .save()
        .then(() => {
          req.flash("success_msg", "Category Successfully Edited! ");
          res.redirect("/admin/categories");
        })
        .catch(err => {
          req.flash("error_msg", "Some mistake happened while saving the file");
          res.redirect("/admin/categories");
        });
    })
    .catch(err => {
      req.flash("error_msg", "Some error occurr while editing Category");
      res.redirect("/admin/categories");
    });
});

router.post("/categories/delete", isAdmin, (req, res) => {
  Category.remove({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Category Deleted!");
      res.redirect("/admin/categories");
    })
    .catch(err => {
      req.flash("error_msg", "Error occurred while deleting Category");
      res.redirect("/admin/categories");
    });
});

router.get("/posts/add", isAdmin, (req, res) => {
  Category.find()
    .then(categories => {
      res.render("admin/addposts", { categories: categories });
    })
    .catch(err => {
      req.flash("error_msg", "Some error may occurr while loading the Form");
      res.redirect("/admin");
    });
});

router.post("/posts/new", isAdmin, (req, res) => {
  var errs = [];
  if (req.body.category == "0") {
    errs.push({ text: "Invalid Category, register a new Category" });
  }
  if (errs.length > 0) {
    Category.find().then(categories => {
      res.render("admin/addpost", { categories, errs });
    });
  } else {
    const newPost = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category
    };

    new Post(newPost)
      .save()
      .then(() => {
        req.flash("success_msg", "Post successfully created");
        res.redirect("/admin/posts");
      })
      .catch(err => {
        req.flash(
          "error_msg",
          "Some error has occurred while saving this Post"
        );
        res.redirect("/admin/posts");
      });
  }
});

router.get("/posts/edit/:id", isAdmin, (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      Category.find()
        .then(categories => {
          res.render("admin/editposts", { categories: categories, post: post });
        })
        .catch(err => {
          req.flash(
            "error_msg",
            "An error has occur while listing categories."
          );
          res.redirect("/admin/post");
        });
    })
    .catch(err => {
      req.flash("error_msg", "Some error occurred while editing the form.");
      res.redirect("/admin/posts");
    });
});

router.post("/post/edit", isAdmin, (req, res) => {
  Post.findOne({ _id: req.body.id })
    .then(post => {
      post.title = req.body.title;
      post.slug = req.body.slug;
      post.description = req.body.description;
      post.content = req.body.content;
      post.category = req.body.category;

      post
        .save()
        .then(() => {
          req.flash("success_msg", "Post successfuly edited");
          res.redirect("/admin/posts");
        })
        .catch(err => {
          req.flash("error_msg", "Intern Error");
          res.redirect("/admin/posts");
        });
    })
    .catch(err => {
      req.flash("error_msg", "An error may occurred while saving edit");
      res.redirect("/admin/posts");
    });
});

//not a safety way to delete because I'm using a GET route.
//Just to practice
router.get("/posts/delete/:id", isAdmin, (req, res) => {
  Post.remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Post Delete Successfuly");
      res.redirect("/admin/posts");
    })
    .catch(err => {
      req.flash("error_msg", "Some internal error ocurred");
      res.redirect("/admin/posts");
    });
});

router.get("/logout", (res, req) => {
  req.logout();
  req.flash("success_msg", "Logout!");
  res.redirect("/");
});

module.exports = router;
