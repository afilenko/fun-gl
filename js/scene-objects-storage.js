var SceneObjectsStorage = function () {

    if (SceneObjectsStorage.prototype._sceneObjectsStorageInstance) {
        return SceneObjectsStorage.prototype._sceneObjectsStorageInstance;
    }

    SceneObjectsStorage.prototype._sceneObjectsStorageInstance = this;

    var _meshes = [];

    this.init = function (meshes) {
        _meshes = meshes;
    };

    this.getMesh = function (meshId) {
        return _meshes.filter(function (mesh) {
            return mesh.id == meshId;
        })[0];
    };

    this.getPart = function (meshId, partName) {
        var mesh = _meshes.filter(function (mesh) {
            return mesh.id == meshId;
        })[0];

        return mesh.parts.filter(function (part) {
            return part.name == partName;
        })[0];
    }
};
