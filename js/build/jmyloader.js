/**
 * Donut chart generator.
 * @param el, where to draw the chart
 * @param options, options
 */
var donut =  function(el, options) {
  /**
   * Default parameters.
   * @type {{width: number, height: number, text_y: string, textSize: string, duration: number, transition: number, thickness: number}}
   */
  this.defaults = {
    /**
     * Width of the chart.
     */
    width: 70,
    /**
     * Height of the chart.
     */
    height: 70,
    /**
     * Text margins.
     */
    text_y: ".35em",
    /**
     * Text size.
     */
    textSize: "20px",
    /**
     * Duration of start animation.
     */
    duration: 500,
    /**
     * Duration of transition effect.
     */
    transition: 200,
    /**
     * Thickness of tge doughnut.
     */
    thickness: 10
  };
  // Extend config with given options.
  this.config = $.extend(true, this.defaults, options);
  // Init variables.
  // Arc.
  this.arc = null;
  // Foreground and background colors.
  this.foreground = null;
  this.background = null;
  // SVG element.
  this.svg = null;
  // Text.
  this.text = null;
  // radiants.
  this.τ = 2 * Math.PI;
  // jquery element.
  this.$el = el;

  var self = this;

  // Init variables.
  var width = this.config.width,
    height = this.config.height,
    text_y = this.config.text_y,
    textSize = this.config.textSize,
    self = this,
    radius = Math.min(width, height) / 2;

  // Arc creation.
  this.arc = d3.svg.arc()
    .innerRadius(radius - this.config.thickness)
    .outerRadius(radius)
    .startAngle(0);
  // SVG.
  this.svg = d3.select(this.$el[0]).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Add the background arc, from 0 to 100% (τ).
  this.background = this.svg.append("path")
    .datum({endAngle: this.τ})
    .attr("class", "background")
    .attr("d", this.arc);

  // Add the foreground arc in orange, currently showing 12.7%.
  this.foreground = this.svg.append("path")
    .datum({endAngle: .0 * this.τ})
    .attr("class", "foreground")
    .attr("d", this.arc);

  // Add text + margins.
  this.text = self.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", text_y);
  // Size of the text.
  $("text", el).css('font-size', textSize);

  // Init text with value "0".
  this.text.text(0);
};

/**
 * draw chart with a given percent.
 * @param int percent
 *   the percent.
 */
donut.prototype.draw = function(percent) {
  var self = this;
  var timeout = setTimeout(function () {
      clearTimeout(timeout);
      self.foreground.transition()
        .duration(self.config.duration)
        .call(self.arcTween, self.$el, self.arc, (percent / 100) * self.τ);
    },
    200
  );
}

/**
 * Adjust percent inside the chart with a transition effect.
 * @param d3 object transition
 * @param jquery object el
 * @param d3 object arc
 * @param int newAngle
 */
donut.prototype.arcTween = function(transition, el, arc, newAngle) {
  transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      var τ = 2 * Math.PI;
      d.endAngle = interpolate(t);
      $("text", el).text(Math.round(d.endAngle / τ * 100) + "%");
      return arc(d);
    };
  });
}

/**
 * jMyLoader plugin for jQuery.
 * @param o the option name, or an array of options
 * @param v the value if an option name is given.
 * @returns jMyLoader object, an instance of jMyLoader
 */
