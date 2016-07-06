var SceneLoader = function() {

    //var sceneObjectsIDs = ['world'];
    var sceneObjectsIDs = ['world', 'slr'];
    //var sceneObjectsIDs = ['slr'];
    var dynamicObjectsIDs = ['orb'];

    this.loadAll = function() {
        var deferred = new $.Deferred();
        var sceneObjects;
        var dynamicObjects;

        _loadObjectsByID(sceneObjectsIDs).done(function(data) {
            sceneObjects = data;
            _loadObjectsByID(dynamicObjectsIDs).done(function(data) {
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
            loadSceneObject(idList[i]).done(function(data) {
                loadedObjects.push(data);
                if (loadedObjects.length == idList.length) {
                    deferred.resolve(loadedObjects);
                }
            });
        }
        return deferred.promise();
    }


    var counter = 20;
    function loadSceneObject(id) {
        var deferred = new $.Deferred();
        var result = {
            id: id,
            parts: []
        };
        loadDescriptor(id).done(function(data) {
            var config = data;
            result.size = config.size;
            result.isLightSource = !!config.isLightSource;
            for (var i = 0; i < config.parts.length; i++) {
                loadPart(id, config.parts[i]).done(function(data) {
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

    function loadPart(objectID, part) {
        var deferred = new $.Deferred();
        var result = {
            geometry: {},
            textureData: null,
            alpha: part.alpha
        };
        loadGeometry(objectID, part.name).done(function (data) {
            result.geometry = data;
            result.name = part.name;
            if (part.textureID) {
                loadTexture(objectID, part.textureID).done(function(data) {
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

    function loadDescriptor(objectID) {
        return $.ajax({url: 'models/' + objectID + '/' + '_descriptor.json'});
    }

    function loadGeometry(objectID, fileName) {
        return $.ajax({url: 'models/' + objectID + '/' + fileName + '.json'});
    }

    function loadTexture(objectID, fileName) {
        var image = new Image();
        var deferred = new $.Deferred();
        $(image).on('load', function() {
            deferred.resolve(image);
        });
        image.src = 'textures/' + objectID + '/' + fileName + '.png';
        return deferred.promise();
    }
};