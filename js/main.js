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
            if (_utils.getCookie('show_tutor') == 'false') {
                _startRendering();
            }
            else {
                _showTutorial();
            }
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

    function _showTutorial() {
        $('#preloader').fadeOut();
        var tutor = $('#tutor');
        $(tutor).fadeOut(0);
        $(tutor).css('visibility', 'visible');
        $(tutor).fadeIn();
        $(document).on('keyup', _handleKeyPress);
        $('#show-tutor-toggle').on('change', _onTutorToggleChange);
        $('#tutor-confirm').on('click', _onTutorConfirm);
    }

    function _handleKeyPress(event) {
        if (event.keyCode == 13) {
            $(document).off('keyup', _handleKeyPress);
            _onTutorConfirm();
        }
    }

    function _onTutorToggleChange() {
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + 1000*3600*24*14;
        now.setTime(expireTime);
        var showTutorFlag = $('#show-tutor-toggle').prop('checked');
        document.cookie = 'show_tutor=' + showTutorFlag + ';expires=' + now.toGMTString();
    }

    function _onTutorConfirm() {
        $('#tutor').fadeOut();
        $('#tutor-confirm').off('click', _onTutorConfirm);
        _startRendering();
    }

    function _initInteractions() {
        _interactions.init();
        _interactions.on('toggleLightning', _onToggleLightning);
        _interactions.on('shoot', _onShoot);
        _interactions.setViewport(_utils.getViewportParams());

    }

    function _startRendering() {
        $('#hud').css('display', 'block');
        _initInteractions();
        _tick();
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
