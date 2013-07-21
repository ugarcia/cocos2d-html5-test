/**
 * Created with IntelliJ IDEA.
 * User: unai
 * Date: 30/06/13
 * Time: 13:51
 * To change this template use File | Settings | File Templates.
 */
var AnimatedSprite = cc.Node.extend(
{
    _sprite: null,
    _animationSequence: null,
    _defaultAnimation: null,
    _animations: [],
    _currAnimation: null,
    _currFaceDir: 1,

    _spawnPosition: {x: 200, y: 200},
    _currPosition: null,
    _velocity: {x: 0, y: 0},
    _acceleration: {x: 0, y: 0},

    _drag: 200,
    _moveSpeed: 300,
    _moveThreshold: 5,
    _walkThreshold: 80,
    _maxVelocity: 100,

    ctor: function(frame)
    {
        this._super();
        this.setPosition(cc.p(this._spawnPosition.x, this._spawnPosition.y));
        this._currPosition = {x: this._spawnPosition.x, y: this._spawnPosition.y};
        this._sprite = cc.Sprite.createWithSpriteFrameName(frame);
        this._sprite.setScale(3);
        this.addChild(this._sprite);
        this.scheduleUpdate();
    },

    pad: function(a, b)
    {
        return (1e15 + a + "").slice(-b);
    },

    update :function(dt)
    {
        //console.log ("e: " + this._currPosition.x + " / v: " + this._velocity.x + " / a: " + this._acceleration.x);

        var applyDrag = (Math.abs(this._velocity.x) > this._moveThreshold);
        var accX = this._acceleration.x - (this._velocity.x > 0 ? 1 : -1) * (applyDrag ? this._drag : 0);
        this._currPosition.x += this._velocity.x * dt + 0.5 * accX * dt * dt;
        this._velocity.x += accX * dt;
        this.setPosition(cc.p(this._currPosition.x, this._currPosition.y));

        if (Math.abs(this._velocity.x) > this._maxVelocity)
            this._velocity.x  = (this._velocity.x > 0 ? 1 : -1) * this._maxVelocity;
        if (Math.abs(this._velocity.x) > 0 && Math.abs(this._velocity.x) <= this._moveThreshold) {
            this._currFaceDir = (this._velocity.x > 0 ? 1 : -1);
            this._velocity.x = 0;
        }
        this._sprite.runAction(cc.FlipX.create(this._velocity.x < 0 || (this._velocity.x == 0 && this._currFaceDir < 0)));

        if (Math.abs(this._velocity.x) > this._walkThreshold)
            this.playAnimation('Walk_right', 5, function() { this._currAnimation = '' });
        else if (Math.abs(this._velocity.x) > this._moveThreshold)
            this.playAnimation('Move_right', 5, function() { this._currAnimation = '' });
        else
            this.playDefaultAnimation();
    },

    playAnimation: function(name, speed, callback)
    {
        if (this._currAnimation == name)
            return;
        if (this._animationSequence)
            this._sprite.stopAction(this._animationSequence);
        this._animations[name].setDelayPerUnit(1.0/speed);
        var action = cc.Animate.create(this._animations[name]);
        this._animationSequence = cc.Sequence.create(action, cc.CallFunc.create(callback, this));
        this._sprite.runAction(this._animationSequence);
        this._currAnimation = name;
    },

    setAnimation: function(name, numFrames)
    {
        this._animations[name] = new cc.Animation.create();
        for (var i=0; i < numFrames;  i++) {
            var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame(name + this.pad(i,2) + '.png')
            this._animations[name].addSpriteFrame(spriteFrame);
        }
    },

    setDefaultAnimation: function(name)
    {
        this._defaultAnimation = name;
    },

    playDefaultAnimation: function()
    {
        this.playAnimation(this._defaultAnimation, 10, void(0));
    },

    handleKeyDown: function(e)
    {
        if (e == cc.KEY.left || e == cc.KEY.right) {
            this._acceleration.x = (e == cc.KEY.left ? -1 : 1) * this._moveSpeed;
        }
    },

    handleKeyUp: function(e)
    {
        if (e == cc.KEY.left || e == cc.KEY.right) {
            this._acceleration.x = 0;
        }
    }
});