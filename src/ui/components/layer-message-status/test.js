describe('layer-message-status', function() {
  var el, testRoot, client, conversation, message;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    client = new layer.Core.Client({
      appId: 'Fred'
    });
    client.user = new layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-status');
    testRoot.appendChild(el);
    el.enabled = true;

    conversation = client.createConversation({
      participants: ['layer:///identities/a', 'layer:///identities/b']
    });
    message = conversation.createMessage('Hey ho');
    layer.Util.defer.flush();
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
    layer.Core.Client.removeListenerForNewClient();
  });

  it('Should call rerender on any message change events', function() {
    spyOn(el, "onRerender");
    el.item = message;
    el.onRerender.calls.reset();

    message.trigger('messages:change', {});
    expect(el.onRerender).toHaveBeenCalledWith(jasmine.any(layer.Core.LayerEvent));
  });

  it('Should not call rerender on any message change events once its no longer the right message', function() {
    spyOn(el, "onRerender");
    el.item = message;
    el.item = null;
    el.onRerender.calls.reset();

    message.trigger('messages:change', {});
    expect(el.onRerender).not.toHaveBeenCalled();
  });

  it('Should show pending', function() {
    message.syncState = layer.Constants.SYNC_STATE.SAVING;
    el.item = message;
    expect(el.innerHTML).toEqual('pending');
  });

  it('Should show sent', function() {
    message.syncState = layer.Constants.SYNC_STATE.SYNCED;
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.NONE;
    el.item = message;
    expect(el.innerHTML).toEqual('sent');
  });

  it('Should show delivered', function() {
    message.syncState = layer.Constants.SYNC_STATE.SYNCED;
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.NONE;
    el.item = message;
    expect(el.innerHTML).toEqual('delivered');
  });

  it('Should show read by some', function() {
    message.syncState = layer.Constants.SYNC_STATE.SYNCED;
    message.recipientStatus['a'] = 'read';
    message.recipientStatus['b'] = 'read';
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.SOME;
    el.item = message;
    expect(el.innerHTML).toEqual('read by 2 participants');
  });

  it('Should show read', function() {
    message.syncState = layer.Constants.SYNC_STATE.SYNCED;
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.ALL;
    el.item = message;
    expect(el.innerHTML).toEqual('read');
  });

  it("Should use messageStatusRenderer if provided", function() {
    var f = function() {return "who cares?"};
    el.messageStatusRenderer = f;
    el.item = message;
    expect(el.innerHTML).toEqual("who cares?");
  });
});