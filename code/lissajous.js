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
    const MILLI_TIME_BETWEEN_POINTS = 0; // slow down how long we should wait between each point being drawn.

    let showAxes = true;
    let showTrackingAnimations = false;

    let exportPngAndConfigJson = false;
    let exported = false;

    let useJsonTextConfig = false; // if true, use JSON text version of configuration instead of object version. makes it easier to load from exported files locally just by copying and pasting their contents.

    let importConfigJson = false; // if true, import configuration from a saved JSON file. this is untested but should only work if this is being run from a web server due to http security limitations with most browsers.
    let configJsonFileName = "./configurations/1.json"

    // use this 'configuration' object declaration if 'useJsonTextConfig' and 'importConfigJson' are set to false
    let configuration = {
        equations: {
            x: {
                period: 200,
                amplitude: -360,
                phase: 0,
            },
            y: {
                period: 250,
                amplitude: 100,
                phase: 0,
            }
        },
        automation: {
            x: {
                amplitude: {
                    add: .0023,
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
                    add: .005,
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
        headstart: 140000,
        end: 150000,
        scaleMultiplier: 2,
    };

    if (useJsonTextConfig) { // use this 'configuration' JSON declaration if 'useJsonTextConfig' is set to true and 'importConfigJson' is set to false
        configuration = JSON.parse('{"equations":{"x":{"period":200,"amplitude":-360,"phase":0},"y":{"period":250,"amplitude":100,"phase":0}},"automation":{"x":{"amplitude":{"add":0.0023,"multiply":1},"period":{"add":0,"multiply":1},"phase":{"add":0,"multiply":1}},"y":{"amplitude":{"add":0.005,"multiply":1},"period":{"add":0,"multiply":1},"phase":{"add":0,"multiply":1}}},"slow":false,"reverse":false,"headstart":119000,"end":120000,"scaleMultiplier":2}');
    }

    if (importConfigJson) { // use this 'configuration' declaration to import from a JSON file if 'importConfigJson' is set to true
        configuration = loadJsonFile(configJsonFileName);
    }

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

    let count = 0;

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

    while (count < configuration.headstart) {
        point = points[count];
        drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
        count += 1;
    }

    // tracking lines
    if (showTrackingAnimations) {
        xLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
        yLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
        xLine.stroke = 'blue';
        yLine.stroke = 'blue';
        xLine.linewidth = 1;
        yLine.linewidth = 1;
        // tracking points
        xPoint = drawSvgPixel({x: xOffset, y: yOffset}, 'red');
        yPoint = drawSvgPixel({x: xOffset, y: yOffset}, 'red');
        xPoint.radius = 4;
        yPoint.radius = 4;
        xPoint.linewidth = 1;
        yPoint.linewidth = 1;
        xPoint.stroke = 'black';
        yPoint.stroke = 'black';
        // tracking new dot
        trackingDot = drawSvgPixel({x: xOffset, y: yOffset}, 'black');
        trackingDot.radius = pixelSize / 2;
    }

    // The recursive 'update' loop that runs everything 
    function update() {

        currentMilliTime = Date.now();
        millisElapsed = currentMilliTime - lastMilliDrawTime;

        if (configuration.slow && count < points.length && millisElapsed >= MILLI_TIME_BETWEEN_POINTS) {
            // draw point
            point = points[count];
            drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
            // draw tracking points
            if (showTrackingAnimations) {
                xPoint.translation.set(point.x, yOffset);
                yPoint.translation.set(xOffset, point.y);
                trackingDot.translation.set(point.x, point.y);
                // draw tracking lines
                // x line
                xLine.vertices[0].x = xPoint.translation.x  - xLine.translation.x;
                xLine.vertices[0].y = xPoint.translation.y  - xLine.translation.y;
                xLine.vertices[1].x = point.x - xLine.translation.x;
                xLine.vertices[1].y = point.y - xLine.translation.y;
                // y line
                yLine.vertices[0].x = yPoint.translation.x - yLine.translation.x;
                yLine.vertices[0].y = yPoint.translation.y - yLine.translation.y;
                yLine.vertices[1].x = point.x - yLine.translation.x;
                yLine.vertices[1].y = point.y - yLine.translation.y;
            }

            count += 1;

            lastMilliDrawTime = Date.now();
        }
        
        // redraw everything at the end, without the red axes or animated tracking shapes
        if (!configuration.slow || count >= points.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawCanvasRectangle(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
            count = 0
            while (count < configuration.end) {
                point = points[count];
                drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
                count += 1;
            }
            if (showTrackingAnimations) {
                xLine.stroke = 'transparent';
                yLine.stroke = 'transparent';
                xPoint.fill = 'transparent';
                xPoint.stroke = 'transparent';
                yPoint.fill = 'transparent';
                yPoint.stroke = 'transparent';
                trackingDot.fill = 'transparent';
            }

            if (exportPngAndConfigJson && !exported) {
                exported = true;
                exportCanvasAsPNG(canvas, "lissajous")
            }
        }

        two.update();
        requestAnimationFrame(update);
    }
    
    update();

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

    function calculatePoints(configuration, xOffset, yOffset) {
        // math variables
        let count = 0;
        // x
        let x0 = 0;
        let x1 = 0;
        // y
        let y0 = 0;
        let y1 = 0;

        let points = [];

        // apply universal scale multiplier
        configuration.equations.x.period *= configuration.scaleMultiplier
        configuration.equations.y.period *= configuration.scaleMultiplier
        configuration.equations.x.amplitude *= configuration.scaleMultiplier
        configuration.equations.y.amplitude *= configuration.scaleMultiplier

        while (count < configuration.end) {
            count += 1;
            x0 += 1;
            x1 += 1;

            let b0 = (2 * Math.PI) / configuration.equations.x.period
            y0 = configuration.equations.x.amplitude * Math.sin(b0 * (x0 + configuration.equations.x.phase));

            let b1 = (2 * Math.PI) / configuration.equations.y.period
            y1 = configuration.equations.y.amplitude * Math.sin(b1 * (x1 + configuration.equations.y.phase));

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

            points.push({x: y0 + xOffset, y: y1 + yOffset, color: "#000000"})
        }

        if (configuration.reverse) {
            points.reverse();
        }

        return points;
    }
}