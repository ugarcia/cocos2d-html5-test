/*
 * Platform00 class
 */

var Platform00 = cc.Sprite.extend({

    rigidBody: null,

    ctor: function() {
        cc.log("Platform00 was instantiated");
        this._super();
    },

    onDidLoadFromCCB: function() {
        cc.log("Platform00 was loaded");
        this.init();
    },

    init: function() {
        this._super();
        this.setTag("Platform00");
    },

    initPhysics: function(world) {
        var node = this.rootNode;
        var platformBodyDef = new Box2D.Dynamics.b2BodyDef();
        platformBodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        platformBodyDef.position = node.getPosition();
        platformBodyDef.userData = node;

        this.rigidBody = world.CreateBody(platformBodyDef);

        var rect = new Box2D.Collision.Shapes.b2PolygonShape;
        rect.SetAsBox(node.getContentSize().width/2, node.getContentSize().height/2);
        var rectShapeDef = new Box2D.Dynamics.b2FixtureDef();
        rectShapeDef.shape = rect;
        rectShapeDef.density = 1.0;
        rectShapeDef.friction = 0.8;
        rectShapeDef.restitution = 0.0;
        this.rigidBody.CreateFixture(rectShapeDef);
    }

});
