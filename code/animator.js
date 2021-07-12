window.onload = () => {

    // Initialize Two.js
    let elem = document.getElementById('draw-shapes');
    let two = new Two({
        width: 500,
        height: 500,
        fullscreen: true,
        type: Two.Types.svg
    }).appendTo(elem);

    // canvas variables
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    pixelSize = 3;
    let canvasXOffset = -1.5;
    let canvasYOffset = -1.5;

    //offsets
    let xOffset = window.innerWidth / 2;
    let yOffset = window.innerHeight / 2;

    const BACKGROUND_COLOR = "#FFFFFF"

    //timing variables
    let lastMilliDrawTime = 0;
    let currentMilliTime = 0;
    let millisElapsed = 0;
    const MILLI_TIME_BETWEEN_POINTS = 0; // we will slow down how long we wait between each frame being drawn by this many milliseconds

    let showAxes = false;

    let exportPngAndConfigJson = true;
    let pngExported = false;

    let useJsonTextConfig = false; // if true, use JSON text version of configuration instead of object version. makes it easier to load from exported files locally just by copying and pasting their contents.

    let importConfigJson = false; // if true, import configuration from a saved JSON file. this is untested but should only work if this is being run from a web server due to http security limitations with most browsers.
    let configJsonFileName = "./configurations/1.json"

    // use this 'configuration' object declaration if 'useJsonTextConfig' and 'importConfigJson' are set to false
    let configuration = {
        equations: {
            x: {
                period: 83.5,
                amplitude: -240,
                phase: 0,
            },
            y: {
                period: 500,
                amplitude: 100,
                phase: 0,
            }
        },
        automation: {
            x: {
                amplitude: {
                    add: 0.005,
                    multiply: 1,
                },
                period: {
                    add: 0,
                    multiply: 1,
                },
                phase: {
                    add: 0,
                    multiply: 1,
                }
            },
            y: {
                amplitude: {
                    add: 0.005,
                    multiply: 1,
                },
                period: {
                    add: 0,
                    multiply: 1,
                },
                phase: {
                    add: 0,
                    multiply: 1,
                }
            }
        },
        slow: true,
        reverse: false,
        headstart: 50000,
        end: 80000,
        scaleMultiplier: 2,
    };

    if (useJsonTextConfig) { // use this 'configuration' JSON declaration if 'useJsonTextConfig' is set to true and 'importConfigJson' is set to false
        configuration = JSON.parse('{"equations":{"x":{"period":100.1,"amplitude":-300,"phase":0},"y":{"period":250,"amplitude":150,"phase":0}},"automation":{"x":{"amplitude":{"add":0.0023,"multiply":1},"period":{"add":0,"multiply":1},"phase":{"add":0,"multiply":1}},"y":{"amplitude":{"add":0.005,"multiply":1},"period":{"add":0,"multiply":1},"phase":{"add":0,"multiply":1}}},"slow":false,"reverse":false,"headstart":30000,"end":50000,"scaleMultiplier":1}');
    }

    if (importConfigJson) { // use this 'configuration' declaration to import from a JSON file if 'importConfigJson' is set to true
        configuration = loadJsonFile(configJsonFileName);
    }

    let initialConfiguration = clone(configuration);

    if (exportPngAndConfigJson) {
        exportConfigurationAsJson(configuration)
    }

    // frequency: 200, 201. amplitude: 100, 0.
    // frequency: 200, 300. amplitude: 0, -360.
    // frequency: 200, 250. amplitude: 0, -360.
    // frequency: 270, 630. amplitude: 0, -360.
    // frequency: 210, 350. amplitude: 0, -360.

    let points = [];
    points = calculatePoints(configuration, xOffset, yOffset);

    let pointsDrawn = 0;

    drawCanvasRectangle(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)

    let framesDrawn = 0; // a 'frame' here refers to a full lissajous pattern image, i.e. this is the number of frames in the animation so far
    function update() { // The recursive 'update' loop that runs everything 

        currentMilliTime = Date.now();
        millisElapsed = currentMilliTime - lastMilliDrawTime;

        if (millisElapsed >= MILLI_TIME_BETWEEN_POINTS) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawCanvasRectangle(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
            
            // draw axes
            if (showAxes) {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
                ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
                ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
                ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
                ctx.fillStyle = "#000000";
            }
            
            pointsDrawn = 0
            configuration = clone(initialConfiguration);
            
            while (pointsDrawn < configuration.end) {
                point = points[pointsDrawn];
                drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
                pointsDrawn += 1;
            }

            if (exportPngAndConfigJson && !pngExported) {
                pngExported = true;
                exportCanvasAsPNG(canvas, "animator");
            }

            framesDrawn += 1;

            // animation logic can go here
            // configuration.equations.x.period += framesDrawn * 1;
            // console.log(configuration.equations.x.period)
            configuration.equations.x.phase += framesDrawn * 5;
            // end animation logic

            points = calculatePoints(configuration, xOffset, yOffset);
            lastMilliDrawTime = Date.now();
        }

        two.update();
        requestAnimationFrame(update);
    }
    
    update();

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    function drawSvgPixel(position, color='#000000') {
        let radius = 1;
        let circle = two.makeCircle(position.x, position.y, radius);
        circle.linewidth = 0;
        circle.fill = color;
        circle.stroke = color;
        return circle;
    }

    function drawCanvasPixel(ctx, position, color='#000000') {
        drawCanvasRectangle(ctx, position.x, position.y, pixelSize, pixelSize, color);
    }

    function drawCanvasRectangle(ctx, x, y, width, height, color) {
        temp = ctx.fillStyle;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = temp;
    }

    function anchor(x, y) {
        return new Two.Anchor(x, y);
    }

    // Generate a random hex color that can be used for CSS
    function randomColor () {
        return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);
    }

    // https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf
    function exportCanvasAsPNG(canvas, fileName) {
    
        var MIME_TYPE = "image/png";
    
        var imgURL = canvas.toDataURL(MIME_TYPE);
    
        var dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }

    // https://stackoverflow.com/questions/33780271/export-a-json-object-to-a-text-file
    function exportConfigurationAsJson(configuration) {
        let filename = 'configuration.json';
        let jsonStr = JSON.stringify(configuration);
        // let jsonStr = JSON.stringify(configuration, undefined, 4); // this version has line breaks and indentation

        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    // https://stackoverflow.com/questions/7346563/loading-local-json-file
    function loadJsonFile(filePath) {
        let json = $.getJSON(filePath, function(response) {
            console.log(response);
        });
        return JSON.parse(json.responseText);
    }

    function clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function confineNumberToBounds(number, lowerBound, upperBound) {
        if (number < lowerBound) {
            return lowerBound;
        } else if (number > upperBound) {
            return upperBound;
        } else {
            return number;
        }
    }

    function rgbToHex(red, green, blue) {
        redHex = red.toString(16);
        greenHex = green.toString(16);
        blueHex = blue.toString(16);
        return "#" + redHex + greenHex + blueHex;
    }

    function calculatePoints(configuration, xOffset, yOffset) {
        // math variables
        let pointsCalculated = 0;
        // x
        let xCounter = 0;
        let yCounter = 0;
        // y
        let x = 0;
        let y = 0;

        let points = [];

        // apply universal scale multiplier
        configuration.equations.x.period *= configuration.scaleMultiplier
        configuration.equations.y.period *= configuration.scaleMultiplier
        configuration.equations.x.amplitude *= configuration.scaleMultiplier
        configuration.equations.y.amplitude *= configuration.scaleMultiplier

        while (pointsCalculated < configuration.end) {
            pointsCalculated += 1;
            xCounter += 1;
            yCounter += 1;

            let xFrequency = (2 * Math.PI) / configuration.equations.x.period
            x = configuration.equations.x.amplitude * Math.sin(xFrequency * (xCounter + configuration.equations.x.phase));

            let yFrequency = (2 * Math.PI) / configuration.equations.y.period
            y = configuration.equations.y.amplitude * Math.sin(yFrequency * (yCounter + configuration.equations.y.phase));

            // apply automation
            // amplitude
            configuration.equations.x.amplitude += configuration.automation.x.amplitude.add;
            configuration.equations.y.amplitude += configuration.automation.y.amplitude.add;
            configuration.equations.x.amplitude *= configuration.automation.x.amplitude.multiply;
            configuration.equations.y.amplitude *= configuration.automation.y.amplitude.multiply;
            // period
            configuration.equations.x.period += configuration.automation.x.period.add;
            configuration.equations.y.period += configuration.automation.y.period.add;
            configuration.equations.x.period *= configuration.automation.x.period.multiply;
            configuration.equations.y.period *= configuration.automation.y.period.multiply;
            //phase
            configuration.equations.x.phase += configuration.automation.x.phase.add;
            configuration.equations.y.phase += configuration.automation.y.phase.add;
            configuration.equations.x.phase *= configuration.automation.x.phase.multiply;
            configuration.equations.y.phase *= configuration.automation.y.phase.multiply;

            incrementTo255 = confineNumberToBounds(Math.round((pointsCalculated / configuration.end) * 255), 16, 255);
            decrementFrom255 = confineNumberToBounds(255 - Math.round((pointsCalculated / configuration.end) * 255), 16, 255);

            // fade red to blue
            // color = rgbToHex(incrementTo255, 20, decrementFrom255)

            color = "#000000"

            points.push({
                x: x + xOffset, 
                y: y + yOffset, 
                color: color
            })
        }

        if (configuration.reverse) {
            points.reverse();
        }

        return points;
    }
}