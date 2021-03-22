let process = (obj, modelViewMatrix, rad, axis) => obj.rotate(modelViewMatrix, rad, axis);


const sceneState = {
    lightPower: NaN,
    lightDirection: NaN,
    dampingFunction: NaN,
    lightAmbient: NaN,
    lightDiffuse: NaN,
    lightSpecular: NaN,
    lightShininess: NaN,
    shading: NaN,
    lightModel: NaN,
}


function updateState() {
    sceneState.lightPower = parseFloat(document.querySelector('#lightPower').value);
    sceneState.dampingFunction = parseInt(document.querySelector('.dampingFunction').value)

    const x = parseInt(document.querySelector('#x_coord').value);
    const y = parseInt(document.querySelector('#y_coord').value);
    const z = parseInt(document.querySelector('#z_coord').value);

    sceneState.lightDirection = [x, y, z];
    sceneState.lightShininess = parseFloat(document.querySelector('#shininess').value);

    sceneState.shading = parseInt(document.querySelector('.shading').value)
    sceneState.lightModel = parseInt(document.querySelector('.lightModel').value)
}


// window.addEventListener('keydown', function (event)
// {
//     if (event.key === '1') {
//         sceneState.dampingFunction = 0;
//     }
//     else if (event.key === '2') {
//         sceneState.dampingFunction = 1;
//     }
// });


class Cube {
    constructor(webgl_context, size, color, default_position=[0.0, 0.0, 0.0]) {
        this.gl = webgl_context;

        this.positions = ([
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ]).map((point, i) => point * size);

        this.position = default_position;

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

        this.faceColors = [
            [...color,  1.0],    // Front face: white
            [...color,  1.0],    // Back face: red
            [...color,  1.0],    // Top face: green
            [...color,  1.0],    // Bottom face: blue
            [...color,  1.0],    // Right face: yellow
            [...color,  1.0],    // Left face: purple
        ];

        this.colors = [].concat.apply([], this.faceColors.map(color => [...color, ...color, ...color, ...color]));

        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);


        this.triangles = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        this.triangleBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.triangles), this.gl.STATIC_DRAW);


        this.normals = [
            [0, 0, 1],    // front
            [0, 0, -1],   // back
            [0, 1, 0],    //
            [0, -1, 0],
            [1, 0, 0],
            [-1, 0, 0],
        ];


        // this.normals = [].concat.apply([], this.normals.map(n => [...n, ...n, ...n, ...n, ...n, ...n]));
        this.normals = [].concat.apply([], this.normals.map(n => [...n, ...n, ...n, ...n]));

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
    }

    getBuffers() {
        return {
            position: this.positionBuffer,
            color: this.colorBuffer,
            indices: this.triangleBuffer,
            normal: this.normalBuffer,

            raw_position: this.positions,
            raw_color: this.faceColors,
            raw_indices: this.triangles,
            raw_normals: this.normals,
        };
    }

    setVertexPositions(programInfo) {
        const numComponents = 3;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents, type, normalize, stride, offset);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    setVertexColors(programInfo) {
        const numComponents = 4;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents, type, normalize, stride, offset);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    setNormals(programInfo) {
        const numComponents = 3;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.normal,
            numComponents, type, normalize, stride, offset);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.normal);
    }

    to_position(modelViewMatrix) {
        this.translate(modelViewMatrix, this.position);
    }

    translate(modelViewMatrix, translation) {
        // return mat4.translate(modelViewMatrix, modelViewMatrix, this.position.map(
        //     (p, i) => p + translation[i])
        // );
        return mat4.translate(modelViewMatrix, modelViewMatrix, translation);
    }

    rotate(modelViewMatrix, rad, axis) {
        return mat4.rotate(modelViewMatrix, modelViewMatrix, rad, axis);
    }

    rotateAround(modelViewMatrix, rad, axis, point) {
        const translation = this.position.map(
            (p, i) => p - point[i]
        );

        this.translate(modelViewMatrix, translation.map(p => -p));
        this.rotate(modelViewMatrix, rad, axis);
        this.translate(modelViewMatrix, translation);
    }
}


