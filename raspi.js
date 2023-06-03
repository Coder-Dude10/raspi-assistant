var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(JSON.parse(this.responseText).properties);
    }
};
xhttp.open("GET", "https://api.weather.gov/gridpoints/TOP/86,72/forecast", true);
xhttp.send();