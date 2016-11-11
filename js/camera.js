function Camera() {

    var _matrix;

    this.getMatrix = function (params) {
        var pitch = params.pitch;
        var yaw = params.yaw;
        var position = params.position;
        _matrix = _makeIdentityMatrix();

        _rotate(-pitch, [1, 0, 0]);
        _rotate(-yaw, [0, 1, 0]);
        _translate(position);
        return _matrix;
    };

    function _makeIdentityMatrix() {
        return Matrix.I(4);
    }

    function _rotate(angle, vector) {
        var inRadians = angle * Math.PI / 180.0;
        var rotationMatrix = Matrix.Rotation(inRadians, $V([vector[0], vector[1], vector[2]])).ensure4x4();
        _matrix = _matrix.x(rotationMatrix);
    }

    function _translate(vector) {
        var translationMatrix = Matrix.Translation($V([vector[0], vector[1], vector[2]])).ensure4x4();
        _matrix = _matrix.x(translationMatrix);
    }

}
