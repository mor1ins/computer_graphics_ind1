window.onload = loadScene;

let canvas, gl,
    ratio,
    vertices,
    velocities,
    frequencyArray,
    weight,
    height,
    thetaArray,
    dxThetaArray,
    dxRadiusArray,
    drawType,
    pointColor,
    numLines = 20000;
let randomTargetXArr = [], randomTargetYArr = [];
drawType = 2;


function loadShader(shaderText, type) {
    let vertexShader = gl.createShader(type);
    gl.shaderSource(vertexShader, shaderText);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("Couldn't compile the vertex shader");
        gl.deleteShader(vertexShader);
        return;
    }
    return vertexShader;
}

function linkProgram(vertexShader, fragmentShader) {
    gl.program = gl.createProgram();
    gl.attachShader(gl.program, vertexShader);
    gl.attachShader(gl.program, fragmentShader);
    gl.linkProgram(gl.program);
    if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
        alert("Unable to initialise shaders");
        gl.deleteProgram(gl.program);
        gl.deleteProgram(vertexShader);
        gl.deleteProgram(fragmentShader);
        return;
    }
}

function getMatrices() {
    const fieldOfView = 30.0;
    const aspectRatio = canvas.width / canvas.height;
    const nearPlane = 1.0;
    const farPlane = 10000.0;
    const top = nearPlane * Math.tan(fieldOfView * Math.PI / 360.0);
    const bottom = -top;
    const right = top * aspectRatio;
    const left = -right;

    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = (farPlane + nearPlane) / (farPlane - nearPlane);
    const d = (2 * farPlane * nearPlane) / (farPlane - nearPlane);
    const x = (2 * nearPlane) / (right - left);
    const y = (2 * nearPlane) / (top - bottom);
    const perspectiveMatrix = [
        x, 0, a, 0,
        0, y, b, 0,
        0, 0, c, d,
        0, 0, -1, 0
    ];

    const modelViewMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    return [perspectiveMatrix, modelViewMatrix];
}

function loadScene() {
    canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("There's no WebGL context available.");
        return;
    }

    weight = window.innerWidth;
    height = window.innerHeight;
    canvas.width = weight;
    canvas.height = height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vertexShader = loadShader(document.getElementById("shader-vs").text, gl.VERTEX_SHADER);
    const fragmentShader = loadShader(document.getElementById("shader-fs").text, gl.FRAGMENT_SHADER);

    linkProgram(vertexShader, fragmentShader);

    gl.useProgram(gl.program);

    var vertexPosition = gl.getAttribLocation(gl.program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);


    setup();

    vertices = new Float32Array(vertices);
    velocities = new Float32Array(velocities);

    thetaArray = new Float32Array(thetaArray);
    dxThetaArray = new Float32Array(dxThetaArray);
    dxRadiusArray = new Float32Array(dxRadiusArray);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    const [perspectiveMatrix, modelViewMatrix] = getMatrices();


    var vertexPosAttribLocation = gl.getAttribLocation(gl.program, "vertexPosition");

    gl.vertexAttribPointer(vertexPosAttribLocation, 3.0, gl.FLOAT, false, 0, 0);

    var uModelViewMatrix = gl.getUniformLocation(gl.program, "modelViewMatrix");
    var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix");
    pointColor = gl.getUniformLocation(gl.program, 'uColor');

    gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(modelViewMatrix));
    gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(perspectiveMatrix));

    animate();

    function timer() {
        drawType = (drawType + 1) % 3;
    }

    setInterval(timer, 1500);
}


function animate() {
    requestAnimationFrame(animate);
    drawScene();
}


function drawScene() {
    draw();

    gl.lineWidth(.1);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawArrays(gl.POINTS, 0, numLines);
    gl.drawArrays(gl.LINES, 0, numLines);
    gl.flush();
}

function setup() {
    vertices = [];
    dxThetaArray = [];
    dxRadiusArray = [];
    ratio = weight / height;
    velocities = [];
    thetaArray = [];

    for (let i = 0; i < numLines; i++) {
        var radius = ( 0.2 + .1 * Math.random() );
        var theta = Math.random() * Math.PI * 2;
        var velTheta = Math.random() * Math.PI * 2 / 30;
        var randomPosX = (Math.random() * 2  - 1) * ratio;
        var randomPosY = Math.random() * 2 - 1;

        vertices.push(radius * Math.cos(theta), radius * Math.sin(theta), 0.5);
        vertices.push(radius * Math.cos(theta), radius * Math.sin(theta), 0.9);

        thetaArray.push(theta);
        dxThetaArray.push(velTheta);
        dxRadiusArray.push(radius);

        randomTargetXArr.push(randomPosX);
        randomTargetYArr.push(randomPosY);
    }

    frequencyArray = new Float32Array(frequencyArray);
}

function draw() {
    switch (drawType) {
        case 0:
            gl.uniform4fv(pointColor, new Float32Array([0.8, 0.3, 0.2, 1.0]));
            draw0();
            break;
        case 1:
            gl.uniform4fv(pointColor, new Float32Array([0.2, 0.3, 0.4, 1.0]));
            draw1();
            break;
        case 2:
            gl.uniform4fv(pointColor, new Float32Array([0.2, 0.3, 0.4, 1.0]));
            draw2();
            break;
    }
}

function draw0() {
    for (let i = 0; i < numLines * 2; i += 2) {
        let bp = i * 3;

        vertices[bp] = vertices[bp + 3];
        vertices[bp + 1] = vertices[bp + 4];

        let num = parseInt(i / 2);
        let targetX = randomTargetXArr[num];
        let targetY = randomTargetYArr[num];

        let px = vertices[bp + 3];
        px += (targetX - px) * (Math.random() * .02 + .005);
        vertices[bp + 3] = px;

        let py = vertices[bp + 4];
        py += (targetY - py) * (Math.random() * .02 + .005);
        vertices[bp + 4] = py;
    }
}


function draw1() {
    for (let i = 0; i < numLines * 2; i += 2) {
        let bp = i * 3;

        vertices[bp] = vertices[bp + 3];
        vertices[bp + 1] = vertices[bp + 4];

        let num = parseInt(i / 2);
        let pTheta = thetaArray[num];
        let rad = dxRadiusArray[num];

        pTheta = pTheta + dxThetaArray[num];
        thetaArray[num] = pTheta;

        let targetX = rad * Math.cos(pTheta);
        let targetY = rad * Math.sin(pTheta);

        let px = vertices[bp + 3];
        px += (targetX - px) * (Math.random() * .1 + .1);
        vertices[bp + 3] = px;

        let py = vertices[bp + 4];
        py += (targetY - py) * (Math.random() * .1 + .1);
        vertices[bp + 4] = py;
    }
}


function draw2() {
    for (let i = 0; i < numLines * 2; i += 2) {
        let bp = i * 3;

        vertices[bp] = vertices[bp + 3];
        vertices[bp + 1] = vertices[bp + 4];

        let num = parseInt(i / 2);
        let pTheta = thetaArray[num];
        let rad = dxRadiusArray[num];

        pTheta = pTheta + dxThetaArray[num];
        thetaArray[num] = pTheta;

        let px = vertices[bp + 3];
        px += rad * Math.cos(pTheta) * 0.1;
        vertices[bp + 3] = px;

        let py = vertices[bp + 4];
        py += rad * Math.sin(pTheta) * 0.1;
        vertices[bp + 4] = py;
    }
}