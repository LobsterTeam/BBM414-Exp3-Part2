/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const vertexShader = `#version 300 es

    in vec2 i_position;
    uniform float i_scale;
    uniform float u_theta;

    void main() {
        float angles = radians(u_theta);
        float s = cos(angles);
        float c = sin(angles);
        mat4 rz = mat4(c, s, 0.0, 0.0,
                        -s, c, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0);
        mat4 scale = mat4(i_scale, 0.0, 0.0, 0.0,
                            0.0, i_scale, 0.0, 0.0,
                            0.0, 0.0, i_scale, 0.0,
                            0.0, 0.0, 0.0, 1.0);

        gl_Position = rz * scale * vec4(i_position, 0.0, 1.0);
    }
`;

const triangleFragmentShader = `#version 300 es

    precision mediump float;
    out vec4 o_color;
    
    void main() {
        o_color = vec4(64.0 / 255.0, 64.0 / 255.0, 64.0 / 255.0, 1.0);
    }
`;

const circleVertexShader = `#version 300 es

    in vec2 i_position;

    uniform float u_theta;

    void main() {
        float angles = radians(u_theta);
        float s = cos(angles);
        float c = sin(angles);
        mat4 rz = mat4(c, s, 0.0, 0.0,
                        -s, c, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0);
        mat4 scale = mat4(1.0/2.0, 0.0, 0.0, 0.0,
                            0.0, 1.0/2.0, 0.0, 0.0,
                            0.0, 0.0, 1.0/2.0, 0.0,
                            0.0, 0.0, 0.0, 1.0);
        
        gl_Position = rz * scale * vec4(i_position, 0.0, 1.0);
    }
`;

const circleFragmentShader = `#version 300 es

    precision mediump float;
    out vec4 o_color;

    void main() {
        o_color = vec4(250.0 / 255.0, 237.0 / 255.0, 51.0 / 255.0, 1.0);
    }
`;