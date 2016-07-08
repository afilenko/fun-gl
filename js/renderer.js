var Renderer = function () {

    var _utils;
    var _meshes;
    var _textures = [];
    var _canvas;
    var _gl;
    var _shaderProgram;
    var _vertexPositionAttribute;
    var _vertexNormalAttribute;
    var _textureCoordAttribute;
    var _isLightSourceUniform;
    var _dynamicLightSourcesCountUniform;
    var _applyLightingUniform;
    
    var _cameraLightPositionUniform;
    var _perspectiveMatrixUniform;
    var _movementMatrixUniform;
    var _normalMatrixUniform;
    var _orbLightPositionUniform;
    var _orbLightPositionOuterUniform;
    var _lightSourcesPositionsUniform;
    var _useSimpleLightningUniform;

    var _verticesBuffer = [];
    var _normalsBuffer = [];
    var _textureCoordBuffer = [];
    var _polygonsBuffer = [];

    var _cameraPosition;

    this.start = function(data, viewportParams) {
        _meshes = data;
        _initInstances();
        _initCanvas(viewportParams.width, viewportParams.height);
        _initWebGL();
        _initShaders();
        _initBuffers();
        _initScene();
    };

    this.addMesh = function(mesh, movementParams) {
        mesh.movement = movementParams;
        _meshes.push(mesh);
        _initMeshBuffers(mesh);
    };

    this.removeMesh = function(mesh) {

    };

    this.setCameraPosition = function(position) {
        _cameraPosition = position;
    };

    this.setCameraMatrix = function(cameraMatrix) {
        _gl.uniformMatrix4fv(_movementMatrixUniform, false, new Float32Array(cameraMatrix.flatten()));
        var normalMatrix = cameraMatrix.inverse();
        normalMatrix = normalMatrix.transpose();
        _gl.uniformMatrix4fv(_normalMatrixUniform, false, new Float32Array(normalMatrix.flatten()));
    };

    this.render = function() {
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        _disableAlphaBlend();

        var bufferIndex = 0;
        var transparentParts = [];
        var worldParts = [];
        var orbs = [];

        var lightSourcesPositions = _getLightSourcesPositions();
        _gl.uniform1i(_dynamicLightSourcesCountUniform, lightSourcesPositions.count);
        _gl.uniform4fv(_lightSourcesPositionsUniform, new Float32Array(lightSourcesPositions.result));

        _gl.uniform1i(_useSimpleLightningUniform, true);

        for (var i = 0; i < _meshes.length; i++) {
            var mesh = _meshes[i];

            if (mesh.id == 'orb') {
                _updatePartVerticesBuffer(mesh.parts[0], bufferIndex);
                orbs.push({
                    movement: mesh.movement,
                    bufferIndex: bufferIndex,
                    polygons: mesh.parts[0].geometry.polygons
                });
                bufferIndex++;
                continue;
            }

            for (var j = 0; j < mesh.parts.length; j++) {
                if (mesh.wasAnimated || mesh.parts[j].wasAnimated) {
                    _updatePartVerticesBuffer(mesh.parts[j], bufferIndex);
                }
                if (mesh.id != 'orb' && mesh.parts[j].alpha != undefined) {
                    transparentParts.push({
                        bufferIndex: bufferIndex,
                        polygons: mesh.parts[j].geometry.polygons
                    });
                    bufferIndex++;
                    continue;
                }

                if (mesh.id == 'world') {
                    worldParts.push({
                        bufferIndex: bufferIndex,
                        polygons: mesh.parts[j].geometry.polygons
                    });
                    bufferIndex++;
                    continue;
                }

                _renderPart(mesh.parts[j].geometry.polygons, bufferIndex);

                bufferIndex++;
            }
        }

        _renderWorldBox(worldParts);
        _renderOrbs(orbs);
        _renderTransparentParts(transparentParts);
    };

    function _renderPart(polygons, bufferIndex) {
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _verticesBuffer[bufferIndex]);
        _gl.vertexAttribPointer(_vertexPositionAttribute, 3, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, _normalsBuffer[bufferIndex]);
        _gl.vertexAttribPointer(_vertexNormalAttribute, 3, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, _textureCoordBuffer[bufferIndex]);
        _gl.vertexAttribPointer(_textureCoordAttribute, 2, _gl.FLOAT, false, 0, 0);

        _gl.activeTexture(_gl.TEXTURE0);
        _gl.bindTexture(_gl.TEXTURE_2D, _textures[bufferIndex]);
        _gl.uniform1i(_gl.getUniformLocation(_shaderProgram, "uSampler"), 0);

        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _polygonsBuffer[bufferIndex]);
        _gl.drawElements(_gl.TRIANGLES, polygons.length, _gl.UNSIGNED_SHORT, 0);
    }

    function _renderOrbs(orbs) {
        _gl.uniform1i(_isLightSourceUniform, true);
        _enableAlphaBlend();

        for (var i = 0; i < orbs.length; i++) {
            var orb = orbs[i];

            _gl.uniform3fv(_orbLightPositionUniform, [orb.movement.x, orb.movement.y, orb.movement.z]);

            var dX = _cameraPosition.x - orb.movement.x;
            var dY = _cameraPosition.y - orb.movement.y;
            var dZ = _cameraPosition.z - orb.movement.z;

            var cameraToOrbLength = Math.sqrt((dX * dX) + (dY * dY) + (dZ * dZ));

            var orbLightOuterX = dX / cameraToOrbLength;
            var orbLightOuterY = dY / cameraToOrbLength;
            var orbLightOuterZ = dZ / cameraToOrbLength;

            var orbOuterLightDist = 2.5;
            _gl.uniform3fv(_orbLightPositionOuterUniform, [
                orb.movement.x + orbOuterLightDist * orbLightOuterX,
                orb.movement.y + orbOuterLightDist * orbLightOuterY,
                orb.movement.z + orbOuterLightDist * orbLightOuterZ
            ]);


            _renderPart(orbs[i].polygons, orbs[i].bufferIndex);
        }
    }

    function _renderWorldBox(worldParts) {
        //_gl.uniform1i(_useSimpleLightningUniform, true);
        _gl.uniform1i(_useSimpleLightningUniform, false);

        _disableAlphaBlend();

        for (var i = 0; i < worldParts.length; i++) {
            _renderPart(worldParts[i].polygons, worldParts[i].bufferIndex);
        }
    }

    function _renderTransparentParts(transparentParts) {
        _gl.uniform1i(_useSimpleLightningUniform, true);
        _enableAlphaBlend();
        _gl.uniform1i(_isLightSourceUniform, false);
        for (var i = 0; i < transparentParts.length; i++) {
            _renderPart(transparentParts[i].polygons, transparentParts[i].bufferIndex);
        }
    }

    function _getLightSourcesPositions() {
        var result = [];
        var count = 0;
        for (var i = 0; i < _meshes.length; i++) {
            var mesh = _meshes[i];
            if (mesh.isLightSource) {
                count++;
                result.push(mesh.movement.x);
                result.push(mesh.movement.y);
                result.push(mesh.movement.z);
                result.push(1.0);
            }
        }
        var empty = [];
        for (i = _meshes.length; i < 16; i++) {
            empty.push(-1.0);
            empty.push(-1.0);
            empty.push(-1.0);
            empty.push(-1.0);
        }
        //return new Float32Array(result);
        return {
            result: result.concat(empty),
            count: count
        };
    }

    function _updatePartVerticesBuffer(part, bufferIndex) {
        var verticesBuffer = _verticesBuffer[bufferIndex];
        _gl.bindBuffer(_gl.ARRAY_BUFFER, verticesBuffer);
        _gl.bufferSubData(_gl.ARRAY_BUFFER, 0, new Float32Array(part.geometry.updatedVertices));
    }

    this.toggleLightning = function(value) {
        _gl.uniform1i(_applyLightingUniform, value);
    };

    function _initInstances() {
        _utils = new Utils();
    }

    function _initCanvas(width, height) {
        _canvas = document.getElementById("glcanvas");
        document.getElementById('glcanvas').width = width;
        document.getElementById('glcanvas').height = height;
    }

    function _initWebGL() {
        try {
            _gl = _canvas.getContext("experimental-webgl");
            _gl.viewportWidth = _canvas.width;
            _gl.viewportHeight = _canvas.height;
        }
        catch(e) {
            console.log(e.message);
        }

        if (_gl) {
            _gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black, fully opaque
            _gl.clearDepth(1.0);                 // Clear everything
            _gl.enable(_gl.DEPTH_TEST);           // Enable depth testing
            _gl.depthFunc(_gl.LESS);            // Near things obscure far things
            //gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
            _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
            _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        }
        else {
            alert('Unable to initialize WebGL');
        }
    }

    function _initShaders() {
        var fragmentShader = _getShader('shader-fs');
        var vertexShader = _getShader('shader-vs');

        _shaderProgram = _gl.createProgram();

        _gl.attachShader(_shaderProgram, vertexShader);
        _gl.attachShader(_shaderProgram, fragmentShader);
        _gl.linkProgram(_shaderProgram);

        if (!_gl.getProgramParameter(_shaderProgram, _gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program.');
        }

        _gl.useProgram(_shaderProgram);

        _vertexPositionAttribute = _gl.getAttribLocation(_shaderProgram, 'aVertexPosition');
        _gl.enableVertexAttribArray(_vertexPositionAttribute);

        _vertexNormalAttribute = _gl.getAttribLocation(_shaderProgram, 'aVertexNormal');
        _gl.enableVertexAttribArray(_vertexNormalAttribute);

        _textureCoordAttribute = _gl.getAttribLocation(_shaderProgram, 'aTextureCoord');
        _gl.enableVertexAttribArray(_textureCoordAttribute);

        _isLightSourceUniform = _gl.getUniformLocation(_shaderProgram, 'uIsLightSource');
        _dynamicLightSourcesCountUniform = _gl.getUniformLocation(_shaderProgram, 'uDynamicLightSourcesCount');
        _applyLightingUniform = _gl.getUniformLocation(_shaderProgram, 'uApplyLighting');
        _cameraLightPositionUniform = _gl.getUniformLocation(_shaderProgram, 'uCameraLightPosition');

        _normalMatrixUniform = _gl.getUniformLocation(_shaderProgram, 'uNormalMatrix');
        _movementMatrixUniform = _gl.getUniformLocation(_shaderProgram, 'uMovementMatrix');
        _perspectiveMatrixUniform = _gl.getUniformLocation(_shaderProgram, 'uPerspectiveMatrix');

        _orbLightPositionUniform = _gl.getUniformLocation(_shaderProgram, 'uOrbLightPosition');
        _orbLightPositionOuterUniform = _gl.getUniformLocation(_shaderProgram, 'uOrbLightPositionOuter');
        _lightSourcesPositionsUniform = _gl.getUniformLocation(_shaderProgram, 'uLightSourcesPositions');
        _useSimpleLightningUniform = _gl.getUniformLocation(_shaderProgram, 'uUseSimpleLightning');
    }

    function _initScene() {
        var perspectiveMatrix = _utils.makePerspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0);
        _gl.uniformMatrix4fv(_perspectiveMatrixUniform, false, new Float32Array(perspectiveMatrix.flatten()));
        _gl.uniform3fv(_cameraLightPositionUniform, [0.0, 0.0, 0.0]);
    }

    function _initBuffers() {
        for (var i = 0; i < _meshes.length; i++) {
            _initMeshBuffers(_meshes[i]);
        }
    }

    function _initMeshBuffers(mesh) {
        for (var j = 0; j < mesh.parts.length; j++) {
            _initPartTexture(mesh.parts[j]);
            _initPartGeometry(mesh.parts[j].geometry, mesh.isAnimated);
        }
    }

    function _initPartTexture(part) {
        var texture = _gl.createTexture();
        _gl.bindTexture(_gl.TEXTURE_2D, texture);
        var textureData = part.textureData;
        if (textureData) {
            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, textureData);
        }
        else {
            var color = parseInt(part.color, 16);
            var alpha = part.alpha ? 255 * parseFloat(part.alpha) : 255;
            textureData = new Uint8Array([color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF, alpha]);
            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, 1, 1, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, textureData);
        }

        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR);
        _gl.generateMipmap(_gl.TEXTURE_2D);
        _gl.bindTexture(_gl.TEXTURE_2D, null);
        _textures.push(texture);
    }

    function _initPartGeometry(geometry, isAnimated) {
        _verticesBuffer.push(_createArrayBuffer(new Float32Array(geometry.vertices), isAnimated));
        _normalsBuffer.push(_createArrayBuffer(new Float32Array(geometry.normals), false));
        _textureCoordBuffer.push(_createArrayBuffer(new Float32Array(geometry.uv), false));
        _polygonsBuffer.push(_createElementsArrayBuffer(new Uint16Array(geometry.polygons)));
    }

    function _enableAlphaBlend() {
        _gl.enable(_gl.BLEND);
    }

    function _disableAlphaBlend() {
        _gl.disable(_gl.BLEND);
    }

    function _createArrayBuffer(data, isAnimated) {
        var buffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, data, isAnimated ? _gl.DYNAMIC_DRAW : _gl.STATIC_DRAW);
        return buffer;
    }

    function _createElementsArrayBuffer(data) {
        var buffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, buffer);
        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, data, _gl.STATIC_DRAW);
        return buffer;
    }

    function _getShader(id) {
        var shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        var theSource = "";
        var currentChild = shaderScript.firstChild;

        while(currentChild) {
            if (currentChild.nodeType == 3) {
                theSource += currentChild.textContent;
            }

            currentChild = currentChild.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = _gl.createShader(_gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = _gl.createShader(_gl.VERTEX_SHADER);
        } else {
            return null;  // Unknown shader type
        }

        _gl.shaderSource(shader, theSource);
        _gl.compileShader(shader);

        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + _gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
};