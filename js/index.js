// set the dimensions and margins of the graph
const margin = {top: 40, right: 40, bottom: 60, left: 60},
      width = 860 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// set the ranges
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const c = d3.scaleOrdinal(d3.schemeCategory10);
const p = 7;

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("#chart").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


console.log(div);
// Get the data
d3.csv("./data/data.csv", function(error, data) {
  if (error) throw error;

  data.forEach(d => {
    d.penetracion = parseFloat(d.penetracion);
    d.puntos_wifi = parseFloat(d.puntos_wifi);
  })

  // Scale the range of the data
  x.domain([0, d3.max(data, d => d.penetracion )]);
  y.domain([0, d3.max(data, d => d.puntos_wifi )]);

  // Add the scatterplot
  svg.selectAll("dot")
     .data(data)
     .enter().append("circle")
     .attr("r", p)
     .attr("cx", d => x(d.penetracion) )
     .attr("cy", d => y(d.puntos_wifi) )
     .attr("fill", d => c(d.region));

  // Add the X Axis
  svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom().scale(x).ticks(10).tickFormat(d3.format(".0%")));

  // Add the Y Axis
  svg.append("g")
     .call(d3.axisLeft(y));

  // voronoi interactivity
  const voronoiDiagram = d3.voronoi()
                           .x(d => x(d.penetracion))
                           .y(d => y(d.puntos_wifi))
                           .size([width, height])(data);

  // limit how far away the mouse can be from finding a Voronoi site
  const voronoiRadius = width / 10;

  // add a circle for indicating the highlighted point
  svg.append('circle')
     .attr('class', 'highlight-circle')
     .attr('r', p + 4) // slightly larger than our points
     .style('fill', 'none')
     .style('display', 'none');

  // callback to highlight a point
  function highlight(d) {
    // no point to highlight - hide the circle
    if (!d) {
      d3.select('.highlight-circle').style('display', 'none');
      div.transition()
         .duration(200)
         .style("opacity", 0);
      // otherwise, show the highlight circle at the correct position
    } else {

      color = c(d.region);
      console.log(color);
      d3.select('.highlight-circle')
        .style('display', '')
        .style('stroke', color)
        .attr('cx', x(d.penetracion))
        .attr('cy', y(d.puntos_wifi));

      div.transition()
         .duration(100)
         .style("opacity", 0);

      div.transition()
         .duration(100)
         .style("opacity", .9);


      div.html("<b>" + d.dpto.slice(0, 25) + "</b><br/>"
             + "<span style=\"color: " + color + "\">" + d.region + "</span>"
             + "<br/>internet: " + Math.round(d.penetracion * 100 * 100)/100 +
               " wifi: " + Math.round(d.puntos_wifi*100)/100)
         .style("left", x(d.penetracion) + 90 + "px")
         .style("top", y(d.puntos_wifi) +"px");
    }
  }

  // callback for when the mouse moves across the overlay
  function mouseMoveHandler() {
    // get the current mouse position
    const [mx, my] = d3.mouse(this);

    // use the new diagram.find() function to find the Voronoi site
    // closest to the mouse, limited by max distance voronoiRadius
    const site = voronoiDiagram.find(mx, my, voronoiRadius);

    // highlight the point if we found one
    highlight(site && site.data);
  }

  // add the overlay on top of everything to take the mouse events
  svg.append('rect')
     .attr('class', 'overlay')
     .attr('width', width)
     .attr('height', height)
     .style('fill', '#f00')
     .style('opacity', 0)
     .on('mousemove', mouseMoveHandler);
  // hide the highlight circle when the mouse leaves the chart
  highlight(null);

  // now add titles to the axes
  svg.append("text")
     .attr("text-anchor", "middle")
     .attr(
       "transform",
       "translate(" + (-2*margin.left/3) + "," + (height/2) + ")rotate(-90)")
     .text("Número de puntos de wifi gratuito");

  svg.append("text")
     .attr("text-anchor", "middle")
     .attr(
       "transform",
       "translate(" + (width/2) + "," + (height+2*(margin.bottom/3)) + ")")
     .text("Penetración de Internet por suscripción");
});
