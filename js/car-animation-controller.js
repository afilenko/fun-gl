function CarAnimationController() {

    var _utils = new Utils();
    var _sceneObjectsStorage = new SceneObjectsStorage();
    var _car;
    var _wheels;

    this.init = function () {
        _car = _sceneObjectsStorage.getMesh('slr');

        _wheels = {
            frontLeft: {
                parts: [
                    _sceneObjectsStorage.getPart('slr', 'tire_FL'),
                    _sceneObjectsStorage.getPart('slr', 'disk_FL'),
                    _sceneObjectsStorage.getPart('slr', 'breakdisk_FL_rect')
                ]
            },
            frontRight: {
                parts: [
                    _sceneObjectsStorage.getPart('slr', 'tire_FR'),
                    _sceneObjectsStorage.getPart('slr', 'disk_FR'),
                    _sceneObjectsStorage.getPart('slr', 'breakdisk_FR_rect')
                ]
            },
            rearLeft: {
                parts: [
                    _sceneObjectsStorage.getPart('slr', 'tire_RL'),
                    _sceneObjectsStorage.getPart('slr', 'disk_RL'),
                    _sceneObjectsStorage.getPart('slr', 'breakdisk_RL_rect')
                ]
            },
            rearRight: {
                parts: [
                    _sceneObjectsStorage.getPart('slr', 'tire_RR'),
                    _sceneObjectsStorage.getPart('slr', 'disk_RR'),
                    _sceneObjectsStorage.getPart('slr', 'breakdisk_RR_rect')
                ]
            }
        };

        _wheels.frontLeft.transformation = _getDefaultTransformationParams();
        _wheels.frontRight.transformation = _getDefaultTransformationParams();
        _wheels.rearLeft.transformation = _getDefaultTransformationParams();
        _wheels.rearRight.transformation = _getDefaultTransformationParams();
    };

    this.updateElements = function (movementParams) {
        if (movementParams.direction) {
            var spinAdjust = movementParams.direction * Math.PI / 30;

            _spinWheel(_wheels.frontLeft, spinAdjust);
            _spinWheel(_wheels.frontRight, spinAdjust);
            _spinWheel(_wheels.rearLeft, spinAdjust);
            _spinWheel(_wheels.rearRight, spinAdjust);
        }

        if (movementParams.steering) {
            var steerAdjust = movementParams.steering * Math.PI / 30;

            _rotateWheel(_wheels.frontLeft, steerAdjust);
            _rotateWheel(_wheels.frontRight, steerAdjust);
            _rotateWheel(_wheels.rearLeft, steerAdjust);
            _rotateWheel(_wheels.rearRight, steerAdjust);
        }
    };

    function _spinWheel(wheel, spinAdjust) {
        wheel.transformation.rotationX += spinAdjust;
        for (var i = 0; i < wheel.parts.length; i++) {
            _utils.rotateAroundX(wheel.parts[i], wheel.transformation.rotationX);
        }
    }

    function _rotateWheel(wheel, steerAdjust) {
        wheel.transformation.rotationY += steerAdjust;
        for (var i = 0; i < wheel.parts.length; i++) {
            _utils.rotateAroundY(wheel.parts[i], wheel.transformation.rotationY);
        }
    }

    function _getDefaultTransformationParams() {
        return {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };
    }
}