jQuery.fn.jMyLoader = function(o, v) {
  // Main jMyLoader object that will be returned.
  var JML = null;
  // Init application.
  this.each(function() {
    // Will contain instances of jMyLoader, per element.
    $.jMyLoaderInstances = $.jMyLoaderInstances || Array();

    // jMyLoader main class.
    var jMyLoader = {
      /**
       * the app container.
       */
      app : null,

      settings : {
        /**
         * size of the loader. A value in pixels should be given.
         */
        size : 300,
        /**
         * should the loader be hidden at start. (so we can show it later).
         */
        hideAtStart : false,
        /**
         * class to be added to the container at the initialization.
         */
        initClass : 'has-jmyloader',
        /**
         * main class to be added to the jmyloader element.
         */
        mainClass : 'jmyloader',
        /**
         * class to be added to the container that will contain jmyloader.
         */
        containerClass : 'jmyloader-container',
        /**
         * class to be added to the wrapper.
         */
        wrapperClass : 'jmyloader-wrapper',
        /**
         * class to be added when jmyloader is visible.
         */
        visibleClass : 'visible',
        /**
         * theme to be applied. This theme should be defined in a css file.
         * Existing themes : 'blue'
         */
        theme : null,
        /**
         * What type of spinner is required.
         * 2 options : 'doughnut' for the animated doughnut chart, or
         * image for any animated or fixed image.
         */
        spinner : 'doughnut',
        /**
         * image to load in case the spinner is an image.
         * this image should be in the css directory of the plugin.
         */
        spinner_image : 'spinner.gif',
        /**
         * What text is to be displayed.
         */
        text : '<strong>Please wait</strong><br>content is loading...',
        /**
         * Mainly for internal use. Don't touch.
         */
        jmlId : 0,
        /**
         * Doughnut settings.
         */
        doughnut : {
          /**
           * width of the doughnut.
           * A value in pixels, or auto to size it automatically.
           */
          width : "auto",
          /**
           * Height of the doughnut.
           * A value in pixels, or auto to size it automatically.
           */
          height : "auto",
          /**
           * Size of the text inside the doughnut (percent).
           */
          textSize : "auto",
          /**
           * Duration of the animation.
           */
          duration : 500,
          /**
           * Duration of the transition.
           * It is the animation of the doughnut from one value to another one.
           */
          transition : 200,
          /**
           * Thickness of the doughnut.
           * A value in pixels, or auto to size it automatically.
           */
          thickness : "auto"
        }
      },
      radius : 0,
      nbItems : 0,
      currentItem : 0,

      /**
       * Initialize the plugin.
       * @param elt
       * @param options
       * @returns {jMyLoader}
       */
      init :  function(elt, options) {
        this.app = elt;
        // Extend settings with options provided.
        this.settings = $.extend({}, this.settings, options);
        // Radius calculation.
        this.radius = Math.round(this.settings.size / 2);

        // If loader is already instanced, we do nothing and return the instance.
        if (this.app.hasClass(this.settings.initClass)) {
          return this;
        }

        // If the container is not a body, we add the container properties.
        if (!this.app.is('body')) {
          this.app.addClass(this.settings.containerClass);
        }
        // Inject HTML of the loader on the container.
        this.app.prepend(this.getLoaderHtml());

        // Dougnut settings management.
        // We manage here all settings set as "auto", which is
        // an extra layer developed for the loader.
        if (this.settings.spinner == 'doughnut') {
          var dn_config = this.settings.doughnut;
          // Width and Height.
          if (dn_config.width == "auto") {
            dn_config.width = dn_config.height = this.settings.size / 4;
          }
          // Thickness.
          if (dn_config.thickness == "auto") {
            dn_config.thickness = this.settings.size / 30;
          }
          // Text size.
          if (dn_config.textSize == "auto") {
            dn_config.textSize = this.settings.size * 0.08 + 'px';
          }
          this.donut = new donut($('.spinner', this.app), dn_config);
        }
        // End Doughnut settings management.

        // Add init class to tell that JMyLoader is initialized for this element.
        this.app.addClass(this.settings.initClass);

        // Set size for wrapper.
        $('.' + this.settings.wrapperClass, this.app)
          .width(this.settings.size)
          .height(this.settings.size);

        // Set size for main element, inside wrapper.
        $('.' + this.settings.mainClass, this.app)
          .width(this.settings.size)
          .height(this.settings.size)
          .css('right', 0 - this.radius)
          .css('top', 0 - this.radius);

        // Manage font size to adapt as per container.
        var coef = this.settings.size / 300;
        $('.' + this.settings.mainClass + ' p', this.app).css('font-size', 100 * coef + '%');

        // Hide at start ?
        if (!this.settings.hideAtStart) {
          this.show();
        }
        return this;
      },

      /**
       * generate and return the HTML of jMyLoader, as per the options given.
       * @returns {string}
       */
      getLoaderHtml : function() {
        var html =
          '<div class="' + this.settings.wrapperClass + (this.settings.theme ? ' ' + this.settings.theme : '') + '">'
          + '<div class="jml ' + this.settings.mainClass + '" id="jml-'+ this.settings.jmlId +'">'
          + '<div class="spinner">'
          + (this.settings.spinner == 'image' ? '<img src="css/' + this.settings.spinner_image + '" width="75">' : '')
          + '</div>'
          + '<p>'
          + this.settings.text
          + '</p>'
          + '</div>'
          + '</div>';
        return html;
      },

      /**
       * says if jMyLoader is visible or not.
       * @returns {boolean}
       */
      isVisible : function() {
        if ($('.' + this.settings.mainClass, this.app).hasClass(this.settings.visibleClass)) {
          return true;
        }
        return false;
      },

      /**
       * show JMyLoader.
       */
      show : function() {
        if(!this.isVisible()) {
          $('.' + this.settings.mainClass, this.app).addClass(this.settings.visibleClass);
          $( '.' + this.settings.mainClass, this.app ).animate({
            top: "+=" + this.radius,
            right: "+=" + this.radius
          }, {duration: 500});
        }
      },

      /**
       * hide JMyLoader.
       */
      hide : function() {
        if(this.isVisible()) {
          $( "." + this.settings.mainClass, this.app).animate({
            top: "-=" + this.radius,
            right: "-=" + this.radius
          }, {duration: 500});
          $('.' + this.settings.mainClass, this.app).removeClass(this.settings.visibleClass);
        }
      },

      /**
       * Tells if jMyLoader exists in the current container.
       * @returns {*}
       */
      loaderExists : function() {
        return this.app.hasClass(this.settings.initClass);
      },

      /**
       * set the current percent to jMyLoader.
       * @param percent
       */
      setPercent : function(percent) {
        var self = this;
        if (this.settings.spinner == 'doughnut') {
          this.donut.draw(percent);
        }
        if (percent > 0 && percent < 100) {
          this.show();
        }
        else if (percent >= 100) {
          if (this.settings.spinner == 'doughnut') {
            // If doughnut, we close only when it reaches 100%.
            // Which means after value is set ti o 100% + animation duration.
            setTimeout(function() {
              self.hide();
            },
            this.settings.doughnut.duration);
          }
          else {
            this.hide();
          }
        }
      },

      /**
       * for Items mode : set the total number of items.
       * @param int n
       */
      setTotalItems : function(n) {
        this.nbItems = n;
      },

      /**
       * increment the number of loaded items.
       * @param int n, whether we want to increment by more than 1.
       */
      incrementLoadedItem : function(n) {
        var increment = n ? n : 1;
        // Increment items.
        this.currentItem += increment;
        this.itemsRefresh();
      },

      /**
       * add Items to the total number.
       * Useful when we have several objects using the same loader.
       * @param int n
       */
      addItems : function(n) {
        this.nbItems += n;
        this.itemsRefresh();
      },

      /**
       * refresh the percent inside the loader as per the number of items loaded.
       */
      itemsRefresh : function() {
        // Calculate percent.
        var percent = 0;
        if (this.nbItems > 0) {
          percent = Math.round(this.currentItem / this.nbItems * 100);
        }
        //console.log(this.currentItem + ' / ' + this.nbItems + " * 100  =" + percent);
        this.setPercent(percent);
      }
    };

    /**
     * Init function of the plugin.
     * @param elt
     * @param options
     * @returns {jMyLoader}
     */
    function init(elt, options) {
      options = options || {};
      options.jmlId = $.jMyLoaderInstances.length;
      //console.log("jmlid", options.jmlId);
      var jml = jMyLoader.init(elt, options);
      $.jMyLoaderInstances.push(jml);
      return jml;
    }

    /**
     * get the JMyLoader element inside the given element.
     * @param elt
     * @returns {*}
     */
    function getJMyLoaderElt(elt) {
      var jml = elt.find('div:first-child > .jml')[0];
      return elt.find(jml);
    }

    /**
     * get the JMyLoader object for the given element.
     * @param elt
     * @returns {*}
     */
    function getJMyLoader(elt) {
      var jml = getJMyLoaderElt(elt);
      if (jml) {
        var jmlId = jml.attr('id').split("-")[1];
        return $.jMyLoaderInstances[jmlId];
      }
      return null;
    }

    // Command management.
    // Check if a command is given, or if we init a new instance.
    if (!$.isPlainObject(o) && typeof(o) != 'undefined') {
      //console.log("execute command");
      // Execute command.
      if ($.jMyLoaderInstances) {
        var cmd = o;
        var cmdOptions = v;
        var jml = getJMyLoader($(this));
        if (!jml.app.hasClass(jml.settings.initClass)) {
          return false;
        }
        switch (cmd) {
          case 'show' :
            jml.show();
            break;
          case 'hide' :
            jml.hide();
            break;
          case 'set-percent' :
            jml.setPercent();
            break;
          case 'set-total-items' :
            jml.setTotalItems(cmdOptions);
            break;
          case 'increment-loaded-item' :
            jml.incrementLoadedItem(cmdOptions);
            break;
          case 'add-items' :
            jml.addItems(cmdOptions);
            break;
          case 'loader-exists' :
            return jml.loaderExists();
            break;
        }
      }
      return;
    }
    // Init app.
    JML = init($(this), o);
    // Return app instance.
    return JML;
  });
  return JML;
}
