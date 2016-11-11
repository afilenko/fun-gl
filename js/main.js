var Main = function () {
    var _utils;
    var _camera;
    var _animation;
    var _physics;
    var _renderer;
    var _sceneLoader;
    var _sceneObjectsStorage;
    var _interactions;
    var _interactions3rdPerson;
    var _carAnimationController;
    var _sceneObjects;
    var _dynamicObjects;

    this.start = function () {
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
        _animation = new Animation();
        _physics = new Physics();
        _renderer = new Renderer();
        _sceneLoader = new SceneLoader();
        _sceneObjectsStorage = new SceneObjectsStorage();
        _interactions = new Interactions();
        _interactions3rdPerson = new Interactions3rdPerson();
        _carAnimationController = new CarAnimationController();
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
        var expireTime = time + 1000 * 3600 * 24 * 14;
        now.setTime(expireTime);
        var showTutorFlag = $('#show-tutor-toggle').prop('checked');
        document.cookie = 'show_tutor=' + showTutorFlag + ';expires=' + now.toGMTString();
    }

    function _onTutorConfirm() {
        $('#tutor').fadeOut();
        $('#tutor-confirm').off('click', _onTutorConfirm);
        _startRendering();
    }

    function _initSceneObjectsStorage() {
        _sceneObjectsStorage.init(_sceneObjects);
    }

    function _initInteractions() {
        _interactions.init();
        _interactions.on('toggleLightning', _onToggleLightning);
        _interactions.on('shoot', _onShoot);
        _interactions.setViewport(_utils.getViewportParams());
    }

    function _initAnimation() {
        _carAnimationController.init();

        //// front-left wheel
        //var tyre = _getPart('slr', 'tire_FL');
        //var disk = _getPart('slr', 'disk_FL');
        //var breakDiskRect = _getPart('slr', 'breakdisk_FL_rect');
        //
        //_animation.addElement(tyre, _getInitialRotationParams());
        //_animation.addElement(disk, _getInitialRotationParams());
        //_animation.addElement(breakDiskRect, _getInitialRotationParams());
        //
        //// front-right wheel
        //tyre = _getPart('slr', 'tire_FR');
        //disk = _getPart('slr', 'disk_FR');
        //breakDiskRect = _getPart('slr', 'breakdisk_FR_rect');
        //
        //_animation.addElement(tyre, _getInitialRotationParams());
        //_animation.addElement(disk, _getInitialRotationParams());
        //_animation.addElement(breakDiskRect, _getInitialRotationParams());
        //
        //// rear-left wheel
        //tyre = _getPart('slr', 'tire_RL');
        //disk = _getPart('slr', 'disk_RL');
        //breakDiskRect = _getPart('slr', 'breakdisk_RL_rect');
        //
        //_animation.addElement(tyre, _getInitialRotationParams());
        //_animation.addElement(disk, _getInitialRotationParams());
        //_animation.addElement(breakDiskRect, _getInitialRotationParams());
        //
        //// rear-right wheel
        //tyre = _getPart('slr', 'tire_RR');
        //disk = _getPart('slr', 'disk_RR');
        //breakDiskRect = _getPart('slr', 'breakdisk_RR_rect');
        //
        //_animation.addElement(tyre, _getInitialRotationParams());
        //_animation.addElement(disk, _getInitialRotationParams());
        //_animation.addElement(breakDiskRect, _getInitialRotationParams());
    }

    function _getInitialRotationParams() {
        return {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };
    }

    function _startRendering() {
        $('#hud').css('display', 'block');
        _initSceneObjectsStorage();
        _initInteractions();
        _initAnimation();
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

    //function _getMesh(meshId) {
    //  return _sceneObjects.filter(function (mesh) {
    //    return mesh.id == meshId;
    //  })[0];
    //}
    //
    //function _getPart (meshId, partName) {
    //  var mesh = _sceneObjects.filter(function (mesh) {
    //    return mesh.id == meshId;
    //  })[0];
    //
    //  return mesh.parts.filter(function (part) {
    //    return part.name == partName;
    //  })[0];
    //}


    function _onAction() {
        var tyreAnimationDistance = 0.4;

        // front-left wheel
        var tyre = _getPart('slr', 'tire_FL');
        var disk = _getPart('slr', 'disk_FL');
        //var brakes = _getPart('slr', 'brake_FL');
        //var breakDisk = _getPart('slr', 'breakdisk_FL');
        var breakDiskRect = _getPart('slr', 'breakdisk_FL_rect');

        _animation.addElement(tyre, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(disk, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(breakDisk, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(brakes, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(breakDiskRect, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));

        // front-right wheel
        tyre = _getPart('slr', 'tire_FR');
        disk = _getPart('slr', 'disk_FR');
        //brakes = _getPart('slr', 'brake_FR');
        //breakDisk = _getPart('slr', 'breakdisk_FR');
        breakDiskRect = _getPart('slr', 'breakdisk_FR_rect');

        _animation.addElement(tyre, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(disk, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(breakDisk, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(brakes, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(breakDiskRect, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));

        // rear-left wheel
        tyre = _getPart('slr', 'tire_RL');
        disk = _getPart('slr', 'disk_RL');
        //brakes = _getPart('slr', 'brake_RL');
        //breakDisk = _getPart('slr', 'breakdisk_RL');
        breakDiskRect = _getPart('slr', 'breakdisk_RL_rect');

        _animation.addElement(tyre, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(disk, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(breakDisk, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(brakes, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(breakDiskRect, _buildElementAnimationParams(0.025, 0, 0, tyreAnimationDistance));

        // rear-right wheel
        tyre = _getPart('slr', 'tire_RR');
        disk = _getPart('slr', 'disk_RR');
        //brakes = _getPart('slr', 'brake_RR');
        //breakDisk = _getPart('slr', 'breakdisk_RR');
        breakDiskRect = _getPart('slr', 'breakdisk_RR_rect');

        _animation.addElement(tyre, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(disk, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(breakDisk, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        //_animation.addElement(brakes, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
        _animation.addElement(breakDiskRect, _buildElementAnimationParams(-0.025, 0, 0, tyreAnimationDistance));
    }

    function _buildElementAnimationParams(dX, dY, dZ, maxDistance) {
        return {
            xDist: 0,
            yDist: 0,
            zDist: 0,
            dX: dX,
            dY: dY,
            dZ: dZ,
            distance: 0,
            maxDistance: maxDistance
        }
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
        _carAnimationController.updateElements(_interactions.getMovementParams());
        //_animation.updateElements(_interactions.getMovementParams());
        _renderer.setCameraPosition(_interactions.getCameraPosition());
    }

};
