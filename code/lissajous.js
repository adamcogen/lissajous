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
    let canvasXOffset = -3;
    let canvasYOffset = -3;

    const BACKGROUND_COLOR = "#FFFFFF"

    // frequency: 200, 201. amplitude: 100, 0.
    // frequency: 200, 300. amplitude: 0, -360.
    // frequency: 200, 250. amplitude: 0, -360.
    // frequency: 270, 630. amplitude: 0, -360.
    // frequency: 210, 350. amplitude: 0, -360.

    // math variables
    let count = 0;
    // x
    let x0 = 0;
    let x1 = 0;
    // y
    let y0 = 0;
    let y1 = 0;
    // period
    let frequency0 = 200;
    let frequency1 = 201;
    // amplitude
    let amplitude0 = -170;
    let amplitude1 = -170;
    //phase
    let xPhase0 = 0;
    let xPhase1 = 0;
    //offsets
    let xOffset = window.innerWidth / 2;
    let yOffset = window.innerHeight / 2;
    // universal scale multiplier
    let scale_multiplier = 2;

    let points = [];

    let slow = true;
    let reverse = false;
    let headstart = 20000;
    let end = 22000;

    // apply universal scale multiplier
    frequency0 *= scale_multiplier
    frequency1 *= scale_multiplier
    amplitude0 *= scale_multiplier
    amplitude1 *= scale_multiplier

    //timing variables
    let lastMilliDrawTime = 0;
    let currentMilliTime = 0;
    let millisElapsed = 0;
    const MILLI_TIME_BETWEEN_POINTS = 0;

    two.update(); // this initial 'update' creates SVG '_renderer' properties for our shapes that we can add action listeners to, so it needs to go here

    while (count < end) {
        count += 1;
        x0 += 1;
        x1 += 1;

        let b0 = (2 * Math.PI) / frequency0
        y0 = amplitude0 * Math.sin(b0 * (x0 + xPhase0));

        let b1 = (2 * Math.PI) / frequency1
        y1 = amplitude1 * Math.sin(b1 * (x1 + xPhase1));

        amplitude0 += .03;
        amplitude1 += .03;

        points.push({x: y0 + xOffset, y: y1 + yOffset, color: "#000000"})
    }

    if (reverse) {
        points.reverse();
    }

    count = 0;

    drawCanvasRectangle(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)

    // draw axes
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
    ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
    ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
    ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
    ctx.fillStyle = "#000000";

    while (count < headstart) {
        point = points[count];
        drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
        count += 1;
    }

    // tracking lines
    xLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
    yLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
    xLine.stroke = 'blue';
    yLine.stroke = 'blue';
    xLine.linewidth = 1 * scale_multiplier;
    yLine.linewidth = 1 * scale_multiplier;
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
    trackingDot.radius = pixelSize;

    // The recursive 'update' loop that runs everything 
    function update() {

        currentMilliTime = Date.now();
        millisElapsed = currentMilliTime - lastMilliDrawTime;

        if (slow && count < points.length && millisElapsed >= MILLI_TIME_BETWEEN_POINTS) {
            // draw point
            point = points[count];
            drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
            // draw tracking points
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

            count += 1;

            lastMilliDrawTime = Date.now();
        }
        
        if (!slow || count >= points.length) {
            clearCanvas(ctx);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawCanvasRectangle(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
            count = 0
            while (count < end) {
                point = points[count];
                drawCanvasPixel(ctx, {x: point.x + canvasXOffset, y: point.y + canvasYOffset}, point.color);
                count += 1;
            }
            xLine.stroke = 'transparent';
            yLine.stroke = 'transparent';
            xPoint.fill = 'transparent';
            xPoint.stroke = 'transparent';
            yPoint.fill = 'transparent';
            yPoint.stroke = 'transparent';
            trackingDot.fill = 'transparent';
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
}