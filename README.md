# Layer Web eXperience Development Kit

## Browser Support Matrix:

| Browser          | Version    | OS Tested Against  |
|------------------|------------|--------------------|
| Internet Explorer| 11.0       | Windows 8.1        |
| Edge             | 13.0       | Windows 10         |
| Edge             | 14.0       | Windows 10         |
| Safari           | 10.0       | OSX 10.12          |
| Safari           | 9.0        | OSX 10.11          |
| Safari (IOS)     | 9.x        | IOS 10.0           |
| Safari (IOS)     | 10.0       | IOS 9.3            |
| Chrome           | 55         | OSX 11.0           |
| Chrome           | 48         | Linux              |
| Firefox          | 51         | OSX 11.0           |
| Firefox          | 50         | Windows 8          |

Older versions of Safari do not support Websockets and will not work with the Layer WebSDK.

## Introduction

The Layer Web XDK provides a library of widgets to simplify adding chat capabilities into your application.

It is implemented using the [Webcomponents Polyfill](https://github.com/WebComponents/webcomponentsjs); in particular, this project uses the "light" version of the polyfill which means we do not use Shadow Dom.

## Why use the Layer XDK UI Components?

1. It handles a lot of capabilities for you:
    * Sends read receipts on any message that has scrolled into view, and remained visible for 2.5s
    * Sends typing indicators to other participants
    * Renders typing indicators from other participants
    * Pages your queries as the user scrolls
    * Handles a variety of common text processing tasks (emoticons for example), and provides plugins for adding more
    * Handles a variety of Message Types and provides plugins for adding more
2. It is highly customizable
    * You may replace a stylesheet for a given widget with your own stylesheet
    * You may replace the HTML Template for a given widget with your own template
    * You may replace an entire widget class with your own definition of that class

## Installation


### CDN

```html
<script src='https://cdn.layer.com/xdk/0.9/layer-xdk.min.js'></script>
<link rel='stylesheet' href='https://cdn.layer.com/xdk/0.9/themes/layer-basic-blue.css' />
<script>
var client = window.layer.init({
  appId: 'layer:///apps/staging/UUID'
});
</script>
```

Alternatively, a separate theme and templates can be loaded using:

### NPM

```console
npm install @layerhq/web-xdk --save
```

```javascript
var Layer = require('layer-xdk');
const client = Layer.init({
  appId: 'layer:///apps/staging/UUID'
});
```

```html
<link rel='stylesheet' href='node_modules/xdk/themes/build/layer-basic-blue.css' />
```

## Build Commands

* `grunt develop`: Starts a webserver for running tests or sample apps, and watches for changes, rebuilding source and theme on any change
* `grunt docs`: Generate API Reference docs into folder `~/docs`
* `grunt theme`: Generate CSS files from the `.less` files
* `grunt debug`: Generate all lib folders and basic build files.
* `grunt build`: Run's `grunt debug` and `grunt theme` and then generates all minified files
* `grunt coverage`: Generate a coverage test build; additional steps shown below for running a coverage test

## Running Sample

1. `grunt develop` will start a local webserver
1. `open samples/cards.html` will start a simple sample app; you may need to customize identity providers.  This simple example does not yet have UIs for creating new conversations; from the console you can `client.createConversation({participants: ["user_a"]}).send()`

## Coverage Tests

To run coverage tests:

1. `grunt coverage` will write `test/coverage-build.js` with an instrumented version of the build file
1. Run tests on `http://localhost:8004/test/CoverageRunner.html`
1. Open the javascript console and modify the test results with:
```
coverageResults = {};
Object.keys(__coverage__).forEach(key => {
    // Simplify reporting paths by taking 'lib' out of the path
    var newKey = key;

    // Many components have a path of components/component_name/component_name.js;
    // simplify reporting of paths to components/component_name.js
    newKey = newKey.replace(/components\/.*\//, "components/");
    var parts = newKey.split(/\//);
    if (parts[parts.length-2] + '.js' == parts[parts.length-1]) {
        parts.splice(parts.length-2, 1);
        newKey = parts.join('/');
    } else if (newKey.match(/\/ui\/cards\/[^/]+\/[^/]+\.js$/)) {
      newKey = newKey.replace(/(\/ui\/cards\/)([^/]+\/)([^/]+\.js)$/, "$1$3");
      console.log("newKey: " + newKey);
    }
    coverageResults[newKey] = __coverage__[key];
})
```
1. Copy the results with `copy(JSON.stringify(coverageResults))`
1. Paste the results into `coverage/coverage.json`
1. Run the report generation tool with `istanbul report --root coverage --dir coverage/report html`
1. Open the report with `open coverage/report/index.html`


## Future Work

* This project does not use Shadow Dom due to performance implications of the Shadow Dom polyfill.  The Shadow Dom API provides an ideal
mechanism for passing subcomponents such as buttons for the composer, and other custom elements as inputs.  Currently, this can only be done
via dom manipulation; even in the case of `ConversationPanel.composeButtons` one must dom create elements,
put them in an array and then set `composeButtons` to refer to them.  This is especially bad in React.  A better mechanism should be discussed,
and implemented.
* Inclusion of standard dom nodes that go between messages, such as Date headers, Headers indicating "read up to here", etc...  For now we just include the capability to build your own.

## Development Notes

JSDuck is used to document this system.  Properties and Methods are flagged as public/protected/private according to rules somewhat different from standard:

* Public: Part of the public API; Public methods whose names follow the form `onXXX` are not for calling publicly, but rather for customizing with mixins.  They are public in the sense that they have been explicitly exposed for customization.
* Protected: Any method that is not part of the Public API developers building apps would use, but which developers building custom Message Types would use are defined to be `@protected`.  These will not always strictly follow rules for what it means to be Protected in Object Oriented terminology
* Private: Any method that is neither intended as a public API, nor for developers building Custom Messages are treated as Private. They may in fact be accessed by other components, and are only Private in the sense that they are for internal framework use only.
