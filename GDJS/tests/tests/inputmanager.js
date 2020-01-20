// @ts-check

/**
 * Tests for gdjs.InputManager and related.
 */

describe('gdjs.InputManager', function() {
  var inputManager = new gdjs.InputManager();

  it('should handle keyboards events', function() {
    expect(inputManager.anyKeyPressed()).to.be(false);

    inputManager.onKeyPressed(32);
    expect(inputManager.getLastPressedKey()).to.be(32);
    inputManager.onKeyPressed(33);
    expect(inputManager.getLastPressedKey()).to.be(33);
    expect(inputManager.isKeyPressed(32)).to.be(true);
    expect(inputManager.isKeyPressed(30)).to.be(false);
    inputManager.onKeyReleased(32);
    expect(inputManager.isKeyPressed(32)).to.be(false);
    expect(inputManager.wasKeyReleased(32)).to.be(true);

    expect(inputManager.anyKeyPressed()).to.be(true);

    inputManager.onFrameEnded();
    expect(inputManager.wasKeyReleased(32)).to.be(false);

    expect(inputManager.anyKeyPressed()).to.be(true);
    expect(inputManager.isKeyPressed(33)).to.be(true);

    inputManager.onFrameEnded();
    inputManager.onKeyReleased(33);
    expect(inputManager.wasKeyReleased(33)).to.be(true);
    expect(inputManager.anyKeyPressed()).to.be(false);
  });

  it('should handle mouse events', function() {
    inputManager.onMouseMove(500, 600);
    expect(inputManager.getMouseX()).to.be(500);
    expect(inputManager.getMouseY()).to.be(600);

    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    inputManager.onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(true);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    inputManager.onFrameEnded();

    inputManager.onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(true);
    inputManager.onFrameEnded();

    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
  });

  it('should handle touch events', function() {
    inputManager.onTouchStart(46, 510, 610);
    inputManager.onTouchStart(10, 510, 610);
    expect(inputManager.getStartedTouchIdentifiers()).to.have.length(2);
    expect(inputManager.getTouchX(46)).to.be(510);
    expect(inputManager.getTouchY(46)).to.be(610);

    expect(inputManager.popStartedTouch()).to.be(46);
    expect(inputManager.popStartedTouch()).to.be(10);
    expect(inputManager.popEndedTouch()).to.be(undefined);

    inputManager.onFrameEnded();
    inputManager.onTouchEnd(10);
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(2);
    expect(inputManager.getStartedTouchIdentifiers()).to.have.length(0);
    expect(inputManager.popStartedTouch()).to.be(undefined);
    expect(inputManager.popEndedTouch()).to.be(10);
    expect(inputManager.getTouchX(10)).to.be(510);
    expect(inputManager.getTouchY(10)).to.be(610);

    inputManager.onFrameEnded();
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(1);
  });
  it('should simulate (or not) mouse events', function() {
    inputManager.touchSimulateMouse();
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);
    inputManager.onTouchStart(46, 510, 610);
    expect(inputManager.isMouseButtonPressed(0)).to.be(true);
    expect(inputManager.getMouseX()).to.be(510);
    expect(inputManager.getMouseY()).to.be(610);
    inputManager.onTouchMove(46, 520, 620);
    expect(inputManager.getMouseX()).to.be(520);
    expect(inputManager.getMouseY()).to.be(620);
    inputManager.onTouchEnd(46);
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);

    inputManager.touchSimulateMouse(false);
    inputManager.onTouchStart(46, 510, 610);
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);
    expect(inputManager.getMouseX()).to.be(520);
    expect(inputManager.getMouseY()).to.be(620);
  });
});

describe('gdjs.evtTools.input.cursorOnObject', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });

  var object = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    variables: [],
  });
  object.setPosition(450, 500);
  object.getWidth = function() {
    return 5;
  };
  object.getHeight = function() {
    return 5;
  };

  it('should handle mouse', function() {
    var objectsLists = new Hashtable();
    objectsLists.put('obj1', [object]);
    runtimeGame.getInputManager().onMouseMove(100, 100);
    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(false);
    expect(objectsLists.get('obj1')).to.have.length(0);

    objectsLists.put('obj1', [object]);
    runtimeGame.getInputManager().onMouseMove(450, 500);
    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(true);
    expect(objectsLists.get('obj1')).to.have.length(1);
    expect(objectsLists.get('obj1')[0]).to.be(object);
  });

  it('should handle inversion of the test', function() {
    var objectsLists = new Hashtable();
    objectsLists.put('obj1', [object]);
    runtimeGame.getInputManager().onMouseMove(100, 100);
    expect(
      gdjs.evtTools.input.cursorOnObject(objectsLists, runtimeScene, true, true)
    ).to.be(true);
    expect(objectsLists.get('obj1')).to.have.length(1);
    expect(objectsLists.get('obj1')[0]).to.be(object);

    objectsLists.put('obj1', [object]);
    runtimeGame.getInputManager().onMouseMove(450, 500);
    expect(
      gdjs.evtTools.input.cursorOnObject(objectsLists, runtimeScene, true, true)
    ).to.be(false);
    expect(objectsLists.get('obj1')).to.have.length(0);
  });

  it('should handle touch', function() {
    var objectsLists = new Hashtable();
    objectsLists.put('obj1', [object]);

    runtimeGame.getInputManager().onMouseMove(0, 0);
    runtimeGame.getInputManager().touchSimulateMouse(false);

    runtimeGame.getInputManager().onTouchStart(0, 100, 100);
    objectsLists.put('obj1', [object]);
    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(false);
    expect(objectsLists.get('obj1')).to.have.length(0);
    runtimeGame.getInputManager().onFrameEnded();

    objectsLists.put('obj1', [object]);

    runtimeGame.getInputManager().onTouchStart(1, 450, 500);
    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(true);
    expect(objectsLists.get('obj1')).to.have.length(1);
    expect(objectsLists.get('obj1')[0]).to.be(object);
    runtimeGame.getInputManager().onFrameEnded();

    runtimeGame.getInputManager().onTouchEnd(1);
    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(true);
    expect(objectsLists.get('obj1')).to.have.length(1);
    expect(objectsLists.get('obj1')[0]).to.be(object);
    runtimeGame.getInputManager().onFrameEnded();

    expect(
      gdjs.evtTools.input.cursorOnObject(
        objectsLists,
        runtimeScene,
        true,
        false
      )
    ).to.be(false);
    expect(objectsLists.get('obj1')).to.have.length(0);
  });
});
