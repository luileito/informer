/* eslint-env browser */
(function(window) {

  // Convenient shortcut.
  var document = window.document;

  /**
   * Display notifications in the browser.
   * @class
   * @global
   * @param {String} [id] ID of the wrapper DOM element to be created.
   * Default: "informer-$CURRENT_TIME", e.g. "informer-1511689379519".
   * @param {Object} [options] Notification options.
   * @param {String} options.pos Position: 'top-left', 'top-right', 'bottom-left' (default), or 'bottom-right'.
   * @param {String} options.css.background CSS background definition. Default: "#000".
   * @param {String} options.css.color CSS font color. Default: "#FFF".
   * @param {String} options.css.fontFamily CSS font family. Default: "sans-serif".
   * @param {String} options.css.fontSize CSS font size. Default: "18px".
   * @param {String} options.css.padding CSS padding. Default: "15px".
   * @param {String} options.css.position CSS positioning. Default: "fixed".
   * @param {String} options.css.bottom CSS bottom offset. Default: "10px".
   * @param {String} options.css.left CSS left offset. Default: "10px".
   * @param {String} options.css.zIndex CSS z-index. Default: highest z-index on page.
   * @param {Number} options.delay Delay in ms to hide notification when it is shown. Default: 0 (no hide).
   * @param {Boolean} options.close Display close button. Default: true.
   * @param {Function} options.on.show Callback when notification is shown. Default: noop.
   * @param {Function} options.on.hide Callback when notification is hidden. Default: noop.
   * @param {Function} options.on.reset Callback when configuration is reset. Default: noop.
   * @return {Informer}
   */
  function Informer(id, options) {
    // Save instance pointer for use in closures, timeouts, etc.
    var self = this;

    /**
     * Default configuration.
     * @see Constructor options.
     * @type {Object}
     */
    this.defaults = {
      pos: 'bottom-left',
      css: {
        background: '#000',
        color: '#FFF',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        padding: '15px',
        margin: '10px',
        position: 'fixed',
        zIndex: getNextHighestDepth(),
      },
      delay: 0,
      close: true,
      on: {
        show: function() {},
        hide: function() {},
        reset: function() {},
      }
    };
    /**
     * Current configuration.
     * @type {Object}
     */
    this.options = extend({}, this.defaults, options || {});
    /**
     * DOM element. Informer content is added to this element.
     * @type {HTMLElement}
     */
    this.element = null;

    // Throttle delay.
    var hideTimer;

    // Constructor-alike.
    function init() {
      // Exit early if DOM isn't ready yet.
      if (!document.body) throw new Error('Informer notifications can only be displayed once the DOM is ready.');

      clearTimeout(hideTimer);

      // Flag for adding or updating element to the DOM later.
      var isNew = self.element === null;

      if (isNew) {
        // Create element.
        self.element = document.createElement('div');
        self.element.id = id || 'informer-' +  Date.now();
      }

      // Force DIV content to be left-aligned, since the close button will be displayed at the right.
      var tpl = '<div class="informer-content" style="float:left; display:inline;"></div>';

      if (self.options.close) {
        // Create "elem hide" alias method; see below.
        self.element.close = function() {
          window.event.preventDefault();
          self.hide();
        };
        // Prepend close "button" to current elem template.
        tpl = '<a href="#close" class="informer-close" \
                 style="float:right; display:inline; margin-left:1em; text-decoration:none; color:'+self.options.css.color+'; font-weight:bold;" \
                 onclick="this.parentNode.close()">&times;</a>' + tpl;
      }

      // In any case, update element DOM.
      self.element.innerHTML = tpl;

      if (isNew) document.body.appendChild(self.element);
    };
    /**
     * Change notification configuration.
     * @param {Object} [conf] Custom configuration. See constructor options.
     * * @return {Informer}
     */
    this.config = function(conf) {
      // Update settings.
      self.options = extend({}, self.defaults, conf || {});
      // Create or update element.
      init();
      // Exit early if DOM isn't ready yet.
      if (!self.element) return self;
      // Style element.
      for (var prop in self.options.css) {
        self.element.style[prop] = self.options.css[prop];
      }
      // The positioning property has always two parts.
      // Example: 'bottom-left' will set the CSS properties 'bottom' and 'left'.
      var parts = self.options.pos.split('-');
      self.element.style[parts[0]] = self.options.css.margin;
      self.element.style[parts[1]] = self.options.css.margin;

      return self;
    };
    /**
     * Show notification.
     * @param {String} content HTML content.
     * @param {Object} [conf] Custom configuration. See constructor options.
     * @return {Informer}
     */
    this.show = function(content, conf) {
      // Ensure default settings before applying given options.
      self.reset().config(conf);
      // Exit early if DOM isn't ready yet.
      if (!self.element) return self;
      // Display content.
      self.element.style.display = 'inline-block';
      self.element.querySelector('.informer-content').innerHTML = content;
      // Trigger event, if set.
      if (typeof self.options.on.show === 'function') self.options.on.show();
      // If delay is given, hide content.
      if (self.options.delay > 0) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(self.hide, self.options.delay);
      }

      return self;
    };
    /**
     * Hide notification.
     * * @return {Informer}
     */
    this.hide = function() {
      // Exit early if DOM isn't ready yet.
      if (!self.element) return self;

      self.element.style.display = 'none';
      // Trigger event, if set.
      if (typeof self.options.on.hide === 'function') self.options.on.hide();

      return self;
    };
    /**
     * Reset to default configuration.
     * * @return {Informer}
     */
    this.reset = function() {
      // Exit early if DOM isn't ready yet.
      if (!self.element) return self;

      // Remove positioning properties.
      'top left bottom right'.split(' ').forEach(function(prop) {
        self.element.style[prop] = null;
      });
      // Also remove custom CSS properties.
      Object.keys(self.options.css).forEach(function(prop) {
        self.element.style[prop] = null;
      });
      // Trigger event, if set.
      if (typeof self.options.on.reset === 'function') self.options.on.reset();

      return self;
    };
  };

  /**
   * Retrieve next highest z-index on page.
   * @return {Number}
   * @private
   */
  function getNextHighestDepth() {
    var elems = document.getElementsByTagName('*');
    var index = 0;
    for (var i = 0, l = elems.length; i < l; ++i) {
      var el = elems[i];
      var z = parseFloat(document.defaultView.getComputedStyle(el, null).getPropertyValue('z-index'));
      if (z > index) index = z;
    }
    return index + 1;
  };

  /**
   * A handy method to (deep) extend an object.
   * The input object is modified.
   * @param {Object} myObj Input object.
   * @return {Object}
   * @private
   */
  function extend(myObj) {
    myObj = myObj || {};
    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object') {
            myObj[key] = extend(myObj[key], obj[key]);
          } else {
            myObj[key] = obj[key];
          }
        }
      }
    }
    return myObj;
  };

  // Expose.
  window.Informer = Informer;

})(this);
