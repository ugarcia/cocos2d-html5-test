//
// MainSceneController class
//

var PTM_RATIO = 32.0;

var MainSceneController = function(controller) {
    this.controller = controller;
    this.init();
};

MainSceneController.prototype = {
    controller: null,
    rootNode: null,
    player: null,
    playerSpawnPos: null,
    playerMoveDir: 0,
    playerFaceDir: 1,
    playerJump: false,
    playerIsJumping: false,
    playerIsWalking: false,
    maxMoveVelocity: 50,
    staticObjects: [],
    dynamicObjects: [],

    init: function() {
        console.log(this);

        var controller = this;
        this.rootNode = this.controller.rootNode;

        // Physic world initialization
        var gravity = new Box2D.Common.Math.b2Vec2(0.0, -100.0);
        var world = new Box2D.Dynamics.b2World(gravity);
        world.SetContinuousPhysics(true);

        var dbgDraw = new Box2D.Dynamics.b2DebugDraw();
        dbgDraw.SetSprite(cc.renderContext);
        dbgDraw.m_drawScale = PTM_RATIO;
        dbgDraw.m_fillAlpha = 0.7;
        dbgDraw.m_lineThickness = 2.0;
        dbgDraw.m_drawFlags = Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit;
        world.SetDebugDraw(dbgDraw);

        // Player dynamic body/fixture creation
        this.player = this.controller.myHobbit;
        this.playerSpawnPos = this.player.getPosition();

        var playerBodyDef = new Box2D.Dynamics.b2BodyDef();
        playerBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        playerBodyDef.position = this.player.getPosition();
        playerBodyDef.userData = this.player;
        playerBodyDef.linearDamping = 0.5;
        playerBodyDef.angularDamping = 1;

        var playerBody = world.CreateBody(playerBodyDef);

        var playerRect = new Box2D.Collision.Shapes.b2PolygonShape;
        playerRect.SetAsBox(this.player.getScaleX() * this.player.getContentSize().width/2,
                            this.player.getScaleX() * this.player.getContentSize().height/2);
        var hobbitShapeDef = new Box2D.Dynamics.b2FixtureDef();
        hobbitShapeDef.shape = playerRect;
        hobbitShapeDef.density = 1.0;
        hobbitShapeDef.friction = 0.2;
        hobbitShapeDef.restitution = 0.1;
        playerBody.CreateFixture(hobbitShapeDef);


        // Ball dynamic body/fixture creation
        var ball = this.controller.myStar;

        var ballBodyDef = new Box2D.Dynamics.b2BodyDef();
        ballBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        ballBodyDef.position = ball.getPosition();
        ballBodyDef.userData = ball;
        ballBodyDef.linearDamping = 0.2;
        ballBodyDef.angularDamping = 0.2;

        var ballBody = world.CreateBody(ballBodyDef);

        var circle = new Box2D.Collision.Shapes.b2CircleShape;
        circle.m_radius = 16.0;
        var ballShapeDef = new Box2D.Dynamics.b2FixtureDef();
        ballShapeDef.shape = circle;
        ballShapeDef.density = 1.0;
        ballShapeDef.friction = 0.2;
        ballShapeDef.restitution = 0.8;
        ballBody.CreateFixture(ballShapeDef);

        // Platform static body/fixture creation
        var platforms = this.controller.platforms.getChildren();

        for (var key in platforms) {
            var platform = platforms[key];
            platform.setTag("platform");
            var platformBodyDef = new Box2D.Dynamics.b2BodyDef();
            platformBodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
            platformBodyDef.position = platform.getPosition();
            platformBodyDef.userData = platform;

            var platformBody = world.CreateBody(platformBodyDef);

            var rect = new Box2D.Collision.Shapes.b2PolygonShape;
            rect.SetAsBox(platform.getContentSize().width/2, platform.getContentSize().height/2);
            var rectShapeDef = new Box2D.Dynamics.b2FixtureDef();
            rectShapeDef.shape = rect;
            rectShapeDef.density = 1.0;
            rectShapeDef.friction = 0.8;
            rectShapeDef.restitution = 0.0;
            platformBody.CreateFixture(rectShapeDef);
        }

        this.rootNode.update = function(dt) {
            var currVel = playerBody.GetLinearVelocity();
            //oldVel.x = Math.min(Math.abs(oldVel.x), controller.maxMoveVelocity) * oldVel.x/Math.abs(oldVel.x);
            //playerBody.SetLinearVelocity(currVel);
            controller.playerIsJumping = Math.abs(currVel.y) > 0.5;
            if (Math.abs(currVel.x) > 10 && !controller.playerIsWalking && !controller.playerIsJumping) {
                controller.rootNode.animationManager.runAnimationsForSequenceNamed("hobbitRunTimeline");
                controller.playerIsWalking = true;
            } else  if (Math.abs(currVel.x) > 2 && !controller.playerIsWalking && !controller.playerIsJumping) {
                controller.rootNode.animationManager.runAnimationsForSequenceNamed("hobbitWalkTimeline");
                controller.playerIsWalking = true;
            } else  if (Math.abs(currVel.x) < 0.5 && controller.playerIsWalking) {
                controller.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
                controller.playerIsWalking = false;
            }

            if (playerBody.GetPosition().y < 0)
                playerBody.SetPosition(controller.playerSpawnPos);


            var currForce = {x: 0, y: 0};
            currForce.x = controller.playerMoveDir * 1000;
            if (controller.playerJump) {
                var contacts = [].concat(playerBody.GetContactList());
                var sited = false;
                for (var i in contacts) {
                    if (contacts[i] && contacts[i].other) {
                        var other = contacts[i].other.GetUserData();
                        sited |= (other && //other.getTag() == 'platform' &&
                            other.getPositionY() < playerBody.GetUserData().getPositionY()) ;
                    }
                }
                if (sited) currForce.y = 5000000;
            }
            var force = new Box2D.Common.Math.b2Vec2(currForce.x, currForce.y);
            var point = playerBody.GetPosition();

            playerBody.ApplyImpulse(force, point);

            world.Step(dt, 10, 10);


            var bodyData = playerBody.GetUserData(),
                bPos = playerBody.GetPosition(),
                scale = { x: bodyData.getScaleX(), y: bodyData.getScaleY() },
                anch = bodyData.getAnchorPointInPoints(),
                anchPoint = cc.p(anch.x * scale.x, anch.y * scale.y),
                contentSize = bodyData.getContentSize(),
                size = { width: contentSize.width * scale.x, height: contentSize.height * scale.y };
            bodyData.setPosition(cc.p(bPos.x + anchPoint.x - size.width / 2, bPos.y + anchPoint.y - size.height / 2));
            bodyData.setFlipX(controller.playerFaceDir == -1);


            var bodyData = ballBody.GetUserData(),
                bPos = ballBody.GetPosition(),
                bAngle = ballBody.GetAngle(),
                scale = { x: bodyData.getScaleX(), y: bodyData.getScaleY() },
                anch = bodyData.getAnchorPointInPoints(),
                anchPoint = cc.p(anch.x * scale.x, anch.y * scale.y),
                contentSize = bodyData.getContentSize(),
                size = { width: contentSize.width * scale.x, height: contentSize.height * scale.y };
            bodyData.setPosition(cc.p(bPos.x + anchPoint.x - size.width / 2, bPos.y + anchPoint.y - size.height / 2));
            bodyData.setRotation(-1 * cc.RADIANS_TO_DEGREES(bAngle));
            //console.log(bodyData);

            world.DrawDebugData();
            world.ClearForces();
        };
        this.rootNode.scheduleUpdate();

        this.rootNode.onKeyDown = function(e) {
            //if (!controller.playerIsJumping) {
                switch (e) {
                    case cc.KEY.left: controller.playerMoveDir = -1;
                        controller.playerFaceDir = -1;
                                        break;
                    case cc.KEY.right: controller.playerMoveDir = 1;
                        controller.playerFaceDir = 1;
                        break;
                    case cc.KEY.space: controller.playerJump = true;
                        break;
                }
            //}
        };

        this.rootNode.onKeyUp = function(e) {
            switch (e) {
                case cc.KEY.left:
                case cc.KEY.right: controller.playerMoveDir = 0;
                    break;
                case cc.KEY.space: controller.playerJump = false;
                    break;
            }
        };
    }
};