const vsSrcTrack = ` 
    attribute vec3 aPosition;
    attribute vec3 aColor;

    varying vec3 vColor;

    uniform mat4 mvMatrix;
    uniform mat4 pMatrix;

    void main() {
    vColor = aColor;
    gl_Position = pMatrix * mvMatrix * vec4(aPosition, 1.0);
}
`

const fSrcTrack = ` 
    precision mediump float;

    varying vec3 vColor;

    void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`

const vsSrcSpark = ` 
    attribute vec3 aPosition;

    uniform mat4 mvMatrix;
    uniform mat4 pMatrix;

    void main() {
    gl_Position = pMatrix * mvMatrix * vec4(aPosition, 1.0);
    gl_PointSize = 32.0;
}
`

const fSrcSpark = ` 
    precision mediump float;

    uniform sampler2D uTexture;

    void main() {
    gl_FragColor = texture2D(uTexture, gl_PointCoord);
}
`