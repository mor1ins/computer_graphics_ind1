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

    colorCoef: NaN,
    textureCoef: NaN,
    materialCoef: NaN,
}


function updateState() {
    sceneState.lightPower = parseFloat(document.querySelector('#lightPower').value);
    sceneState.dampingFunction = parseInt(document.querySelector('.dampingFunction').value)

    sceneState.colorCoef = parseFloat(document.querySelector('#colorCoef').value);
    sceneState.textureCoef = parseFloat(document.querySelector('#textureCoef').value);
    sceneState.materialCoef = parseFloat(document.querySelector('#materialCoef').value);

    const x = parseInt(document.querySelector('#x_coord').value);
    const y = parseInt(document.querySelector('#y_coord').value);
    const z = parseInt(document.querySelector('#z_coord').value);

    sceneState.lightDirection = [x, y, z];
    sceneState.lightShininess = parseFloat(document.querySelector('#shininess').value);

    sceneState.shading = parseInt(document.querySelector('.shading').value)
    sceneState.lightModel = parseInt(document.querySelector('.lightModel').value)
}


class Drawable {
    constructor(webgl_context) {
        this.gl = webgl_context;

        this.position = NaN;

        this.positionBuffer = NaN;
        this.colorBuffer = NaN;
        this.triangleBuffer = NaN;
        this.normalBuffer = NaN;
        this.positions = NaN;
        this.colors = NaN;
        this.triangles = NaN;
        this.normals = NaN;
        this.textureCoordinates = NaN;
        this.texture = NaN;
        this.material = NaN;
    }

    setBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

        this.triangleBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), this.gl.STATIC_DRAW);

        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);

        this.textureCoordinatesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordinatesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates), this.gl.STATIC_DRAW);
    }

    getBuffers() {
        return {
            position: this.positionBuffer,
            color: this.colorBuffer,
            indices: this.triangleBuffer,
            normal: this.normalBuffer,

            raw_position: this.positions,
            raw_color: this.colors,
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

    setTextureCoordinate(programInfo) {
        const numComponents = 2;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordinatesBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoordinate,
            numComponents, type, normalize, stride, offset);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordinate);
    }

    setTexture(programInfo) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(programInfo.uniformLocations.texture, 0);
    }

    setMaterial(programInfo) {
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.material);
        this.gl.uniform1i(programInfo.uniformLocations.material, 1);
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

    loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  // непрозрачный синий
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            width, height, border, srcFormat, srcType,
            pixel);

        function isPowerOf2(value) {
            return (value & (value - 1)) === 0;
        }

        const image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };

        image.crossOrigin = '';
        image.src = url;

        return texture;
    }
}


class Sphere extends Drawable {
    constructor(webgl_context, size, color, default_position=[0.0, 0.0, 0.0]) {
        super(webgl_context);
        this.position = default_position;

        const SPHERE_DIV = 12;
        let i, ai, si, ci;
        let j, aj, sj, cj;
        let p1, p2;
        this.positions = [];
        for (j = 0; j <= SPHERE_DIV; j++)
        {
            aj = j * Math.PI / SPHERE_DIV;
            sj = Math.sin(aj);
            cj = Math.cos(aj);
            for (i = 0; i <= SPHERE_DIV; i++)
            {
                ai = i * 2 * Math.PI / SPHERE_DIV;
                si = Math.sin(ai);
                ci = Math.cos(ai);
                this.positions.push(si * sj);  // X
                this.positions.push(cj);       // Y
                this.positions.push(ci * sj);  // Z
            }
        }
        this.positions.map(v => v * size);

        this.triangles = [];
        for (j = 0; j < SPHERE_DIV; j++)
        {
            for (i = 0; i < SPHERE_DIV; i++)
            {
                p1 = j * (SPHERE_DIV+1) + i;
                p2 = p1 + (SPHERE_DIV+1);
                this.triangles.push(p1);
                this.triangles.push(p2);
                this.triangles.push(p1 + 1);
                this.triangles.push(p1 + 1);
                this.triangles.push(p2);
                this.triangles.push(p2 + 1);
            }
        }

        color = [...color, 1.0];
        this.colors = [...Array(this.positions.length * color.length).keys()]
            .map(i => color[i % color.length]);


        let center = [0, 0, 0];
        this.normals = this.positions.map((v, i) => v - center[i % center.length]);

        this.setBuffers();
    }
}


