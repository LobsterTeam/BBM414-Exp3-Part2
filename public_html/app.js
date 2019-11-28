"use strict";
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// FIDAN SAMET 21727666
// OGUZ BAKIR 21627007

const triangleVertexNum = 12;
const triangleFanNumber = 360;
const gray = vec3(64 / 255.0, 64 / 255.0, 64 / 255.0);
const initialSpeed = 0;
var ninjaStarData = [];
var angles = 0;
var speed = initialSpeed;
var startRotation = false;
var turnRight = false;
var startScale = false;
var scaleBig = false;
var scale = 0.25;
var startSpiral = false;
var spiralPos = 0.0;
var spiralCounter = 0;
var numOfComponents = 2;        // x and y (2d)
var offset = 0;
var initialAngle = 0;

function main() {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    
    gl.clearColor(250 / 255.0, 237 / 255.0, 51 / 255.0, 1.0);       // yellow
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    
    // DRAW TRIANGLES OF NINJA STAR
    ninjaStarTriangle(); 
    const triangleShader = initShaderProgram(gl, vertexShader, triangleFragmentShader);
    const triangleBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(gl.getAttribLocation(triangleShader, 'i_position'));
    var triangleTheta = gl.getUniformLocation(triangleShader, 'u_spin_theta');
    var triangleScale = gl.getUniformLocation(triangleShader, 'i_scale');
    var triangleTranslateTheta = gl.getUniformLocation(triangleShader, 'u_translate_theta');
    var triangleSymmetry = gl.getUniformLocation(triangleShader, 'u_symmetry');
    
    // DRAW CIRCLES OF NINJA STAR
    ninjaStarCircle();
    const circleShader = initShaderProgram(gl, vertexShader, circleFragmentShader);
    const circleBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(gl.getAttribLocation(circleShader, 'i_position'));
    var circleTheta = gl.getUniformLocation(circleShader, 'u_spin_theta');
    var circleScale = gl.getUniformLocation(circleShader, 'i_scale');
    var circleTranslateTheta = gl.getUniformLocation(circleShader, 'u_translate_theta');
    var circleSymmetry = gl.getUniformLocation(circleShader, 'u_symmetry');
    
    // ROTATION ANIMATION
    function render () {
        
        if (startRotation) {
            if (turnRight) {
                angles += speed;
            } else {
                angles -= speed;
            }
        }
        
        if (startScale) {
            // scaling
            if (scale >= 0.375) {        // 1.5 scale
                scaleBig = false;
            } else if (scale <= 0.125) {     // 0.5 scale
                scaleBig = true;
            }
            
            if (scaleBig) {
                scale += 0.01;
                console.log(scale);
            } else {
                scale -= 0.01;
                console.log(scale);
            }
        }
        
        if (startSpiral) {
            
            if (initialAngle <= -360){
                spiralPos = 1.0;
            } else if (initialAngle >= 0) {
                spiralPos = 0.0;
            }
            console.log(initialAngle);
            if (spiralPos == 1.0) {
                initialAngle += spiralCounter;
            } else {
                initialAngle -= spiralCounter;
            }
        }
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // TRIANGLES
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ninjaStarData), gl.STATIC_DRAW);
    
        // TRIANGLE POSITIONS
        offset = 0;
        gl.vertexAttribPointer(gl.getAttribLocation(triangleShader, 'i_position'),
            numOfComponents, type, normalize, stride, offset);
        gl.useProgram(triangleShader);
        gl.uniform1f(triangleTheta, angles);
        gl.uniform1f(triangleScale, scale);
        gl.uniform1f(triangleTranslateTheta, initialAngle);
        gl.uniform1f(triangleSymmetry, spiralPos);
        
        // DRAW TRIANGLES
        gl.drawArrays(gl.TRIANGLES, offset, triangleVertexNum);

        // CIRCLES
        gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ninjaStarData), gl.STATIC_DRAW);
        
        // CIRCLE POSITIONS
        offset = (12 * 2) * 4;      // 2 components for positions, 3 for colors
        gl.vertexAttribPointer(gl.getAttribLocation(circleShader, 'i_position'),
                numOfComponents, type, normalize, stride, offset);
        gl.useProgram(circleShader);
        gl.uniform1f(circleTheta, angles);
        gl.uniform1f(circleScale, scale);
        gl.uniform1f(circleTranslateTheta, initialAngle);
        gl.uniform1f(circleSymmetry, spiralPos);

        // DRAW CIRCLES
        for (var i = 0; i < 5; i++) {
            gl.drawArrays(gl.TRIANGLE_FAN, i * triangleFanNumber + i, triangleFanNumber);
        }
        
        // animate on 2 and 3
        if (startRotation || startScale || startSpiral) {
            requestAnimationFrame(render);
        }
    }
    
    render();
    
    document.getElementById("startSpin").onclick = function(){
        if (startRotation == false) {
            startRotation = true;
            if (!(startSpiral || startScale)) { // if there is no animation going on
                render();
            }
        }
    };
    document.getElementById("stopSpin").onclick = function(){
        if (startRotation == true) {
            startRotation = false;
        }
    };
    document.getElementById("spinCounter").onclick = function(){
        if (startRotation == true) {
            speed = parseInt(document.getElementById("spinCounter").value);
            console.log(speed);
        }
    };
    document.getElementById("startScale").onclick = function(){
        if (startScale == false) {
            startScale = true;
            scaleBig = true;
            if (!(startRotation || startSpiral)) { // if there is no animation going on
                render();
            }
        }
    };
    document.getElementById("stopScale").onclick = function(){
        if (startScale == true) {
            startScale = false;
            scaleBig = false;
        }
    };
    document.getElementById("startSpiral").onclick = function(){
        if (startSpiral == false) {
            startSpiral = true;
            if (!(startRotation || startScale)) { // if there is no animation going on
                render();
            }
        }
    };
    document.getElementById("stopSpiral").onclick = function(){
        if (startSpiral == true) {
            startSpiral = false;
        }
    };
    document.getElementById("spiralCounter").onclick = function(){
        if (startSpiral == true) {
            spiralCounter = parseInt(document.getElementById("spiralCounter").value);
        }
    };
}

