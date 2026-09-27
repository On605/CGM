"use strict";

var canvas;
var gl;

var points = [];
var pointColors = [];

var NumTimesToSubdivide = 0;

var maxNumVertices = 6 * Math.pow(8, 5);

var vBuffer;
var cBuffer;

var cIndex = 1;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ), // black
    vec4( 1.0, 0.0, 0.0, 1.0 ), // red
    vec4( 1.0, 1.0, 0.0, 1.0 ), // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ), // green
    vec4( 0.0, 0.0, 1.0, 1.0 ), // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ), // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )  // cyan 
];

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    document.getElementById("slider").onchange = function(event) {
        NumTimesToSubdivide = event.target.value;
        render();
    }
    
    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
        cIndex = m.selectedIndex;
        render();
    })

    render();
};

function carpet( a, b, c, d )
{
    points.push( a, b, c);
    points.push( a, c, d );
}

function divideCarpet( a, b, c, d, count )
{

    if ( count == 0 ) {
        carpet( a, b, c, d );
    }
    else {

        var p = [];
        for ( var i = 0; i < 4; i++ ) {
            var bottom = mix ( a, d, i / 3 );
            var top    = mix ( b, c, i / 3 );
            p[i] = [];
            for ( var j = 0; j < 4; j++ ) {
                p[i][j] = mix ( bottom, top, j / 3 );
            } 
        }

        --count;

        for ( var i = 0; i < 3; i++ ) {
            for (var j = 0; j < 3; j++ ) {
                if ( i === 1 && j === 1 ) continue;
                divideCarpet( p[i][j], p[i][j+1], p[i+1][j+1], p[i+1][j], count );
            }
        }
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

    points = [];
    pointColors = [];
    divideCarpet( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide );

    for ( var i = 0; i < points.length; i++ ) {
        pointColors.push( colors[cIndex] );
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(points) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(pointColors) );

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}