class Scene {
    constructor(webgl_context, vertex_shader, fragment_shader, store) {
        this.gl = webgl_context;
        this.vertexShader = vertex_shader;
        this.fragmentShader = fragment_shader;
        this.state = store;

        const shaderProgram = this.initShaderProgram();

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                normal: this.gl.getAttribLocation(shaderProgram, 'aNormal'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),

                lightPower: this.gl.getUniformLocation(shaderProgram, 'uLightPower'),
                lightDirection: this.gl.getUniformLocation(shaderProgram, 'uLightDirection'),
                lightAmbient: this.gl.getUniformLocation(shaderProgram, 'uLightAmbient'),
                lightDiffuse: this.gl.getUniformLocation(shaderProgram, 'uLightDiffuse'),
                lightSpecular: this.gl.getUniformLocation(shaderProgram, 'uLightSpecular'),
                lightShininess: this.gl.getUniformLocation(shaderProgram, 'uLightShininess'),
                dampingFunction: this.gl.getUniformLocation(shaderProgram, 'uDampingFunction'),

                viewPosition: this.gl.getUniformLocation(shaderProgram, 'uViewPosition'),
                lightModel: this.gl.getUniformLocation(shaderProgram, 'uLightModel'),
                shading: this.gl.getUniformLocation(shaderProgram, 'uShading'),
            }
        };

        this.objects = [
            new Cube(this.gl, 2, [1, 0.84, 0], [0, -3.5, -20]), //gold
            new Cube(this.gl, 0.8, [1, 0.84, 0], [0, 1, -7]), // gold
            new Cube(this.gl, 1.2, [0.75, 0.75, 0.75], [-4, -0.5, -11]), //silver
            new Cube(this.gl, 1.2, [0.8, 0.5, 0.2], [4, -0.5, -11]), // bronze
        ];

        this.then = 0;

        this.fieldOfView = 45 * Math.PI / 180;   // in radians
        this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;

        this.cubeRotation = 0.0;
    }

    getBuffers() {
        return this.objects.map(obj => obj.getBuffers());
    }

    start() {
        const render = now => {
            now *= 0.001;  // convert to seconds
            const deltaTime = now - this.then;
            this.then = now;

            this.drawScene(deltaTime);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }

    drawScene(deltaTime) {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);


        this.objects.forEach((obj, i) => {
            const modelViewMatrix = mat4.create();
            obj.to_position(modelViewMatrix);

            let rotations = [
                [1, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 1],
            ];
            process(obj, modelViewMatrix, this.cubeRotation / (i + 1), rotations[i % this.objects.length]);

            obj.setVertexPositions(this.programInfo);
            obj.setVertexColors(this.programInfo);
            obj.setNormals(this.programInfo);

            const buffers = obj.getBuffers();

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            this.gl.useProgram(this.programInfo.program);

            this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            this.gl.uniform1f(this.programInfo.uniformLocations.lightPower, this.state.lightPower);
            this.gl.uniform3fv(this.programInfo.uniformLocations.lightDirection, this.state.lightDirection);
            this.gl.uniform1f(this.programInfo.uniformLocations.lightShininess, this.state.lightShininess);
            this.gl.uniform1i(this.programInfo.uniformLocations.dampingFunction, this.state.dampingFunction);
            this.gl.uniform3fv(this.programInfo.uniformLocations.viewPosition, [0, 0, 10]);

            this.gl.uniform1i(this.programInfo.uniformLocations.lightModel, this.state.lightModel);
            this.gl.uniform1i(this.programInfo.uniformLocations.shading, this.state.shading);

            this.gl.drawElements(this.gl.TRIANGLES, buffers.raw_indices.length, this.gl.UNSIGNED_SHORT, 0);
        });
        this.cubeRotation += deltaTime;
    }

    initShaderProgram() {
        const vertexShader = this.loadShader(this.gl, this.gl.VERTEX_SHADER, this.vertexShader);
        const fragmentShader = this.loadShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentShader);

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}