class Cube extends Drawable {
    constructor(webgl_context, size, color, texture_url, material_url, default_position=[0.0, 0.0, 0.0]) {
        super(webgl_context);

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

        const faceColors = [
            [...color,  1.0],    // Front face: white
            [...color,  1.0],    // Back face: red
            [...color,  1.0],    // Top face: green
            [...color,  1.0],    // Bottom face: blue
            [...color,  1.0],    // Right face: yellow
            [...color,  1.0],    // Left face: purple
        ];

        this.colors = [].concat.apply([], faceColors.map(color => [...color, ...color, ...color, ...color]));

        this.triangles = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        this.normals = [
            [0, 0, 1],    // front
            [0, 0, -1],   // back
            [0, 1, 0],    //
            [0, -1, 0],
            [1, 0, 0],
            [-1, 0, 0],
        ];

        this.normals = [].concat.apply([], this.normals.map(n => [...n, ...n, ...n, ...n]));

        this.textureCoordinates = [
            // Front
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Back
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Top
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Bottom
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Right
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Left
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
        ];

        this.texture = this.loadTexture(this.gl, texture_url);
        this.material = this.loadTexture(this.gl, material_url);

        this.setBuffers();
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
                textureCoordinate: this.gl.getAttribLocation(shaderProgram, 'aTextureCoordinate'),
            },
            uniformLocations: {
                textureMatrix: this.gl.getUniformLocation(shaderProgram, 'uTextureMatrix'),
                texture: this.gl.getUniformLocation(shaderProgram, 'uTexture'),
                material: this.gl.getUniformLocation(shaderProgram, 'uMaterial'),

                colorCoef: this.gl.getUniformLocation(shaderProgram, 'uColorCoef'),
                textureCoef: this.gl.getUniformLocation(shaderProgram, 'uTextureCoef'),
                materialCoef: this.gl.getUniformLocation(shaderProgram, 'uMaterialCoef'),

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
            new Cube(this.gl, 1, [1, 0.84, 0], './1.jpg', './wood.jpg', [0, -5, -20]), //gold
            new Cube(this.gl, 1, [1, 0.84, 0], './2.png', './wood.jpg', [0, 1.5, -7]), // gold
            new Cube(this.gl, 1, [0.75, 0.75, 0.75], './3.jpg', './wood.jpg', [-4, -0.5, -11]), //silver
            // new Sphere(this.gl, 5, [0.8, 0.5, 0.2], [3, -0.5, -9]), // bronze
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
                [-1, 0, 0],
                [1, 2, 3],
                [0, -1, 0],
                [3, 2, 1],
            ];
            process(obj, modelViewMatrix, this.cubeRotation / (i + 2), rotations[i % this.objects.length]);

            obj.setVertexPositions(this.programInfo);
            obj.setVertexColors(this.programInfo);
            obj.setNormals(this.programInfo);
            obj.setTextureCoordinate(this.programInfo);
            obj.setTexture(this.programInfo);
            obj.setMaterial(this.programInfo);

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

            this.gl.uniform1f(this.programInfo.uniformLocations.colorCoef, this.state.colorCoef);
            this.gl.uniform1f(this.programInfo.uniformLocations.textureCoef, this.state.textureCoef);
            this.gl.uniform1f(this.programInfo.uniformLocations.materialCoef, this.state.materialCoef);

            this.gl.drawElements(this.gl.TRIANGLES, buffers.raw_indices.length, this.gl.UNSIGNED_SHORT, 0);

            // console.log(Math.max(...buffers.raw_indices));
        });
        this.cubeRotation += deltaTime * 2;
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
        
        uniform float uColorCoef;
        uniform float uTextureCoef;
        uniform float uMaterialCoef;
        
        uniform sampler2D uTexture;
        uniform sampler2D uMaterial;
        
        varying vec4 vPosition;
        varying vec4 vColor;
        varying vec3 vNormal;
        varying vec2 vTextureCoordinate;
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
            vec3 halfwayVector = normalize(lightDir - viewPosition);
            float specular = pow(positive_dot(halfwayVector, normal), shininess);
            return (lambertComponent + specular) * power;
        }
        
        float celShaded(vec3 normal, vec3 lightPosition, float power) {
            float light = lambert(normal, lightPosition, power);

            if (light > 0.95) {
                light = 1.0;
            } else if (light > 0.5) {
                light = 0.8;
            } else if (light > 0.2) {
                light = 0.3;
            } else {
                light = 0.2;
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
    attribute vec2 aTextureCoordinate;
    
    ${commonVariables}
    
    ${commonFunctions}
    
    void main(void) {
        vec3 normal = normalize(mat3(uModelViewMatrix) * aNormal);
        vec3 positionEye3 = vec3(uModelViewMatrix * aVertexPosition);
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
        vTextureCoordinate = aTextureCoordinate;
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
        
        float total = uColorCoef + uTextureCoef + uMaterialCoef;
        
        gl_FragColor = vec4(
            vec3(vColor) * uColorCoef / total 
            + vec3(texture2D(uTexture, vTextureCoordinate)) * uTextureCoef / total
            + vec3(texture2D(uMaterial, vTextureCoordinate)) * uMaterialCoef / total, 1.0);
        gl_FragColor.rgb *= light;
    }`;

    const scene = new Scene(gl, vsSource, fsSource, sceneState);
    scene.start();
}

updateState();
main();