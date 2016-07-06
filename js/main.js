var Main = function () {
    var _utils;
    var _camera;
    var _physics;
    var _renderer;
    var _sceneLoader;
    var _interactions;
    var _sceneObjects;
    var _dynamicObjects;

    this.start = function() {
        _init();
        _sceneLoader.loadAll().done(function (data) {
            _sceneObjects = data.sceneObjects;
            _dynamicObjects = data.dynamicObjects;
            _renderer.start(_sceneObjects, _utils.getViewportParams());
            _renderer.toggleLightning(true);
            _initInteractions();
            _tick();
        });
    };

    function _init() {
        _initInstances();
    }

    function _initInstances() {
        _utils = new Utils();
        _camera = new Camera();
        _physics = new Physics();
        _renderer = new Renderer();
        _sceneLoader = new SceneLoader();
        _interactions = new Interactions();
    }

    function _initInteractions() {
        _interactions.on('toggleLightning', _onToggleLightning);
        _interactions.on('shoot', _onShoot);
        _interactions.setViewport(_utils.getViewportParams());

    }

    function _onToggleLightning(value) {
        _renderer.toggleLightning(value);
    }

    function _onShoot(movementParams) {
        var orb = $.extend(true, {}, _dynamicObjects[0]);
        _renderer.addMesh(orb, movementParams);
        _physics.addElement(orb, movementParams);
    }

    function _tick() {
        requestAnimationFrame(_tick);
        _animate();
        _renderer.render();
    }

    function _animate() {
        _interactions.updateCamera();
        _renderer.setCameraMatrix(_camera.getMatrix(_interactions.getCameraParams()));
        _physics.updateElements();
        _renderer.setCameraPosition(_interactions.getCameraPosition());
    }

};
