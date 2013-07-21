var CCBMainScene = cc.Scene.extend({
    ctor:function () {
        this._super();

        var node = cc.BuilderReader.load("GameScene.ccbi");

        this.addChild(node);
        this.setPosition(cc.p(0, 0));
    }
});
