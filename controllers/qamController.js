const Category = require("../models/category.model");
const Ideas = require("../models/ideal.model");
const Campaign = require("../models/campaign.model");
const Users = require("../models/user.model");
const fileSystem = require("fs");
const fastcsv = require("fast-csv");
const admzip = require("adm-zip");
const path = require("path");

const qamController = {
  viewAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({});
      res.render("qam/view-categories", { categories });
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },
  createCategory: async (req, res) => {
    try {
      //only qam can create, delete category
      const { name } = req.body;
      const category = await Category.findOne({ category: name });
      if (category) {
        req.flash("danger", "Category name is already existed");
        return res.redirect("back");
      }
      const newCategory = new Category({ category: name });
      await newCategory.save();
      return res.redirect("/qam/");
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        req.flash("danger", "Category invalid");
        return res.redirect("/qam/");
      }
      if (category.campaign.length != 0) {
        req.flash("danger", "Cannot delete category");
        return res.redirect("/qam/");
      }
      await category.delete();
      req.flash("success", "Category deleted");
      res.redirect("/qam/");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name } = req.body;
      const category = await Category.findOne({
        category: name,
        _id: { $ne: req.params.id },
      });
      if (category) {
        req.flash("danger", "Category is already existed");
        return res.redirect("/qam/");
      }

      await Category.findOneAndUpdate(
        { _id: req.params.id },
        { category: name }
      );

      req.flash("success", "Category updated");
      res.redirect("/qam/");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getDownload: async (req, res) => {
    try {
      const campaigns = await Campaign.find();
      res.render("qam/download", { campaigns });
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },
  downloadCSV: async (req, res) => {
    try {
      const ideas = await Ideas.aggregate([
        {
          $project: {
            _id: 1,
            campaign_id: 1,
            user_id: 1,
            title: 1,
            content: 1,
            numberOfViews: 1,
            numberOfLikes: 1,
            numberOfDislikes: 1,
            numberOfComments: 1,
            createdAt: 1,
          },
        },
      ]);
      var ws = fileSystem.createWriteStream("public/files/idea.csv");
      fastcsv.write(ideas, { headers: true }).pipe(ws);

      res.redirect("back");
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },
  downloadZip: async (req, res) => {
    try {
      const zip = new admzip();

      const isDir = fileSystem.existsSync(
        path.resolve(__dirname + "/../public/uploads/" + req.params.id)
      );

      if (isDir) {
        var uploadDir = fileSystem.readdirSync(
          path.resolve(__dirname + "/../public/uploads/" + req.params.id)
        );
        for (var i = 0; i < uploadDir.length; i++) {
          zip.addLocalFile(
            path.resolve(
              __dirname +
                "/../public/uploads/" +
                req.params.id +
                "/" +
                uploadDir[i]
            )
          );
        }
        const file_after_download = req.params.id + ".zip";
        const data = zip.toBuffer();

        res.set("Content-Type", "application/octet-stream");
        res.set(
          "Content-Disposition",
          `attachment; filename=${file_after_download}`
        );
        res.set("Content-Length", data.length);
        return res.send(data);
      }
      req.flash("danger", "Topic has no uploaded file");
      res.redirect("back");
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },

  getDashboard: async (req, res) => {
    try {
      const ideas = await Ideas.find();
      const ideasPerMonth = await Ideas.aggregate([
        {
          $project: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { month: "$month", year: "$year" },
            count: { $sum: 1 },
          },
        },
      ]);
      const allUsers = await Users.find();
      const submittedUsers = await Users.aggregate([
        {
          $match: {
            submitted: true,
          },
        },
      ]);
      res.render("qam/dashboard", {
        ideas,
        ideasPerMonth,
        allUsers: allUsers.length,
        submittedUsers: submittedUsers.length,
      });
    } catch (error) {
      req.flash("danger", " 500 INTERNAL SERVER ERROR: " + error.message);
      return res.redirect("back");
    }
  },
};

module.exports = qamController;
