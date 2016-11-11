function Interactions3rdPerson() {

    var _canvas;
    var _eventListeners = [];

    var _pitch = 0;
    var _yaw = 0;

    var _strafeSpeed = 0;
    var _speed = 0;

    var EYE_POS = 0.5;
    var _xPos = 0;
    var _yPos = EYE_POS;
    var _zPos = 0;
    var _lastUpdateTime;

    var _screenWidth;
    var _screenHeight;
    var _currentlyPressedKeys = {};

    this.init = function () {
        $('#lighting').on('change', _toggleLights.bind(this));
        _canvas = $('#glcanvas');
        $(document).on('keydown', _handleKeyDown);
        $(document).on('keyup', _handleKeyUp);

        // position test set
        _xPos = 1.508611936275947;
        _zPos = 1.7182241670544385;
        _yaw = 39.70000000000001;
    };

    this.setViewport = function (viewportParams) {
        _screenWidth = viewportParams.width;
        _screenHeight = viewportParams.height;
    };

    this.on = function (eventName, handler) {
        var listener = {
            eventName: eventName,
            eventHandler: handler
        };
        _eventListeners.push(listener);
    };

    this.updateCamera = function () {
        var timeNow = new Date().getTime();

        if (_lastUpdateTime != 0) {
            _handleMovementControls();
        }

        _lastUpdateTime = timeNow;
    };

    this.getCameraParams = function () {
        return {
            yaw: _yaw,
            pitch: _pitch,
            position: [-_xPos, -_yPos, -_zPos]
        }
    };

    this.getCameraPosition = function () {
        return {
            x: _xPos,
            y: _yPos,
            z: _zPos
        };
    };

    function _handleMovementControls() {
        if (_currentlyPressedKeys[37] || _currentlyPressedKeys[65]) { // A or left arrow
            _strafeSpeed = 0.003;
        }
        else if (_currentlyPressedKeys[39] || _currentlyPressedKeys[68]) { // D or right arrow
            _strafeSpeed = -0.003;
        }
        else { // none
            _strafeSpeed = 0;
        }

        if (_currentlyPressedKeys[38] || _currentlyPressedKeys[87]) { // W or up arrow
            _speed = 0.003;
        }
        else if (_currentlyPressedKeys[40] || _currentlyPressedKeys[83]) { // S or down arrow
            _speed = -0.003;
        }
        else { // none
            _speed = 0;
        }

    }

    function _degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function _handleKeyDown(event) {
        // F - toggle flashlight
        if (event.keyCode == 70) {
            var flashLightToggleCheckbox = $('#flash-lighting');
            var useFlashLight = $(flashLightToggleCheckbox).prop('checked');
            $(flashLightToggleCheckbox).prop('checked', !useFlashLight);
        }

        // L - toggle lightning
        if (event.keyCode == 76) {
            var lightningToggleCheckbox = $('#lighting');
            var useLightning = $(lightningToggleCheckbox).prop('checked');
            $(lightningToggleCheckbox).prop('checked', !useLightning);
            _toggleLights();
        }

        // spacebar - shoot
        if (event.keyCode == 32) {
            var ANIMATION_STEP = 0.035;
            var dX = -Math.sin(_degToRad(_yaw));
            var dY = Math.sin(_degToRad(_pitch));
            var dZ = -Math.cos(_degToRad(_yaw));

            var x = _xPos + dX;
            var y = _yPos + dY;
            var z = _zPos + dZ;

            dX *= ANIMATION_STEP;
            dY *= ANIMATION_STEP;
            dZ *= ANIMATION_STEP;
            _dispatch('shoot', {
                x: x,
                y: y,
                z: z,
                dX: dX,
                dY: dY,
                dZ: dZ
            });
        }
        _currentlyPressedKeys[event.keyCode] = true;
    }


    function _handleKeyUp(event) {
        _currentlyPressedKeys[event.keyCode] = false;
    }

    function _dispatch(eventName, data) {
        for (var i = 0; i < _eventListeners.length; i++) {
            if (_eventListeners[i].eventName == eventName) {
                _eventListeners[i].eventHandler(data);
            }
        }
    }

    function _toggleLights() {
        _dispatch('toggleLightning', $('#lighting').prop('checked'));
    }

    function _handleActionButton() {
        _dispatch('action');
    }
}