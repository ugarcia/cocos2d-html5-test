/*
 * GameScene class
 */

var PTM_RATIO = 32.0,
    // Accelerometer
    CD_ACCELERATION_FILTER_FACTOR = 0.25;

var GameScene = cc.Node.extend({

    world: null,
    keyboardEnabled: false,
    mouseEnabled: false,
    touchEnabled: false,
    accelerometerEnabled: false,

    ctor: function() {
        cc.log("Game scene node instantiated");
        this._super();
    },

    onDidLoadFromCCB: function() {
        cc.log("Game scene was loaded");

        this.init();

        var that = this;

        this.rootNode.update = function(dt) {
            that.update.call(that, dt);
        };
        this.rootNode.scheduleUpdate();

        this.initInputHandlers();

        this.enableInputHandlers();
        cc.log(this);
        this.inputMenu.controller.gameController = this;
    },

    init: function() {
        this._super();
        this.setTag("GameScene");

        // Physic world initialization
        var gravity = new Box2D.Common.Math.b2Vec2(0.0, -100.0);
        this.world = new Box2D.Dynamics.b2World(gravity);
        this.world.SetContinuousPhysics(true);

        var dbgDraw = new Box2D.Dynamics.b2DebugDraw();
        dbgDraw.SetSprite(cc.renderContext);
        dbgDraw.SetDrawScale(PTM_RATIO);
        dbgDraw.SetFillAlpha(0.7);
        dbgDraw.SetLineThickness(2.0);
        dbgDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
        //dbgDraw.DrawCircle(new Box2D.Common.Math.b2Vec2(100.0, 100.0), 50, new Box2D.Common.b2Color(255, 128, 128));
        this.world.SetDebugDraw(dbgDraw);

        var platforms = this.platforms.getChildren();
        for (var i= 0, j=platforms.length; i<j; i++) {
            platforms[i].controller.initPhysics(this.world);
        }

        this.player.controller.initPhysics(this.world);
    },

    initInputHandlers: function() {
        var that = this;

        this.objectsLayer.onKeyDown = function(e) {
            that.onKeyDown.call(that, e);
            return true;
        };

        this.objectsLayer.onKeyUp = function(e) {
            that.onKeyUp.call(that, e);
            return true;
        };

        this.objectsLayer.onTouchesBegan = function( touches, event) {
            that.onTouchesBegan.call(that, touches, event);
            return true;
        };

        this.objectsLayer.onTouchesMoved = function( touches, event) {
            that.onTouchesMoved.call(that, touches, event);
            return true;
        };

        this.objectsLayer.onTouchesEnded = function( touches, event) {
            that.onTouchesEnded.call(that, touches, event);
            return true;
        };

        this.objectsLayer.onTouchesCancelled = function( touches, event) {
            that.onTouchesCancelled.call(that, touches, event);
            return true;
        };

        this.objectsLayer.onMouseDragged = function( event) {
            that.onMouseDragged.call(that, event);
            return true;
        };

        this.objectsLayer.onMouseDown = function( event) {
            that.onMouseDown.call(that, event);
            return true;
        };

        this.objectsLayer.onAccelerometer = function( event) {
            that.onAccelerometer.call(that, event);
        };
    },

    enableInputHandlers: function() {
        this.objectsLayer.setKeyboardEnabled(this.keyboardEnabled);
        this.objectsLayer.setTouchEnabled(this.touchEnabled);
        this.objectsLayer.setAccelerometerEnabled(this.accelerometerEnabled);
    },

    update: function(dt) {
        this._super();
        this.world.Step(dt, 10, 10);

        this.player.controller.update(dt);

        this.world.DrawDebugData();
        this.world.ClearForces();
    },

    onKeyDown: function(e) {
        this.player.controller.handleKeyDown(e);
    },

    onKeyUp: function(e) {
        this.player.controller.handleKeyUp(e);
    },

    onTouchesBegan: function(touches, e) {
        this.player.controller.handleTouchesBegan(touches, e);
    },

    onTouchesEnded: function(touches, e) {
        this.player.controller.handleTouchesEnded(touches, e);
    },

    onTouchesCancelled: function(touches, e) {
        this.player.controller.handleTouchesCancelled(touches, e);
    },

    onTouchesMoved: function(touches, e) {
        this.player.controller.handleTouchesMoved(touches, e);
    },

    onMouseDown: function(e) {
        if (this.mouseEnabled) {
            this.player.controller.handleMouseDown(e);
        }
    },

    onMouseDragged: function(e) {
        if (this.mouseEnabled) {
            this.player.controller.handleMouseDragged(e);
        }
    },

    onAccelerometer: function(e) {
        this.player.controller.handleAccelerometer(e);
    }

});
