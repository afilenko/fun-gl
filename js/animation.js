function Animation() {

    var _elements = [];
    var _utils = new Utils();

    this.addElement = function (element, movement) {
        element.movement = movement;
        _elements.push(element);
    };

    this.updateElements = function (movementParams) {
        console.log('!');
        if (movementParams.steering === 'left') {

        }


        //console.log(movementParams);
        for (var i = 0; i < _elements.length; i++) {
            var element = _elements[i];
            if (element.movement.rotationX == undefined) {
                element.movement.rotationX = 0;
            }
            element.movement.rotationX += Math.PI / 30;

            _utils.rotateAroundX(element, element.movement.rotationX);
        }
    };

    //this.updateElements = function(movementParams) {
    //    for (var i = 0; i < _elements.length; i++) {
    //        var element = _elements[i];
    //        if (element.movement.rotationX == undefined) {
    //            element.movement.rotationX = 0;
    //        }
    //        element.movement.rotationX += Math.PI / 30;
    //
    //        _utils.rotateAroundX(element);
    //
    //        var distanceAdjust = _calcDistance(element.movement);
    //        if (element.movement.distance + distanceAdjust < element.movement.maxDistance) {
    //            element.movement.xDist += element.movement.dX;
    //            element.movement.yDist += element.movement.dY;
    //            element.movement.zDist += element.movement.dZ;
    //            element.movement.distance += distanceAdjust;
    //
    //            var vertices = element.geometry.vertices.slice();
    //            var coordIndex = 0;
    //            for (var k = 0; k < vertices.length; k++) {
    //                coordIndex++;
    //                if (coordIndex == 1) {
    //                    vertices[k] += element.movement.xDist;
    //                }
    //                if (coordIndex == 2) {
    //                    vertices[k] += element.movement.yDist;
    //                }
    //                if (coordIndex == 3) {
    //                    vertices[k] += element.movement.zDist;
    //                    coordIndex = 0;
    //                }
    //                element.geometry.updatedVertices = vertices;
    //                element.wasAnimated = true;
    //            }
    //        }
    //    }
    //};

    function _calcDistance(movement) {
        var dx = movement.dX;
        var dy = movement.dY;
        var dz = movement.dZ;
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
}