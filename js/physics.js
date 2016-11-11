function Physics() {
    var elements = [];

    this.addElement = function (element, movement) {
        element.movement = movement;
        elements.push(element);
    };

    this.updateElements = function () {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            _processCollisions(element);
            element.movement.x += element.movement.dX;
            element.movement.y += element.movement.dY;
            element.movement.z += element.movement.dZ;

            for (var j = 0; j < element.parts.length; j++) {
                var vertices = element.parts[j].geometry.vertices.slice();
                var coordIndex = 0;
                for (var k = 0; k < vertices.length; k++) {
                    coordIndex++;
                    if (coordIndex == 1) {
                        vertices[k] += element.movement.x;
                    }
                    if (coordIndex == 2) {
                        vertices[k] += element.movement.y;
                    }
                    if (coordIndex == 3) {
                        vertices[k] += element.movement.z;
                        coordIndex = 0;
                    }
                    element.parts[j].geometry.updatedVertices = vertices;
                }
                element.wasAnimated = true;
            }
        }
    };

    function _processCollisions(element) {
        var size = element.size;
        var left = -3;
        var right = 3;
        var bottom = 0;
        var top = 1;
        var rear = -3;
        var front = 3;
        if (element.movement.x - size <= left) {
            element.movement.x = left + size;
            _reflectElement(element, [1, 0, 0]);
        }
        else if (element.movement.x + size >= right) {
            element.movement.x = right - size;
            _reflectElement(element, [-1, 0, 0]);
        }
        else if (element.movement.y - size <= bottom) {
            element.movement.y = bottom + size;
            _reflectElement(element, [0, 1, 0]);
        }
        else if (element.movement.y + size >= top) {
            element.movement.y = top - size;
            _reflectElement(element, [0, -1, 0]);
        }
        else if (element.movement.z - size <= rear) {
            element.movement.z = rear + size;
            _reflectElement(element, [0, 0, -1]);
        }
        else if (element.movement.z + size >= front) {
            element.movement.z = front - size;
            _reflectElement(element, [0, 0, 1]);
        }
    }

    function _reflectElement(element, n) {
        var a = [element.movement.dX, element.movement.dY, element.movement.dZ];
        var b = {};
        var k = n[0] * a[0] + n[1] * a[1] + n[2] * a[2];
        b[0] = a[0] + n[0] * k * -2.0;
        b[1] = a[1] + n[1] * k * -2.0;
        b[2] = a[2] + n[2] * k * -2.0;

        element.movement.dX = b[0];
        element.movement.dY = b[1];
        element.movement.dZ = b[2];
    }
}