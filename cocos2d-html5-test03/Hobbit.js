/*
 * Hobbit class
 */

var TARGETED_MOVEMENT_THRESHOLD = 1,
    TARGETED_JUMP_THRESHOLD = 5;

var Hobbit = cc.Sprite.extend({

    rigidBody: null,
    spawnPos: null,
    playerIsJumping: false,
    playerIsWalking: false,
    playerMoveDir: 0,
    playerFaceDir: 1,
    playerJump: false,
    moveTarget: null,

    ctor: function() {
        cc.log("Hobbit was instantiated");
        this._super();
    },

    onDidLoadFromCCB: function() {
        cc.log("Hobbit was loaded");
        this.init();
        this.setTag("Hobbit");
    },

    init: function() {
        this._super();
        var node = this.rootNode;
        this.spawnPos = node.getPosition();
    },

    initPhysics: function(world) {
        var node = this.rootNode;
        var playerBodyDef = new Box2D.Dynamics.b2BodyDef();
        playerBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        playerBodyDef.position = node.getPosition();
        playerBodyDef.userData = node;
        playerBodyDef.linearDamping = 0.5;
        playerBodyDef.angularDamping = 1;

        this.rigidBody = world.CreateBody(playerBodyDef);

        var playerRect = new Box2D.Collision.Shapes.b2PolygonShape();
        playerRect.SetAsBox(node.getScaleX() * node.getContentSize().width / 2,
            node.getScaleX() * node.getContentSize().height / 2);
        var hobbitShapeDef = new Box2D.Dynamics.b2FixtureDef();
        hobbitShapeDef.shape = playerRect;
        hobbitShapeDef.density = 1.0;
        hobbitShapeDef.friction = 0.2;
        hobbitShapeDef.restitution = 0.1;
        this.rigidBody.CreateFixture(hobbitShapeDef);
    },

    update: function(dt) {
        var currVel = this.rigidBody.GetLinearVelocity(),
            bPos =  this.rigidBody.GetPosition(),
            node = this.rootNode,
            scale = { x: node.getScaleX(), y: node.getScaleY() },
            anch = node.getAnchorPointInPoints(),
            anchPoint = cc.p(anch.x * scale.x, anch.y * scale.y),
            contentSize = node.getContentSize(),
            size = { width: contentSize.width * scale.x, height: contentSize.height * scale.y };

        //oldVel.x = Math.min(Math.abs(oldVel.x), controller.maxMoveVelocity) * oldVel.x/Math.abs(oldVel.x);
        //playerBody.SetLinearVelocity(currVel);

        //cc.log(bPos);

        this.playerIsJumping = Math.abs(currVel.y) > 0.5;

        var animationManager = this.rootNode.animationManager;
        if (Math.abs(currVel.x) > 10 && !this.playerIsWalking && !this.playerIsJumping) {
            animationManager.runAnimationsForSequenceNamed("HobbitRun");
            this.playerIsWalking = true;
        } else  if (Math.abs(currVel.x) > 2 && !this.playerIsWalking && !this.playerIsJumping) {
            animationManager.runAnimationsForSequenceNamed("HobbitWalk");
            this.playerIsWalking = true;
        } else  if (Math.abs(currVel.x) < 0.5 && this.playerIsWalking) {
            animationManager.runAnimationsForSequenceNamed("HobbitIdle");
            this.playerIsWalking = false;
        }

        if (bPos.y < 0) {
            this.rigidBody.SetPosition(this.spawnPos);
            currVel.x = 0;
            currVel.y = 0;
            this.moveTarget = null;
            this.playerMoveDir = 0;
        }

        if (this.moveTarget) {
            var ds = { x: this.moveTarget.x - bPos.x, y: this.moveTarget.y - bPos.y };

            if (Math.abs(ds.x) > TARGETED_MOVEMENT_THRESHOLD) {
                this.playerMoveDir = ds.x / Math.abs(ds.x);
                this.playerFaceDir = ds.x / Math.abs(ds.x);
            } else {
                this.playerMoveDir = 0;
                if (!this.playerIsJumping) { currVel.x = 0 ; }
                //this.rigidBody.SetLinearVelocity(currVel);
                this.moveTarget = null;
            }

            if (ds.y > size.height/2 + TARGETED_JUMP_THRESHOLD) {
                this.playerJump = true;
                if (this.moveTarget) {
                    this.moveTarget.y = bPos.y;
                }
            }
        }

        var currForce = {x: 0, y: 0}, i;
        currForce.x = this.playerMoveDir * 1000;

        // TODO control jump impulse time
        if (this.playerJump) {
            this.playerJump = false;
            var contacts = [].concat(this.rigidBody.GetContactList());
            var sited = false;
            for (i in contacts) {
                if (contacts.hasOwnProperty(i)) {
                    if (contacts[i] && contacts[i].other) {
                        sited |= (contacts[i].other.GetPosition().y < bPos.y - size.height/2);
                    }
                }
            }
            if (sited) {
                currForce.y = 100000;
            }
        }

        var force = new Box2D.Common.Math.b2Vec2(currForce.x, currForce.y);
        var point = bPos;

        this.rigidBody.ApplyImpulse(force, point);

        node.setPosition(cc.p(bPos.x + anchPoint.x - size.width / 2, bPos.y + anchPoint.y - size.height / 2));
        node.setFlipX(this.playerFaceDir == -1);
    },

    handleKeyDown: function(e) {
        switch (e) {
            case cc.KEY.left: this.playerMoveDir = -1;
                this.playerFaceDir = -1;
                break;
            case cc.KEY.right: this.playerMoveDir = 1;
                this.playerFaceDir = 1;
                break;
            case cc.KEY.space: this.playerJump = true;
                break;
        }
    },

    handleKeyUp: function(e) {
        switch (e) {
            case cc.KEY.left:
            case cc.KEY.right: this.playerMoveDir = 0;
                break;
            case cc.KEY.space: this.playerJump = false;
                break;
        }
    },

    handleTouchesBegan: function(touches, event) {
        this.moveTarget = touches[0].getLocation();
        this.moveTarget.y = this.rigidBody.GetPosition().y;
    },

    handleTouchesEnded: function(touches, event) {
        // TODO
    },

    handleTouchesCancelled: function(touches, event) {
        // TODO
    },

    handleTouchesMoved: function(touches, event) {
        this.moveTarget = touches[0].getLocation();
    },

    handleMouseDragged: function(event) {
        // TODO
    },

    handleMouseDown: function(event) {
        this.moveTarget = event.getLocation();
    },

    handleAccelerometer: function(accelEvent) {
        // low pass filter for accelerometer. This makes the movement softer
        cc.log(accelEvent);
        var accelX = accelEvent.x * CD_ACCELERATION_FILTER_FACTOR; // + (1 - CD_ACCELERATION_FILTER_FACTOR) * this.prevX;
        // this.prevX = accelX;

        //var newX = this.winSize.width * accelX + this.winSize.width/2;
        this.playerMoveDir = accelX > 0 ? 1 : (accelX < 0 ? -1 : 0);
        // cc.log('Accel x: '+ accelEvent.x + ' y:' + accelEvent.y + ' z:' + accelEvent.z + ' time:' + accelEvent.timestamp );
    }

});


