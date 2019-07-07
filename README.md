# informer

Display notifications in the browser.

## Examples

```js
var notification = new Informer();

// Default appearance.
notification.show('Hi there!');

// Custom position.
notification.show('Hi there!', {
    pos: 'bottom-right',
});
```

Open `test.html` to see all the available configuration options,
including e.g. css properties, setting a delay, listening to events, etc.

## Tests

Run `npm test` and then open `test.html` with your browser.

## Documentation

Run `npm run docs` to generate the documentation in the `docs` directory (autogenerated).

**Note:** You need `jsdoc` to run this command. If that's not the case, run `[sudo] npm i -g jsdoc`.

## Minification

Run `npm run dist` to create the `assert.min.js` file.
This will optimize file requests if you use this lib in a browser.

**Note:** You need `uglifyjs` to run this command. If that's not the case, run `[sudo] npm i -g uglify-js`.

## Code linting

Run `npm run lint` to analyze the source code for potential errors.

**Note:** You need `eslint` to run this command. If that's not the case, run `[sudo] npm i -g eslint`.

## License

This libray is released with the [MIT license](LICENSE).
The only requirement is that you keep my copyright notice intact when you repurpose, redistribute, or reuse this code.