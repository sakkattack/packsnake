// ==========
// Ghost STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Ghost(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.randomisePosition();

    this.rememberResets();

    if(!this.color){
        this.color = 0;
    }
    
    switch (this.color) {
        case 0:
        this.sprite = g_sprites.ghostRed;
            break;
        case 1:
        this.sprite = g_sprites.ghostOrange;
            break;
        case 2:
        this.sprite = g_sprites.ghostPink;
            break;
        case 3:
        this.sprite = g_sprites.ghostBlue;
            break;
    
        default:
        this.sprite = this.sprite;
            break;
    }
    
    // Set normal drawing scale, and warp state off
    this._scale = 1;
    this._isWarping = false;
};

Ghost.prototype = new Entity();

Ghost.prototype.delay = 1000 / NOMINAL_UPDATE_INTERVAL;

Ghost.prototype.randomisePosition = function () {
    // Rock randomisation defaults (if nothing otherwise specified)
    this.cx = this.cx || Math.random() * g_canvas.width;
    this.cy = this.cy || Math.random() * g_canvas.height;
    this.rotation = this.rotation || 0;
};

Ghost.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};



// Initial, inheritable, default values
Ghost.prototype.rotation = 0;
Ghost.prototype.velX = 0;
Ghost.prototype.velY = 1;


Ghost.prototype._moveToASafePlace = function () {

    // Move to a safe place some suitable distance away
    var origX = this.cx,
        origY = this.cy,
        MARGIN = 40,
        isSafePlace = false;

    for (var attempts = 0; attempts < 100; ++attempts) {
    
        var warpDistance = 100 + Math.random() * g_canvas.width /2;
        var warpDirn = Math.random() * consts.FULL_CIRCLE;
        
        this.cx = origX + warpDistance * Math.sin(warpDirn);
        this.cy = origY - warpDistance * Math.cos(warpDirn);
        
        this.wrapPosition();
        
        // Don't go too near the edges, and don't move into a collision!
        if (!util.isBetween(this.cx, MARGIN, g_canvas.width - MARGIN)) {
            isSafePlace = false;
        } else if (!util.isBetween(this.cy, MARGIN, g_canvas.height - MARGIN)) {
            isSafePlace = false;
        } else {
            isSafePlace = !this.isColliding();
        }

        // Get out as soon as we find a safe place
        if (isSafePlace) break;
        
    }
};

Ghost.prototype.getBestMove = function() {
    // AI pælingar random sammt ekki random eftir leveli ? 
    var snakePos = entityManager.getSnakePos();
    
    var bestX = snakePos.cx - this.cx;
    var bestY = snakePos.cy - this.cy;

    if (Math.abs(bestX) >= Math.abs(bestY)){
        this.velY = 0;
        this.velX = bestX/Math.abs(bestX);
   } else {
        this.velX = 0;
        this.velY = bestY/Math.abs(bestY);
    }
}

Ghost.prototype.getRandomMove = function() {
    var rand = Math.floor(Math.random()*4 +1);
    switch (rand) {
        case 1:
            this.velX = 1;
            this.velY = 0;
            break;
        case 1:
            this.velX = -1;
            this.velY = 0;
            break;
        case 1:
            this.velX = 0;
            this.velY = 1;
            break;
        case 1:
            this.velX = 0;
            this.velY = -1;
            break;
        default:
            this.velX = 1;
            this.velY = 0;
            break;
    }

}
    
Ghost.prototype.update = function (du) {

    spatialManager.unregister(this);
    
    if(this._isDeadNow){
        return entityManager.KILL_ME_NOW;
    }

    var rand = Math.random();

    this.delay -= du;

    if(this.delay < 0){
        if (rand > 0.2){
            this.getBestMove();
        }else {
            this.getRandomMove();
        }
        this.delay = 1000 / NOMINAL_UPDATE_INTERVAL;
    }

    
    
    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.wrapPosition();

};


Ghost.prototype.getRadius = function () {
    return this.sprite.width;
};

Ghost.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
};


Ghost.prototype.render = function (ctx) {
    this.sprite.drawWrappedCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );
};