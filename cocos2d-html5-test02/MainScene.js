//
// MainScene class
//
var MainScene = function(){};

MainScene.prototype.onDidLoadFromCCB = function()
{
    cc.log("File was loaded");
    new MainSceneController(this);
};
