const { exec } = require('child_process');
var red = ["r", "e", "d"];
var green = ["g", "r", "e", "e", "n"];
var blue = ["b", "l", "u", "e"];

while (true) {
    setTimeout(() => { setLedColor("red"); }, 1000);
    setTimeout(() => { setLedColor("green"); }, 1000);
    setTimeout(() => { setLedColor("blue"); }, 1000);
}

function setLedColor(color) {
    for (var i = 0; i < 4; i++) {
        setTimeout(() => {
            if (color == "red") {
                exec("echo '" + red[i] + "' > /dev/ttyACM0");
            }

            if (color == "green") {
                exec("echo '" + green[i] + "' > /dev/ttyACM0");
            }

            if (color == "blue") {
                exec("echo '" + blue[i] + "' > /dev/ttyACM0");
            }
        }, 100);
    }

    setTimeout(() => { exec("echo ' ' > /dev/ttyACM0"); }, 500);
} 