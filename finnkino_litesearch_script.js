var shows = [];
var theatreList = [];
var suggestions = [];

/* XMLHttp request for the theatres and theatre areas. Generates theatre objects based on 
the received data and pushes them to the theatre list. */
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
xmlhttp.send();
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var xmlDoc = xmlhttp.responseXML;
        var theatreIdElements = xmlDoc.getElementsByTagName("ID");
        var theatreNameElements = xmlDoc.getElementsByTagName("Name");

        var theatreIds = [];
        var theatreNames = [];
        for (var i = 1; i < theatreIdElements.length; i++) {
            theatreIds.push(theatreIdElements[i].childNodes[0].nodeValue);
            theatreNames.push(theatreNameElements[i].childNodes[0].nodeValue);
        }
        /*Finnkino theatre areas data has some theatres grouped up by city or area.
        In order to keep the search result view as light as possible (no theatre name), 
        I created a condition that only singular theatres are added to the list.
        They follow the form: 'city: THEATRE', so I filtered out the names without the ':' symbol. 
        */
        for (var j = 0; j < theatreIds.length; j++) {
            if (theatreNames[j].includes(":")) {
                var theatre = {
                    id: theatreIds[j],
                    name: theatreNames[j]
                };
                theatreList.push(theatre);
            }
        }
    }
    //Fills out the list with all theatres in the beginning.
    generateSuggestions();
};

/* Generates the list of autocomplete suggestions based on written input 
(for example "esp" -> Espoo, Espoo: OMENA, Espoo: Sello) */
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
    var theatreName = document.getElementById("search-text").value;
    var date = document.getElementById("date").value;

    //Removes the table that shows the search results in the beginning.
    document.getElementById("search-results-table").innerHTML = "";

    //The search results div starts with display none and this makes it visible.
    document.getElementById("search-results").style.display = "block";

    //If either the theatre name or date is empty, user is notified.
    if (theatreName == "" || date == "") {
        document.getElementById("search-results-table").innerHTML =
            "<p>Please enter both the theatre and a date to search for shows</p>";
        return;
    }

    //If the search input doesn't match any actual theatre name, the user is notified.
    var match = false;
    for (var i = 0; i < theatreList.length; i++) {
        if (theatreName == theatreList[i].name) {
            match = true;
        }
    }
    if (match == false) {
        document.getElementById("search-results-table").innerHTML =
            "<p>Please enter a valid theatre name</p>";
        return;
    }

    //Forms the url for the XMLHttp request.
    var xmlhttp2 = new XMLHttpRequest();
    var dateFormat =
        date.substr(8, 2) + "." + date.substr(5, 2) + "." + date.substr(0, 4);
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

    /*XMLHttp request for the show info. Similarly to the theatre list, 
    generates show objects based on the received data and pushes them to the shows list*/
    xmlhttp2.open("GET", xmlurl, true);
    xmlhttp2.send();
    xmlhttp2.onreadystatechange = function() {
        if (xmlhttp2.readyState === 4 && xmlhttp2.status === 200) {
            //Empties the shows list in the beginning of the call.
            shows = [];
            var xmlDoc2 = xmlhttp2.responseXML;

            for (
                let i = 0;
                i < xmlDoc2.getElementsByTagName("Title").length;
                i++
            ) {
                show = {
                    movieTitle: xmlDoc2.getElementsByTagName("Title")[i]
                        .childNodes[0].nodeValue,
                    imageUrl: xmlDoc2.getElementsByTagName(
                        "EventSmallImagePortrait"
                    )[i].childNodes[0].nodeValue,
                    theatre: xmlDoc2.getElementsByTagName("Theatre")[i]
                        .childNodes[0].nodeValue,
                    startTime: xmlDoc2
                        .getElementsByTagName("dttmShowStart")
                        [i].childNodes[0].nodeValue.substr(11, 5),
                    ticketsUrl: xmlDoc2.getElementsByTagName("ShowURL")[i]
                        .childNodes[0].nodeValue
                };
                shows.push(show);
            }
            showResults();
        }
    };
}

//Inserts the shows into an HTML table.
function showResults() {
    for (var i = 0; i < shows.length; i++) {
        document.getElementById("search-results-table").innerHTML +=
            "<tr><td class='start-time'>" +
            shows[i].startTime +
            "</td><td>" +
            shows[i].movieTitle +
            "</td><td><img src='" +
            shows[i].imageUrl +
            "'></img></td><td><button type='button' class='tickets' onclick=\"window.open('" + 
            shows[i].ticketsUrl + 
            "')\">Tickets</button></td></tr>";
    }
}
