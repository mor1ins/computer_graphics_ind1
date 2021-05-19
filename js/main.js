function main() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const programTrack = initShaderProgram(gl, vsSrcTrack, fSrcTrack);
    const programSpark = initShaderProgram(gl, vsSrcSpark, fSrcSpark);
    const programInfoTrack = {
        program: programTrack,
        vertexPosition: gl.getAttribLocation(programTrack, 'aPosition'),
        vertexColor: gl.getAttribLocation(programTrack, 'aColor'),
        projectionMatrix: gl.getUniformLocation(programTrack, 'pMatrix'),
        modelViewMatrix: gl.getUniformLocation(programTrack, 'mvMatrix'),
    };

    const programInfoSpark = {
        program: programSpark,
        vertexPosition: gl.getAttribLocation(programSpark, 'aPosition'),
        projectionMatrix: gl.getUniformLocation(programSpark, 'pMatrix'),
        modelViewMatrix: gl.getUniformLocation(programSpark, 'mvMatrix'),
        texture: gl.getUniformLocation(programSpark, 'uTexture'),
    };

    const texture = loadTexture(gl, './spark.png', render);

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    const sparks = [];
    for (let i = 0; i < Spark.sparksCount; i++) sparks.push(new Spark());

    function render(now) {
        prepareCanvas(gl)

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < sparks.length; i++) sparks[i].move(now);

        const positions = [];
        sparks.forEach(function (item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);

            positions.push(0);
        });

        drawTracks(gl, programInfoTrack, positions, pMatrix, mvMatrix);
        drawSparks(gl, programInfoSpark, positions, texture, pMatrix, mvMatrix);

        requestAnimationFrame(render);
    }
}

function drawSparks(gl, prog, positions, texture, pMatrix, mvMatrix) {
    gl.useProgram(prog.program);

    gl.uniformMatrix4fv(prog.projectionMatrix, false, pMatrix);
    gl.uniformMatrix4fv(prog.modelViewMatrix, false, mvMatrix);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(prog.texture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(prog.vertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(prog.vertexPosition);

    gl.drawArrays(gl.POINTS, 0, positions.length / 3);
}


function drawTracks(gl, prog, positions, pMatrix, mvMatrix) {
    const colors = [];
    const positionsFromCenter = [];
    for (let i = 0; i < positions.length; i += 3) {
        positionsFromCenter.push(0, 0, 0);
        positionsFromCenter.push(positions[i], positions[i + 1], positions[i + 2]);

        colors.push(1, 1, 1, 0.47, 0.31, 0.24);
    }

    gl.useProgram(prog.program);

    gl.uniformMatrix4fv(prog.projectionMatrix, false, pMatrix);
    gl.uniformMatrix4fv(prog.modelViewMatrix, false, mvMatrix);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsFromCenter), gl.STATIC_DRAW);

    gl.vertexAttribPointer(prog.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prog.vertexPosition);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.vertexAttribPointer(prog.vertexColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prog.vertexColor);

    gl.drawArrays(gl.LINES, 0, positionsFromCenter.length / 3);
}

window.onload = main;