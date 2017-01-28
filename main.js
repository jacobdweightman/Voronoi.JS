// graphics variables
var canvas, c;
var program;

var siteBuffer;
var squarePosBuffer;

// generate array of voronoi sites
site_num = 100;
sites = new Array(site_num*3);
for(let i=0; i<sites.length/3; i++) {
    sites[3*i]   = 2*Math.random()-1;
    sites[3*i+1] = 2*Math.random()-1;
    sites[3*i+2] = 0;
}

// generate velocities for sites
vels = new Array(site_num*2);
for(let i=0; i<vels.length/2; i++) {
    vels[2*i] = 0.01*(Math.random()-0.3);
    vels[2*i+1] = 0.01*(Math.random()-0.3);
}

// assign a random color to each site
colors = new Array(site_num*3);
for(let i=0; i<colors.length/3; i++) {
    colors[3*i]   = 0.2+0.6*Math.random();
    colors[3*i+1] = 0.5*Math.random();
    colors[3*i+2] = 0.5*(1+Math.random());
}

// vertex shader program
var vert =
"attribute vec3 pos;\n"+
"varying vec3 loc;\n"+
"void main(void) {\n"+
"   gl_Position = vec4(pos, 1.0);\n"+
"   loc = pos;\n"+
"}\n";

// fragment shader program
var frag =
"precision mediump float;\n"+
"uniform vec3 sites["+site_num+"];\n"+
"uniform vec3 colors["+site_num+"];\n"+
"varying vec3 loc;\n"+
"void main(void) {\n"+
"   float min_dist = 2.0;\n"+
"   vec3 color = vec3(1.0, 1.0, 1.0);\n"+
"   vec3 col2 = vec3(1.0, 1.0, 1.0);\n"+
"   for(int i=0; i<"+site_num+"; i++) {\n"+
"       float dist = length(loc - sites[i]);\n"+
"       if(dist < min_dist) {\n"+
"           if((min_dist - dist)/dist < 0.01) {\n"+
"               min_dist = dist;\n"+
"               col2 = colors[i];\n"+
"           } else {\n"+
"               min_dist = dist;\n"+
"               color = colors[i];\n"+
"               col2 = colors[i];\n"+
"           }\n"+
"       }\n"+
"   }\n"+
"   gl_FragColor = vec4(0.5*(color+col2), 1.0);\n"+
"}\n";

window.onload = function() {
    // initialize drawing context
    //try {
        canvas = document.getElementById("voronoi");
        resize();
    //} catch(e) {
    //    alert("Failed to initialize WebGL");
    //}

    c.clearColor(0.0, 0.0, 0.0, 1.0);
    c.enable(c.DEPTH_TEST); // DO I NEED THIS?

    // initialize shaders, drawing program
    var vertex = c.createShader(c.VERTEX_SHADER);
    c.shaderSource(vertex, vert);
    c.compileShader(vertex);
    var compilationLog = c.getShaderInfoLog(vertex);
    console.log('Shader compiler log: ' + compilationLog);

    var fragment = c.createShader(c.FRAGMENT_SHADER);
    c.shaderSource(fragment, frag);
    c.compileShader(fragment);
    var compilationLog = c.getShaderInfoLog(fragment);
    console.log('Shader compiler log: ' + compilationLog);

    program = c.createProgram();
    c.attachShader(program, vertex);
    c.attachShader(program, fragment);
    c.linkProgram(program);
    c.useProgram(program);

    // square that fills screen for drawing on
    program.pos = c.getAttribLocation(program, "pos");
    c.enableVertexAttribArray(program.pos);

    let vertices = [
         1.0,  1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];

    squarePosBuffer = c.createBuffer();
    c.bindBuffer(c.ARRAY_BUFFER, squarePosBuffer);
    c.bufferData(c.ARRAY_BUFFER, new Float32Array(vertices), c.STATIC_DRAW);

    // load sites into uniform
    program.sites = c.getUniformLocation(program, "sites");
    c.uniform3fv(program.sites, new Float32Array(sites));

    // load site colors into uniform
    program.colors = c.getUniformLocation(program, "colors");
    c.uniform3fv(program.colors, new Float32Array(colors));

    //siteBuffer = c.createBuffer();
    //c.bindBuffer(c.ARRAY_BUFFER, siteBuffer);
    //c.bufferData(c.ARRAY_BUFFER, new Float32Array(sites), c.STATIC_DRAW);

    c.bindBuffer(c.ARRAY_BUFFER, squarePosBuffer);
    c.vertexAttribPointer(program.pos, 3, c.FLOAT, false, 0, 0);

    setInterval(update, 34);
    window.onresize = resize;
};

function update() {
    for(let i=0; i<sites.length/3; i++) {
        sites[3*i]   += vels[2*i];
        sites[3*i+1] += vels[2*i+1];

        if(sites[3*i] > 1.2) {
            sites[3*i] = -1.2;
        } if(sites[3*i] < -1.2) {
            sites[3*i] = 1.2;
        } if(sites[3*i+1] > 1.2) {
            sites[3*i+1] = -1.2;
        } if(sites[3*i+1] < -1.2) {
            sites[3*i+1] = 1.2;
        }
    }

    // load sites into uniform
    program.sites = c.getUniformLocation(program, "sites");
    c.uniform3fv(program.sites, new Float32Array(sites));

    console.log("redraw!");

    // draw square that fills screen, textured with voronoi
    c.drawArrays(c.TRIANGLE_STRIP, 0, 4);
}

function resize() {
    console.log("resize!");
    canvas.setAttribute("width", canvas.scrollWidth);
    canvas.setAttribute("height", canvas.scrollHeight);

    c = canvas.getContext('experimental-webgl');
    c.viewport(0, 0, canvas.width, canvas.height);
    c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
}
