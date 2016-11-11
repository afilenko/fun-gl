var SceneLoader = function () {

    var _sceneObjectsIDs = ['world', 'slr'];
    var _dynamicObjectsIDs = ['orb'];

    this.loadAll = function () {
        var deferred = new $.Deferred();
        var sceneObjects;
        var dynamicObjects;

        _loadObjectsByID(_sceneObjectsIDs).done(function (data) {
            sceneObjects = data;
            _loadObjectsByID(_dynamicObjectsIDs).done(function (data) {
                dynamicObjects = data;
                deferred.resolve({
                    sceneObjects: sceneObjects,
                    dynamicObjects: dynamicObjects
                });
            });
        });

        return deferred.promise();
    };

    function _loadObjectsByID(idList) {
        var deferred = new $.Deferred();
        var loadedObjects = [];
        for (var i = 0; i < idList.length; i++) {
            _loadSceneObject(idList[i]).done(function (data) {
                loadedObjects.push(data);
                if (loadedObjects.length == idList.length) {
                    deferred.resolve(loadedObjects);
                }
            });
        }
        return deferred.promise();
    }

    function _loadSceneObject(id) {
        var deferred = new $.Deferred();
        var result = {
            id: id,
            parts: []
        };
        _loadDescriptor(id).done(function (data) {
            var config = data;
            result.size = config.size;
            result.isLightSource = !!config.isLightSource;
            for (var i = 0; i < config.parts.length; i++) {
                _loadPart(id, config.parts[i]).done(function (data) {
                    result.parts.push(data);
                    if (result.parts.length == config.parts.length) {
                        var nonTransparentParts = [];
                        var transparentParts = [];
                        for (var i = 0; i < result.parts.length; i++) {
                            if (result.parts[i].alpha == undefined) {
                                nonTransparentParts.push(result.parts[i]);
                            }
                            else {
                                transparentParts.push(result.parts[i]);
                            }
                        }
                        result.parts = nonTransparentParts.concat(transparentParts);
                        deferred.resolve(result);
                    }
                });
            }
        });
        return deferred.promise();
    }

    function _loadPart(objectID, part) {
        var deferred = new $.Deferred();
        var result = {
            geometry: {},
            textureData: null,
            alpha: part.alpha
        };
        _loadGeometry(objectID, part.name).done(function (data) {
            result.geometry = data;
            result.name = part.name;
            result.geometry.axis = _calcAxis(data);

            if (part.textureID) {
                _loadTexture(objectID, part.textureID).done(function (data) {
                    result.textureData = data;
                    deferred.resolve(result);
                });
            }
            else {
                result.color = part.color;
                result.alpha = part.alpha;
                deferred.resolve(result);
            }
        });
        return deferred.promise();
    }

    function _loadDescriptor(objectID) {
        return $.ajax({url: 'models/' + objectID + '/' + 'descriptor.json'});
    }

    function _loadGeometry(objectID, fileName) {
        return $.ajax({url: 'models/' + objectID + '/' + fileName + '.json'});
    }

    function _loadTexture(objectID, fileName) {
        var image = new Image();
        var deferred = new $.Deferred();
        $(image).on('load', function () {
            deferred.resolve(image);
        });
        image.src = 'textures/' + objectID + '/' + fileName + '.png';
        return deferred.promise();
    }

    function _calcAxis(geometry) {
        var k = 0;
        var minX = 2;
        var minY = 2;
        var minZ = 2;
        var maxX = -2;
        var maxY = -2;
        var maxZ = -2;

        for (var i = 0; i < geometry.vertices.length; i++) {
            if (k == 0) {
                if (geometry.vertices[i] < minX) {
                    minX = geometry.vertices[i];
                }
                if (geometry.vertices[i] > maxX) {
                    maxX = geometry.vertices[i];
                }
                k++;
            }
            else if (k == 1) {
                if (geometry.vertices[i] < minY) {
                    minY = geometry.vertices[i];
                }
                if (geometry.vertices[i] > maxY) {
                    maxY = geometry.vertices[i];
                }
                k++;
            }
            else if (k == 2) {
                if (geometry.vertices[i] < minZ) {
                    minZ = geometry.vertices[i];
                }
                if (geometry.vertices[i] > maxZ) {
                    maxZ = geometry.vertices[i];
                }
                k = 0;
            }
        }

        var centerX = (maxX + minX) / 2;
        var centerY = (maxY + minY) / 2;
        var centerZ = (maxZ + minZ) / 2;
        var oX = centerX + 1;
        var oY = centerY + 1;
        var oZ = centerZ + 1;

        geometry.relativeVertices = [];
        geometry.relativeNormals = [];
        k = 0;
        var center;
        for (i = 0; i < geometry.vertices.length; i++) {
            k++;
            if (k == 1) {
                center = centerX;
            }
            else if (k == 2) {
                center = centerY;
            }
            else if (k == 3) {
                center = centerZ;
                k = 0;
            }
            geometry.relativeVertices.push(geometry.vertices[i] - center);
            geometry.relativeNormals.push(geometry.vertices[i] + geometry.normals[i] - center);
        }

        return {
            x: centerX,
            y: centerY,
            z: centerZ,
            oX: oX,
            oY: oY,
            oZ: oZ
        };
    }
};
