var windowWidth = window.innerWidth
var windowHeight = window.innerHeight

// set the dimensions and margins of the graph
var margin = {top: 100, right: 0, bottom: 50, left: 0},
    width = windowWidth - margin.left - margin.right,
    height = windowHeight - margin.top - margin.bottom,
    innerRadius = windowHeight / 8,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object to the body of the page
var svg = d3.select("#radial-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + ( height/2+100 )+ ")"); // Add 100 on Y translation, cause upper bars are longer

Promise.all([
    d3.csv("https://raw.githubusercontent.com/kelsey-n/revelio-assignment/main/data/returnRate_medianTimespent_filtered.csv", d3.autoType),
  ]).then(function(data) {

    var barData = data[0]

    // X scale
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing ?
        .domain( barData.map(function(d) { return d.home_country; }) ); // The domain of the X axis is the list of countries.

    // Y scale
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([d3.min(barData.map(d => d.return_rate)), d3.max(barData.map(d => d.return_rate))]); // Domain of Y is from the min to the max seen in the data

    // Color scale to color bars according to median time spent abroad
    var barColor = d3.scaleLinear()
        .domain([d3.min(barData.map(d => d.median_timespent_abroad)), d3.max(barData.map(d => d.median_timespent_abroad))])
        .range(['#F5F5F5', '#808080']);

    // Add bars
    svg.append("g")
      .selectAll("path")
      .data(barData)
      .enter()
      .append("path")
        .attr("fill", function(d) { return barColor(d.median_timespent_abroad); })
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d.return_rate); })
            .startAngle(function(d) { return x(d.home_country); })
            .endAngle(function(d) { return x(d.home_country) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    // Add the labels
    svg.append("g")
        .selectAll("g")
        .data(barData)
        .enter()
        .append("g")
          .attr("text-anchor", function(d) { return (x(d.home_country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
          .attr("transform", function(d) { return "rotate(" + ((x(d.home_country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.return_rate)+10) + ",0)"; })
        .append("text")
          .text(function(d){return(d.home_country)})
          .attr("transform", function(d) { return (x(d.home_country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
          .style("font-size", "11px")
          .attr("alignment-baseline", "middle")

});






// var svg = d3.select("#radial-chart"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height"),
//     innerRadius = 50,
//     outerRadius = Math.min(width, height) / 2.1
//     g = svg.append("g").attr("transform", "translate(" + width / 2.7 + "," + height / 2 + ")")
//
// // var legendsvg = d3.select("#chart4"),
// //     legendwidth = +legendsvg.attr("width"),
// //     legendheight = +legendsvg.attr("height"),
// //     legendg = legendsvg.append("g").attr("transform", "translate(" + legendwidth / 3 + "," + legendheight / 2 + ")")
//
// var x = d3.scaleBand()
//     .range([0, 2 * Math.PI])
//     .align(0);
//
// var y = d3.scaleRadial()
//     .range([innerRadius, outerRadius]);
//
// d3.csv("https://raw.githubusercontent.com/kelsey-n/spotify-data-challenge/main/data/topsongs2010s.csv", function(d, i, columns) {
//   for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
//   d.total = t;
//   return d;
// }).then(function(data) {
//
//   var radial_colors = [];
//   for (let column of data.columns.slice(1)) {radial_colors.push(colors[column])}
//   var z = d3.scaleOrdinal()
//       .range(radial_colors);
//
//   x.domain(data.map(function(d) { return d.name; }));
//   y.domain([0, d3.max(data, function(d) { return d.total; })]);
//   z.domain(data.columns.slice(1));
//
//   g.append("g")
//     .selectAll("g")
//     .data(d3.stack().keys(data.columns.slice(1))(data))
//     .enter().append("g")
//       .attr("fill", function(d) { return z(d.key); })
//     .selectAll("path")
//     .data(function(d) { return d; })
//     .enter().append("path")
//       .attr("d", d3.arc()
//           .innerRadius(function(d) { return y(d[0]); })
//           .outerRadius(function(d) { return y(d[1]); })
//           .startAngle(function(d) { return x(d.data.name); })
//           .endAngle(function(d) { return x(d.data.name) + x.bandwidth(); })
//           .padAngle(0.01)
//           .padRadius(innerRadius))
//
//   var yAxis = g.append("g")
//       .attr("text-anchor", "middle");
//
//   var yTick = yAxis
//     .selectAll("g")
//     .data(y.ticks(5).slice(1))
//     .enter().append("g");
//
//   yTick.append("circle")
//       .attr("fill", "none")
//       .attr("stroke", "#ffffffdd")
//       .attr("r", y);
//
//   yTick.append("text")
//       .attr("y", function(d) { return -y(d); })
//       .attr("dy", "0.35em")
//       .attr("fill", "none")
//       .attr("stroke", "#ffffffdd")
//       .attr("stroke-width", 5)
//       .text(y.tickFormat(5, "s"));
//
//   yTick.append("text")
//       .attr("y", function(d) { return -y(d); })
//       .attr("dy", "0.35em")
//       .text(y.tickFormat(5, "s"));
//
//   // yAxis.append("text")
//   //     .attr("y", function(d) { return -y(y.ticks(5).pop()); })
//   //     .attr("dy", "-1em")
//   //     .text("Song Value");
//
//   var label = g.append("g")
//     .selectAll("g")
//     .data(data)
//     .enter().append("g")
//       .attr("text-anchor", function(d) { return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
//       .attr("transform", function(d) { return "rotate(" + ((x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });
//
//   label.append("text")
//       .attr("transform", function(d) { return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
//       .text(function(d) { return d.name; })
//       .attr("alignment-baseline", "middle")
//
//   var legend = g.append("g")
//     .selectAll("g")
//     .data(data.columns.slice(1))
//     .enter().append("g")
//       .attr("transform", function(d, i) { return "translate(" + width/2.5 +"," + (i - (data.columns.length -1) / 2) * 27 + ")"; });
//
//   legend.append("rect")
//       .attr("width", 18)
//       .attr("height", 18)
//       .attr("fill", z);
//
//   legend.append("text")
//       .attr("x", 25)
//       .attr("y", 9)
//       .attr("dy", "0.35em")
//       .attr("fill", "#ffffffdd")
//       .text(function(d) { return d; });
//
//
//       // Features of the annotation
//     const annotations = [
//       {
//         note: {
//           label: `Top 10 of the 2010s`,
//           title: "",
//           wrap: 80,
//           padding: -15,
//         },
//         color: ["#ffffffdd"],
//         x: width/2.7 - 37,
//         y: height/2,
//         dy: 0,
//         dx: 0
//       },
//     ]
//
//     // Add annotation to the chart
//     const makeAnnotations = d3.annotation()
//       .annotations(annotations)
//     d3.select("#radial-chart")
//       .append("g")
//       .call(makeAnnotations)
// });
