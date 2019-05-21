var c = document.querySelector("canvas");

c.width = 300;
c.height = 300;

var ctx = c.getContext("2d");

function f(x) {
    if (x > 0) return 2;
    if (x < 0) return -2;
    return 0;
}

const squareWidth = 30;

var sprites = new Image();
sprites.src = "spritesheet.bmp";

let keys = {};
onkeydown = onkeyup = function (e) {
    e = e || window.event;
    keys[e.key] = (e.type == "keydown");
}

class Terrain {
    constructor(terrain, width, cameraPos, reactions) {
        this._terrain = terrain;
        this._width = width;
        this._height = this._terrain.length / this._width;
        this._camera = cameraPos.slice();
        this._cameraPanTo = cameraPos.slice();
        this._reactions = reactions;
    }

    get terrain() { return this._terrain; }
    set terrain(value) { this._terrain = value; }
    get height() { return this._height; }
    get width() { return this._width; }
    get camera() { return this._camera; }
    set camera(value) { this._camera = value; }
    get cameraPanTo() { return this._cameraPanTo; }
    set cameraPanTo(value) { this._cameraPanTo = value; }
    get reactions() { return this._reactions; }

    render() {
        for (var i = 0; i < this._terrain.length; i++) {
            var x = i % this._width;
            var y = (i - x) / this._width;
            ctx.drawImage(sprites, this._terrain[i] * squareWidth, 0, squareWidth, squareWidth, x * squareWidth - this._camera[0], y * squareWidth - this._camera[1], squareWidth, squareWidth);
        }
    }
}

class Player {
    constructor(x, y, terrain) {
        this._x = x;
        this._y = y;
        this._terrain = terrain;
        this._retroMoveStyle = true;
    }

    move() {
        if (this._terrain.camera[0] == this._terrain.cameraPanTo[0] && this._terrain.camera[1] == this._terrain.cameraPanTo[1]) {
            if (this._retroMoveStyle) {
                if (keys['w']) this.step(0, -squareWidth);
                if (keys['a']) this.step(-squareWidth, 0);
                if (keys['s']) this.step(0, squareWidth);
                if (keys['d']) this.step(squareWidth, 0);
                keys['w'] = false;
                keys['a'] = false;
                keys['s'] = false;
                keys['d'] = false;
            }
            else {
                if (keys['w']) this.step(0, -2);
                if (keys['a']) this.step(-2, 0);
                if (keys['s']) this.step(0, 2);
                if (keys['d']) this.step(2, 0);
            }
        }
        else {
            if (this._retroMoveStyle) {
                this._terrain.camera[0] = this._terrain.cameraPanTo[0];
                this._terrain.camera[1] = this._terrain.cameraPanTo[1];
            }
            else {
                this._terrain.camera[0] += f(this._terrain.cameraPanTo[0] - this._terrain.camera[0]);
                this._terrain.camera[1] += f(this._terrain.cameraPanTo[1] - this._terrain.camera[1]);
            }
        }
    }

    step(x, y) {
        this._x += x;
        this._y += y;
        if (this.collision()) {
            this._x -= x;
            this._y -= y;
        }
        if (this._terrain.camera[0] == this._terrain.cameraPanTo[0] && this._terrain.camera[1] == this._terrain.cameraPanTo[1]) {
            if (this._x - 1 < this._terrain.camera[0]) this._terrain.cameraPanTo[0] -= c.width - squareWidth;
            if (this._x + 7 > this._terrain.camera[0] + c.width) this._terrain.cameraPanTo[0] += c.width - squareWidth;
            if (this._y - 1 < this._terrain.camera[1]) this._terrain.cameraPanTo[1] -= c.height- squareWidth;
            if (this._y + 7 > this._terrain.camera[1] + c.height) this._terrain.cameraPanTo[1] += c.height - squareWidth;
        }
    }

    collision() {
        field.render();
        var returnVal = false;
        var imgd = ctx.getImageData(this._x - this._terrain.camera[0], this._y - this._terrain.camera[1], 6, 6);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var rgb = pix[i].toString() + pix[i + 1].toString() + pix[i + 2].toString();
            if (rgb != "255255255" && rgb != "000") {
                returnVal = true;
                var x = (i / 4) / 2;
                var y = ((i / 4) - x) / 2;
                var fieldI = Math.floor((this._x + x) / squareWidth) + Math.floor((this._y + y) / squareWidth) * this._terrain.width;
                if (this._terrain.reactions[fieldI] != undefined) {
                    var reactions = this._terrain.reactions[fieldI];
                    for (var j = 0; j < reactions.length; j++) {
                        this._terrain.terrain[reactions[j]] = 0;
                    }
                }
            }
        }
        player.render();
        return returnVal;
    }

    render() {
        ctx.drawImage(sprites, 300, 0, 6, 6, this._x - this._terrain.camera[0], this._y - this._terrain.camera[1], 6, 6);
    }
}

var field = new Terrain([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 9, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
], 47, [10 * squareWidth, 9 * squareWidth], {483: [483, 576], 626: [535], 431: [480, 676]});

var player = new Player(11 * squareWidth + 12, 10 * squareWidth + 18, field);

function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, c.width, c.height);
    player.move();
    field.render();
    player.render();
}
loop();
