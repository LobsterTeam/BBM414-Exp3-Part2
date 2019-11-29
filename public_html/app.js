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
var ninjaStarData = [];
var spinAngles = 0;
var spinSpeed = 0;
var startSpin = false;
var rightSpin = false;
var startScale = false;
var scaleBig = false;
var scale = 0.25;
var startSpiral = false;
var spiralPos = 0.0;
var spiralCounter = 0;
var spiralAngle = 0;
var numOfComponents = 2;        // x and y (2d)
var offset = 0;

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
    var triangleSpinTheta = gl.getUniformLocation(triangleShader, 'u_spin_theta');
    var triangleScale = gl.getUniformLocation(triangleShader, 'u_scale');
    var triangleTranslateTheta = gl.getUniformLocation(triangleShader, 'u_translate_theta');
    var triangleSpinSymmetry = gl.getUniformLocation(triangleShader, 'u_spin_symmetry');
    
    // DRAW CIRCLES OF NINJA STAR
    ninjaStarCircle();
    const circleShader = initShaderProgram(gl, vertexShader, circleFragmentShader);
    const circleBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(gl.getAttribLocation(circleShader, 'i_position'));
    var circleSpinTheta = gl.getUniformLocation(circleShader, 'u_spin_theta');
    var circleScale = gl.getUniformLocation(circleShader, 'u_scale');
    var circleTranslateTheta = gl.getUniformLocation(circleShader, 'u_translate_theta');
    var circleSpinSymmetry = gl.getUniformLocation(circleShader, 'u_spin_symmetry');
    
    // ROTATION ANIMATION
    function render () {
        
        if (startSpin) {
            if (rightSpin) {
                spinAngles += spinSpeed;
            } else {
                spinAngles -= spinSpeed;
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
                scale += 0.005;
            } else {
                scale -= 0.005;
            }
        }
        
        if (startSpiral) {
            
            // spiralCounter negative and spiralAngle greater than 360 then spiral positive
            // spiralCounyer negative and spiralAngle smaller than -360 then spiral positive
            if ((spiralCounter < 0 && spiralAngle >= 450) 
                    || (spiralCounter > 0 && spiralAngle <= -450)) {
                spiralPos = 1.0;
            // spiralCounter negative and spiralAngle smaller than 0 then spiral negative
            // spiralCounter positive and spiralAngle greater than 0 then spiral negative
            } else if ((spiralCounter < 0 && spiralAngle <= 0) 
                    || (spiralCounter > 0 && spiralAngle >= 0)) {
                spiralPos = 0.0;
            }
                        
            if (spiralPos == 1.0) {
                spiralAngle += spiralCounter;
            } else {
                spiralAngle -= spiralCounter;
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
        gl.uniform1f(triangleSpinTheta, spinAngles);
        gl.uniform1f(triangleScale, scale);
        gl.uniform1f(triangleTranslateTheta, spiralAngle);
        gl.uniform1f(triangleSpinSymmetry, spiralPos);
        
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
        gl.uniform1f(circleSpinTheta, spinAngles);
        gl.uniform1f(circleScale, scale);
        gl.uniform1f(circleTranslateTheta, spiralAngle);
        gl.uniform1f(circleSpinSymmetry, spiralPos);

        // DRAW CIRCLES
        for (var i = 0; i < 5; i++) {
            gl.drawArrays(gl.TRIANGLE_FAN, i * triangleFanNumber + i, triangleFanNumber);
        }
        
        // animate on 2 and 3
        if (startSpin || startScale || startSpiral) {
            requestAnimationFrame(render);
        }
    }
    
    render();
    
    document.getElementById("startSpin").onclick = function(){
        if (startSpin == false) {
            startSpin = true;
            spinSpeed = parseInt(document.getElementById("spinCounter").value);
            if (!(startSpiral || startScale)) { // if there is no animation going on
                render();
            }
        }
    };
    document.getElementById("stopSpin").onclick = function(){
        if (startSpin == true) {
            startSpin = false;
        }
    };
    document.getElementById("spinCounter").onclick = function(){
        if (startSpin == true) {
            spinSpeed = parseInt(document.getElementById("spinCounter").value);
        }
    };
    document.getElementById("startScale").onclick = function(){
        if (startScale == false) {
            startScale = true;
            scaleBig = true;
            if (!(startSpin || startSpiral)) { // if there is no animation going on
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
            spiralCounter = parseInt(document.getElementById("spiralCounter").value);
            if (!(startSpin || startScale)) { // if there is no animation going on
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

main();