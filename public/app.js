// ----- SAVE ARTICLE CLICK ----- //
$(document).on("click", ".saveBtn", function (event) {
    event.preventDefault();
    var thisId = $(this).data("id");
    console.log("id" + thisId);
    $.ajax({
        method: "POST",
        url: "/api/saved/" + thisId
    }).then(
        function (data) {
            console.log(data);
            location.reload();
        }
    );
});

// ----- UNSAVE ARTICLE CLICK ----- //
$(document).on("click", ".unSaveBtn", function (event) {
    event.preventDefault();
    var thisId = $(this).data("id");
    console.log("id" + thisId);
    $.ajax({
        method: "POST",
        url: "/api/unsaved/" + thisId
    }).then(
        function (data) {
            console.log(data);
            location.reload();
        }
    );
});

// ----- SEARCH ARTICLE CLICK ----- //
$(document).on("click", ".scrapeBtn", function (event) {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/api/scrape/"
    }).then(
        function (data) {
            console.log(data);
            location.reload();
        }
    );
});

// ----- CLEAR ARTICLE CLICK ----- //
$(document).on("click", ".clearBtn", function (event) {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/api/clear/"
    }).then(
        function () {
            console.log(data);
            $("#mainwrapper").empty();
            $("#mainwrapper").val("");
            location.reload();
        })
});


// ----- SAVED ARTICLE BUTTON ----- //
$(document).on("click", ".noteBtn", function (event) {
    event.preventDefault();
    var thisId = $(this).data("id");
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).then(
        function (data) {
            $(".noteList").toggle();
            $(".titleToShow").empty();
            $(".titleToShow").text(data.title);
            $(".titleToShow").attr("value", thisId);
            if (data.note) {
                $(".notesbody").text(data.note.body);
            }
        }
    );
});

// ----- SUBMIT BUTTON CLICK ----- //
$(document).on("click", ".noteSubmitBtn", function (event) {
    event.preventDefault();
    var thisId = $(".titleToShow").attr("value");
    console.log(thisId);
    var newNote = {
        body: $("#noteInput").val().trim(),
    };
    $.ajax({
        method: "POST",
        url: "/api/notes/" + thisId,
        data: newNote
    }).then(
        function (sendData) {
            console.log(sendData);
            $("#noteInput").val("");
        }
    );
});