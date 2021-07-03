window.onload = () => {

    // Initialize Two.js
    let elem = document.getElementById('draw-shapes');
    let two = new Two({
        width: 500,
        height: 500,
        fullscreen: true,
        type: Two.Types.svg
    }).appendTo(elem);

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
    let amplitude0 = 100;
    let amplitude1 = 0;
    //phase
    let xPhase0 = 0;
    let xPhase1 = 0;

    let points = [];

    let slow = false;
    let reverse = false;

    two.update(); // this initial 'update' creates SVG '_renderer' properties for our shapes that we can add action listeners to, so it needs to go here

    while (count < 30000) {
        count += 1;
        x0 += 1;
        x1 += 1;

        let b0 = (2 * Math.PI) / frequency0
        y0 = amplitude0 * Math.sin(b0 * (x0 + xPhase0));

        let b1 = (2 * Math.PI) / frequency1
        y1 = amplitude1 * Math.sin(b1 * (x1 + xPhase1));

        amplitude0 += .01;
        amplitude1 += .01;

        points.push({x: y0 + 600, y: y1 + 370})
    }

    if (reverse) {
        points.reverse();
    }

    if (!slow) {
        for (let index = 0; index < points.length; index++) {
            drawPixel(points[index]);
        }
    }

    count = 0;

    // The recursive 'update' loop that runs everything 
    function update() {

        if (slow) {
            drawPixel(points[count]);
            count += 1;
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

    // Generate a random hex color that can be used for CSS
    function randomColor () {
        return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);
    }
}