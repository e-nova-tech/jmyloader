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
