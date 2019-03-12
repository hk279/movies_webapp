var shows = [];
var theatreList = [];
var suggestions = [];

//XMLHttp request for the theatres and theatre areas.
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
xmlhttp.send();
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var theatreIdElements = [];
        var theatreNameElements = [];

        var xmlDoc = xmlhttp.responseXML;
        theatreIdElements = xmlDoc.getElementsByTagName("ID");
        theatreNameElements = xmlDoc.getElementsByTagName("Name");

        var theatreIds = [];
        var theatreNames = [];
        for (var i = 1; i < theatreIdElements.length; i++) {
            theatreIds.push(theatreIdElements[i].childNodes[0].nodeValue);
            theatreNames.push(theatreNameElements[i].childNodes[0].nodeValue);
        }

        for (var j = 0; j < theatreIds.length; j++) {
            var theatre = {
                id: theatreIds[j],
                name: theatreNames[j]
            };
            theatreList.push(theatre);
        }
        //Fills out the list with all theatres in the beginning.
        generateSuggestions();
    }
};

//Generates the list of autocomplete suggestions based on written input (for example "esp" -> Espoo, Espoo: OMENA, Espoo: Sello)
function generateSuggestions() {
    var str = document.getElementById("search-text").value.toLowerCase();

    //Empties and then repopulates the suggestions array with all theaters
    suggestions = [];
    for (let i = 0; i < theatreList.length; i++) {
        suggestions.push(theatreList[i]);
    }

    //Iterates the suggestions array and removes the elements whose name doesn't start with the entered search string
    for (let j = 0; j < suggestions.length; j++) {
        if (str != suggestions[j].name.substring(0, str.length).toLowerCase()) {
            suggestions.splice(j, 1);
            j--;
        }
    }

    //Inserts the search suggestions into the datalist
    var results = document.getElementById("theatres");
    results.innerHTML = "";

    for (var i = 0; i < suggestions.length; i++) {
        results.innerHTML += "<option value='" + suggestions[i].name + "'>";
    }
}

function getShows() {
    document.getElementById("search-results").style.display = "block";

    var theatreName = document.getElementById("search-text").value;
    var date = document.getElementById("date").value;

    if (theatreName == "" || date == "") {
        document.getElementById("search-results").innerHTML =
            "<p>Please enter both the theatre and a date to search for shows</p>";
        return;
    }

    for (var i = 0; i < theatreList.length; i++) {
        if (theatreName == theatreList[i].name) {
            var xmlhttp2 = new XMLHttpRequest();
            var dateFormat =
                date.substr(8, 2) +
                "." +
                date.substr(5, 2) +
                "." +
                date.substr(0, 4);
            var id;
            for (let i = 0; i < theatreList.length; i++) {
                if (theatreName == theatreList[i].name) {
                    id = theatreList[i].id;
                    break;
                }
            }

            var xmlurl =
                "https://www.finnkino.fi/xml/Schedule/?area=" +
                id +
                "&dt=" +
                dateFormat;

            xmlhttp2.open("GET", xmlurl, true);
            xmlhttp2.send();
            xmlhttp2.onreadystatechange = function() {
                if (xmlhttp2.readyState === 4 && xmlhttp2.status === 200) {
                    shows = [];
                    document.getElementById("search-results-table").innerHTML =
                        "";

                    var titleElements = [];
                    var startTimeElements = [];
                    var theatreElements = [];
                    var imageElements = [];

                    var xmlDoc2 = xmlhttp2.responseXML;
                    titleElements = xmlDoc2.getElementsByTagName("Title");
                    imageElements = xmlDoc2.getElementsByTagName(
                        "EventSmallImagePortrait"
                    );
                    theatreElements = xmlDoc2.getElementsByTagName("Theatre");
                    startTimeElements = xmlDoc2.getElementsByTagName(
                        "dttmShowStart"
                    );

                    var titles = [];
                    var imageUrls = [];
                    var theatres = [];
                    var startTimes = [];

                    for (var i = 0; i < titleElements.length; i++) {
                        titles.push(titleElements[i].childNodes[0].nodeValue);
                        imageUrls.push(
                            imageElements[i].childNodes[0].nodeValue
                        );
                        theatres.push(
                            theatreElements[i].childNodes[0].nodeValue
                        );
                        startTimes.push(
                            startTimeElements[i].childNodes[0].nodeValue
                        );
                    }

                    for (var i = 0; i < titles.length; i++) {
                        var scheduledShow = {
                            movieTitle: titles[i],
                            imageUrl: imageUrls[i],
                            theatre: theatres[i],
                            startTime: startTimes[i].substr(11, 5)
                        };
                        shows.push(scheduledShow);
                    }
                    for (var i = 0; i < shows.length; i++) {
                        document.getElementById(
                            "search-results-table"
                        ).innerHTML +=
                            "<tr><td class='start-time'>" +
                            shows[i].startTime +
                            "</td><td>" +
                            shows[i].movieTitle +
                            "</td><td><img src='" +
                            shows[i].imageUrl + 
                            "'></img></td></tr>";
                    }
                }
            };
            return;
        }
    }
    document.getElementById("search-results").innerHTML =
        "<p>Please enter a valid theatre name</p>";
}
