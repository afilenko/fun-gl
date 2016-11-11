var Utils = function () {

    this.getViewportParams = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    };

    this.makePerspective = function (fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return this.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    };

    this.makeFrustum = function (left, right,
                                 bottom, top,
                                 znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);

        return $M([[X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]]);
    };

    this.getCookie = function (name) {
        var i, x, y, ARRcookies = document.cookie.split(";");

        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == name) {
                return y;
            }
        }
    };

    this.rotateAroundX = function (element, theta) {
        var vertices = element.geometry.relativeVertices.slice();
        //var normals = element.geometry.relativeNormals.slice();
        var normals = element.geometry.normals.slice();
        var sinT = Math.sin(theta);
        var cosT = Math.cos(theta);

        var coordIndex = 0;
        for (var i = 0; i < vertices.length; i++) {
            coordIndex++;
            if (coordIndex == 3) {
                var y = vertices[i - 1];
                var z = vertices[i];
                vertices[i - 2] += element.geometry.axis.x;
                vertices[i - 1] = y * cosT - z * sinT + element.geometry.axis.y;
                vertices[i] = z * cosT + y * sinT + element.geometry.axis.z;

                y = normals[i - 1];
                z = normals[i];

                //normals[i - 2] += element.geometry.axis.x;
                //normals[i - 1] = y * cosT - z + element.geometry.axis.y;
                //normals[i] = z * cosT + y * sinT + element.geometry.axis.z;
                //
                //normals[i - 2] -= vertices[i - 2];
                //normals[i - 1] -= vertices[i - 1];
                //normals[i] -= vertices[i];


                normals[i - 1] = y * cosT - z * sinT;
                normals[i] = z * cosT + y * sinT;
                coordIndex = 0;
            }
        }
        element.geometry.updatedVertices = vertices;
        element.geometry.updatedNormals = normals;
        element.wasAnimated = true;
    };

    this.rotateAroundY = function (element) {
        var theta = element.movement.rotationY;
        var vertices = element.geometry.relativeVertices.slice();
        //var normals = element.geometry.relativeNormals.slice();
        var normals = element.geometry.normals.slice();
        var sinT = Math.sin(theta);
        var cosT = Math.cos(theta);

        var coordIndex = 0;
        for (var i = 0; i < vertices.length; i++) {
            coordIndex++;
            if (coordIndex == 3) {
                var x = vertices[i - 2];
                var z = vertices[i];
                vertices[i - 1] += element.geometry.axis.y;
                vertices[i - 2] = x * cosT - z * sinT + element.geometry.axis.x;
                vertices[i] = z * cosT + x * sinT + element.geometry.axis.z;

                x = normals[i - 2];
                z = normals[i];

                //normals[i - 2] += element.geometry.axis.x;
                //normals[i - 1] = y * cosT - z + element.geometry.axis.y;
                //normals[i] = z * cosT + y * sinT + element.geometry.axis.z;
                //
                //normals[i - 2] -= vertices[i - 2];
                //normals[i - 1] -= vertices[i - 1];
                //normals[i] -= vertices[i];


                normals[i - 2] = x * cosT - z * sinT;
                normals[i] = z * cosT + x * sinT;
                coordIndex = 0;
            }
        }
        element.geometry.updatedVertices = vertices;
        element.geometry.updatedNormals = normals;
        element.wasAnimated = true;
    };
};
