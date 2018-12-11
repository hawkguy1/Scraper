var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require('request');


// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");




// Routes


// HTML Route for getting all Articles from the db
app.get("/", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        var hbsObject = {
          articles: dbArticle
        };
        res.render("index", hbsObject);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});  

// HTML Route for getting all saved Articles from the db
app.get("/saved", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        var hbsObject = {
          articles: dbArticle
        };
        res.render("save", hbsObject);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});    
  

// A GET route for scraping the la times website
app.get("/api/scrape", function (req, res) {
    request("http://www.latimes.com/", function (error, response, html) {
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
             .then(function(dbArticle) {
                 console.log(dbArticle);
             })
             .catch(function(err) {
                return res.json(err)
            })    
        });
        res.send("Scrape Complete");
    });
});

//A GET route to clear articles from db
app.get("/api/clear", function(req, res) {
    db.Article.remove({})
      .then(function(dbCleard) {
        console.log(dbCleard)
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});   


// A GET route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
   
    db.Article.findOne({ _id: req.params.id })
    
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        
        res.json(err);
      });
  });
  

  // A GET route to get all notes, but somehow this is not functional.
  app.get("/api/notes", function(req, res) {
   
    db.Note.find({})
      .then(function(dbNote) {
        var hbsObject = {
          notes: dbNote
        };
        res.render("save", hbsObject);
      })
      .catch(function(err) {
        
        res.json(err);
      });
  });


// A POST route to create new note
app.post("/api/notes/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {

        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });



// A POST route to update saved boolean to true for an artilce when saved
app.post("/api/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id}, {saved: true})
        .then(function(dbSaved) {
            console.log(dbSaved)
        });
})

// A POST route to update saved boolean to false for an artilce when unsaved
app.post("/api/unsaved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id}, {saved: false})
        .then(function(dbUnSaved) {
            console.log(dbUnSaved)
        });
})




// Start the server
app.listen(PORT, function () {
    console.log("App running on http://localhost" + PORT);
});S