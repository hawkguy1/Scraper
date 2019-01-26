var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
// var request = require('request');
var db = require("./models");
var PORT = process.env.PORT || 3000;

var app = express();

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// ----- CONNECT TO MONGO ----- //
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ----- GET ALL ARTICLES FROM THE DATABASE ----- //
app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var hbsObject = {
                articles: dbArticle
            };
            res.render("index", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// ----- GET SAVED ARTICLES FROM THE DATABASE ----- //
app.get("/saved", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var hbsObject = {
                articles: dbArticle
            };
            res.render("save", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// ----- SCRAPE THE ONION ----- //
app.get("/api/scrape", function (req, res) {
    request("http://www.theonion.com/", function (error, response, html) {
        var $ = cheerio.load(html);
        var results = [];

        $("h5").each(function (i, element) {
            var title = $(element).text();
            var link = $(element).children("a").attr("href");

            results.push({
                title: title,
                link: link
            });
            console.log(results);

            db.Article.create(results)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err)
                })
        });
        res.send("SCRAPED!");
    });
});

// ----- CLEAR ARTICLES FROM DATABASE ----- //
app.get("/api/clear", function (req, res) {
    db.Article.remove({})
        .then(function (dbCleard) {
            console.log(dbCleard)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// ----- GET ARTICLE BY ID AND ITS NOTES ----- //
app.get("/articles/:id", function (req, res) {

    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// ----- GET ALL NOTES ----- //
// app.get("/api/notes", function (req, res) {

//     db.Note.find({})
//         .then(function (dbNote) {
//             var hbsObject = {
//                 notes: dbNote
//             };
//             res.render("save", hbsObject);
//         })
//         .catch(function (err) {

//             res.json(err);
//         });
// });

// ----- CREATE A NEW NOTE ----- //
app.post("/api/notes/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// ----- UPDATE BOOLEAN TO TRUE WHEN SAVED ----- //
app.post("/api/saved/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
        .then(function (dbSaved) {
            console.log(dbSaved)
        });
})

// ----- UPDATE BOOLEAN TO FALSE WHEN UNSAVED ----- //
app.post("/api/unsaved/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
        .then(function (dbUnSaved) {
            console.log(dbUnSaved)
        });
})

// ----- START SERVER ----- //
app.listen(PORT, function () {
    console.log("App running on http://localhost" + PORT);
}); 