function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    const precision = 'precision mediump float;';

    const commonVariables = `
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        uniform float uLightPower;
        uniform vec3 uLightDirection;
        
        uniform lowp int uDampingFunction;
        uniform lowp int uShading;
        uniform lowp int uLightModel;
        uniform float uLightShininess;
        
        varying vec4 vPosition;
        varying vec4 vColor;
        varying vec3 vNormal;
    `;

    const commonFunctions = `
        float sqr(float coef) {
            return coef * coef;
        }
        
        float linear(float coef) {
            return coef;
        }
    
        float positive_dot(vec3 left, vec3 right) {
            return max(dot(left, right), 0.0);
        }
        
        float lambert(vec3 normal, vec3 lightPosition, float power) {
            return max(dot(normal, normalize(lightPosition)), 0.0) * power;    
        }
        
        float phong(vec3 normal, vec3 lightDir, vec3 viewPosition, float power, float shininess) {
            float diffuseLightDot = positive_dot(normal, lightDir);
            vec3 reflectionVector = normalize(reflect(-lightDir, normal));
            float specularLightDot = positive_dot(reflectionVector, -normalize(viewPosition));
            float specularLightParam = pow(specularLightDot, shininess);
            return (diffuseLightDot + specularLightParam) * power;
        }
        
        float blinn(vec3 normal, vec4 vertex, vec3 lightDir, vec3 viewPosition, float power, float shininess) {
            float lambertComponent = positive_dot(normal, lightDir);
            vec3 halfwayVector = normalize(lightDir + viewPosition);
            float specular = pow(positive_dot(halfwayVector, normal), shininess);
            return (lambertComponent + specular) * power;
        }
        
        float celShaded(vec3 normal, vec3 lightPosition, float power) {
            float light = lambert(normal, lightPosition, power);

            if (light > 0.95) {
                light = 1.0;
            } else if (light > 0.5) {
                light = 0.7;
            } else if (light > 0.2) {
                light = 0.2;
            } else {
                light = 0.05;
            }

            return light;
        }
        
        float evaluateLighting(int shading, int current, int lightModel, vec3 normal, vec4 vertex,
                               vec3 lightDir, vec3 viewPosition, float power, float shininess) 
        {
            float light = 1.0;
            if (shading == current) {
                if (lightModel == 0) {
                    light = lambert(normal, lightDir, power);   
                }
                else if (lightModel == 1) {
                    light = phong(normal, lightDir, viewPosition, power, shininess);
                }
                else if (lightModel == 2) {
                    light = celShaded(normal, lightDir, power);   
                }
                else if (lightModel == 3) {
                    light = blinn(normal, vertex, lightDir, viewPosition, power, shininess);
                }
            }
            return light;
        }
        
        float dampLight(int dampingFunction, float light) {
            float new_light = light;
        
            if (dampingFunction == 0) {
                new_light = linear(light);   
            }
            else if (dampingFunction == 1) {
                new_light = sqr(light);    
            }
            
            return new_light;
        }
    `

    const vsSource = `
    ${precision}
    
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aNormal;
    
    ${commonVariables}
    
    ${commonFunctions}
    
    void main(void) {
        vec3 normal = normalize(mat3(uModelViewMatrix) * aNormal);
        vec3 positionEye3 = vec3(uModelViewMatrix * vPosition);
        vec3 lightDirection = normalize(uLightDirection - positionEye3);
        
        int current = 1;
        
        float light = evaluateLighting(
            uShading, current, uLightModel, normal, aVertexPosition, 
            lightDirection, positionEye3, uLightPower, uLightShininess);
        light = dampLight(uDampingFunction, light);
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        vColor.rgb *= light;
        vPosition = aVertexPosition;
        vNormal = normal;
    }
    `;

    const fsSource = `
    ${precision}
    
    ${commonVariables}
    
    ${commonFunctions}
    
    void main(void) {
        vec3 positionEye3 = vec3(uModelViewMatrix * vPosition);
        vec3 lightDirection = normalize(uLightDirection - positionEye3);
        
        int current = 0;
        
        float light = evaluateLighting(
            uShading, current, uLightModel, vNormal, vPosition, 
            lightDirection, positionEye3, uLightPower, uLightShininess);
        light = dampLight(uDampingFunction, light);
        
        gl_FragColor = vColor;
        gl_FragColor.rgb *= light;
    }
    `;

    const scene = new Scene(gl, vsSource, fsSource, sceneState);
    scene.start();
}

updateState();
main();