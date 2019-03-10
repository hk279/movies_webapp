var theatreList = [];
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
xmlhttp.send();
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var xmlDoc = xmlhttp.responseXML;
        var theatreAreaElements = [];
        theatreAreaElements = xmlDoc.getElementsByTagName("TheatreArea");
        for (var i = 0; i < theatreAreaElements.length; i++) {
            var theatre = {
                name: theatreAreaElements[i].childNodes[1].childNodes[0].nodeValue,
                id: theatreAreaElements[i].childNodes[0].childNodes[0].nodeValue
            };
            theatreList.push(theatre);
        }
    }
};

var shows = [];
var xmlhttp2 = new XMLHttpRequest();
xmlhttp2.open("GET", "http://www.finnkino.fi/xml/Schedule/", true);
xmlhttp2.send();
xmlhttp2.onreadystatechange = function() {
    if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
        var xmlDoc2 = xmlhttp2.responseXML;
        var showElements = document.getElementsByTagName("Show");
        for (var i = 0; i < showElements.length; i++) {
            var show = {
                title: showElements[i].childNodes[15].childNodes[0].nodeValue,
                year: showElements[i].childNodes[17].childNodes[0].nodeValue,
                startTime: showElements[i].childNodes[2].childNodes[0].nodeValue,
                location: showElements[i].childNodes[28].childNodes[0].nodeValue
            };
            shows.push(show);
        }

        document.getElementById("xml").innerHTML = "<p>" + theatreList + "</p>";
    }
};

