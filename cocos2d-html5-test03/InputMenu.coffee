class window.InputMenu

  gameController: null

  onDidLoadFromCCB: ->
    cc.log "Input Menu loaded"
    @init()

  init: ->
    cc.log @
    @rootNode.setPosition @rootNode.getAnchorPointInPoints()

  onKeyboardSelect: ->
    b = @gameController.keyboardEnabled
    @gameController.keyboardEnabled = !b
    @selectInputHandler  b, @keyboardMenuItem

  onMouseSelect: ->
    b = @gameController.mouseEnabled
    @gameController.mouseEnabled = !b
    @selectInputHandler  b, @mouseMenuItem

  onTouchSelect: ->
    b = @gameController.touchEnabled
    @gameController.touchEnabled = !b
    @selectInputHandler  b, @touchMenuItem

  onAccelerometerSelect: ->
    b = @gameController.accelerometerEnabled
    @gameController.accelerometerEnabled = !b
    @selectInputHandler  b, @accelerometerMenuItem

  selectInputHandler: (flag, item) ->
    if flag then item.unselected() else item.selected()
    @gameController.enableInputHandlers()