function ninjaStarTriangle() {
    var circlePositions = [
        vec2(-1, 1),
        vec2(1 / 3, 1 / 3),
        vec2(-1 / 3, -1 / 3)
    ];
    ninjaStarData = ninjaStarData.concat(circlePositions[0], circlePositions[1], circlePositions[2]);

    var circlePositions = [
        vec2(-1, -1),
        vec2(-1 / 3, 1 / 3),
        vec2(1 / 3, -1 / 3)
    ];
    ninjaStarData = ninjaStarData.concat(circlePositions[0], circlePositions[1], circlePositions[2]);

    var circlePositions = [
        vec2(1, -1),
        vec2(1 / 3, 1 / 3),
        vec2(-1 / 3, -1 / 3)
    ];
    ninjaStarData = ninjaStarData.concat(circlePositions[0], circlePositions[1], circlePositions[2]);

    var circlePositions = [
        vec2(1, 1),
        vec2(-1 / 3, 1 / 3),
        vec2(1 / 3, -1 / 3)
    ];
    ninjaStarData = ninjaStarData.concat(circlePositions[0], circlePositions[1], circlePositions[2]);
    
    // append grays
    //for (var i = 0; i < triangleVertexNum; i++) {
    //    ninjaStarData= ninjaStarData.concat(gray);
    //}
}

function ninjaStarCircle() {
    circle(0, 0);
    circle(0, 1 / 2);
    circle(-1 / 2, 0);
    circle(0, -1 / 2);
    circle(1 / 2, 0);
}

function circle(a, b) {
    var origin = [a, b];
    var r = 0.1;

    for (var i = 0; i <= triangleFanNumber; i += 1) {
        var j = i * Math.PI / 180;
        var vert = [r * Math.sin(j) + a, r * Math.cos(j) + b];
        ninjaStarData.push(vert[0], vert[1]);
    }
}

// not used
function scaleMatrixOfNinjaStar(Sx, Sy) {
    return [
        Sx, 0.0, 0.0,
        0.0, Sy, 0.0,
        0.0, 0.0, 1.0
    ];
}

// not used
function rotationMatrixOfNinjaStar(angles) {
    // rotate about the z-axis
    var cos = Math.cos(angles);
    var sin = Math.sin(angles);
    return [
        cos,-sin, 0.0,
        sin, cos, 0.0,
        0.0, 0.0, 1.0];
}

// not used
function colorMatrixOfNinjaStar () {
    var component;
    if (changeColor) {
        var cos = Math.cos(angles);
        component = Math.pow((1/cos), 2);
    } else {
        component = 1;      // original color
    }
    
    return [
        component, 0.0, 0.0,
        0.0, component, 0.0,
        0.0, 0.0, 1.0];
}

function multiplyMatrices(a, b) {
    var a00 = a[0*3+0];
    var a01 = a[0*3+1];
    var a02 = a[0*3+2];
    var a10 = a[1*3+0];
    var a11 = a[1*3+1];
    var a12 = a[1*3+2];
    var a20 = a[2*3+0];
    var a21 = a[2*3+1];
    var a22 = a[2*3+2];
    var b00 = b[0*3+0];
    var b01 = b[0*3+1];
    var b02 = b[0*3+2];
    var b10 = b[1*3+0];
    var b11 = b[1*3+1];
    var b12 = b[1*3+2];
    var b20 = b[2*3+0];
    var b21 = b[2*3+1];
    var b22 = b[2*3+2];
    return [a00 * b00 + a01 * b10 + a02 * b20,
            a00 * b01 + a01 * b11 + a02 * b21,
            a00 * b02 + a01 * b12 + a02 * b22,
            a10 * b00 + a11 * b10 + a12 * b20,
            a10 * b01 + a11 * b11 + a12 * b21,
            a10 * b02 + a11 * b12 + a12 * b22,
            a20 * b00 + a21 * b10 + a22 * b20,
            a20 * b01 + a21 * b11 + a22 * b21,
            a20 * b02 + a21 * b12 + a22 * b22];
}

main();