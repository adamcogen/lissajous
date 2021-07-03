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
    pixelSize = 2;
    let canvasXOffset = -1.5;
    let canvasYOffset = -1.5;

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
    let frequency1 = 250;
    // amplitude
    let amplitude0 = 0;
    let amplitude1 = -360;
    //phase
    let xPhase0 = 0;
    let xPhase1 = 0;
    //offsets
    let xOffset = window.innerWidth / 2;
    let yOffset = window.innerHeight / 2;

    let points = [];

    let slow = true;
    let reverse = false;
    let headstart = 29000;
    let end = 30000

    two.update(); // this initial 'update' creates SVG '_renderer' properties for our shapes that we can add action listeners to, so it needs to go here

    while (count < end) {
        count += 1;
        x0 += 1;
        x1 += 1;

        let b0 = (2 * Math.PI) / frequency0
        y0 = amplitude0 * Math.sin(b0 * (x0 + xPhase0));

        let b1 = (2 * Math.PI) / frequency1
        y1 = amplitude1 * Math.sin(b1 * (x1 + xPhase1));

        amplitude0 += .01;
        amplitude1 += .01;

        points.push({x: y0 + xOffset, y: y1 + yOffset})
    }

    if (reverse) {
        points.reverse();
    }

    count = 0;

    // draw axes
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
    ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
    ctx.fillRect(xOffset + canvasXOffset , 0, 1, 10000);
    ctx.fillRect(0 , yOffset + canvasYOffset, 10000, 1);
    ctx.fillStyle = "#000000";

    while (count < headstart) {
        point = points[count];
        ctx.fillRect(point.x + canvasXOffset, point.y + canvasYOffset, pixelSize, pixelSize);
        count += 1;
    }

    // tracking lines
    xLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
    yLine = two.makePath([anchor(xOffset, yOffset), anchor(xOffset, yOffset)]);
    xLine.stroke = 'blue';
    yLine.stroke = 'blue';
    xLine.linewidth = 1;
    yLine.linewidth = 1;
    // tracking points
    xPoint = drawPixel({x: xOffset, y: yOffset}, 'red');
    yPoint = drawPixel({x: xOffset, y: yOffset}, 'red');
    xPoint.radius = 4;
    yPoint.radius = 4;
    xPoint.linewidth = 1;
    yPoint.linewidth = 1;
    xPoint.stroke = 'black';
    yPoint.stroke = 'black';
    // tracking new dot
    trackingDot = drawPixel({x: xOffset, y: yOffset}, 'black');
    trackingDot.radius = 1;

    // The recursive 'update' loop that runs everything 
    function update() {

        if (slow && count < points.length) {
            // draw point
            point = points[count];
            // actualPoints[count].fill = 'black';
            ctx.fillRect(point.x + canvasXOffset, point.y + canvasYOffset, pixelSize, pixelSize);
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
        }
        
        if (!slow || count >= points.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            count = 0
            while (count < end) {
                point = points[count];
                ctx.fillRect(point.x + canvasXOffset, point.y + canvasYOffset, pixelSize, pixelSize);
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

    function drawPixel(position, color='#000000') {
        let radius = 1;
        let circle = two.makeCircle(position.x, position.y, radius);
        circle.linewidth = 0;
        circle.fill = color;
        circle.stroke = color;
        return circle;
    }

    function anchor(x, y) {
        return new Two.Anchor(x, y);
    }

    // Generate a random hex color that can be used for CSS
    function randomColor () {
        return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);
    }
}