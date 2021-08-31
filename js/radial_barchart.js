var windowWidth = window.innerWidth
var windowHeight = window.innerHeight

// Use JS and CSS to position pie chart div in the middle of the page
// document.getElementById('pie-chart').setAttribute("margin-left", (windowWidth / 2));
// document.getElementById('pie-chart').setAttribute("margin-top", windowHeight / 2);

// set the dimensions and margins of the graph
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = windowWidth - margin.left - margin.right,
    height = windowHeight - margin.top - margin.bottom,
    innerRadius = windowHeight / 6,
    outerRadius = Math.min(width, height) / 2 - 50;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object to the body of the page
var svg = d3.select("#radial-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + ( height/2 )+ ")"); // Add 100 on Y translation, cause upper bars are longer

// set the dimensions and margins of the pie chart
var pie_width = windowHeight / 4
    pie_height = windowHeight / 4
    pie_margin = 0

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(pie_width, pie_height) / 2 - pie_margin

// append svg for the pie chart to the div
var pie_svg = d3.select("#radial-chart")
  .append("svg")
    .attr("width", pie_width)
    .attr("height",  pie_height)
    .attr('transform', `translate(${windowWidth/2 - radius}, ${-windowHeight/2 - radius - 4})`)
    .attr('class', 'pie-chart')
    //.style("opacity", 0)
  .append("g")
    .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")")

Promise.all([
    d3.csv("https://raw.githubusercontent.com/kelsey-n/revelio-assignment/main/data/returnRate_medianTimespent_filtered2.csv", d3.autoType),
    d3.csv("https://raw.githubusercontent.com/kelsey-n/revelio-assignment/main/data/destinationsByHomeCountry_Summary2.csv", d3.autoType)
  ]).then(function(data) {

    var barData = data[0]
    var pieData = data[1]

    // console.log(Object.keys(pieData[0]).slice(1))
    // console.log(Object.values(pieData[0]).slice(1))
    // console.log(Object.entries(pieData[0]).slice(1))
    // console.log(test)

    //drawPieChart(test)

    // X scale
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)                  // This does nothing ?
        .domain( barData.map(function(d) { return d.home_country; }) ); // The domain of the X axis is the list of countries.

    // Y scale
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([d3.min(barData.map(d => d.return_rate)), d3.max(barData.map(d => d.return_rate))]); // Domain of Y is from the min to the max seen in the data

    // Color scale to color bars according to median time spent abroad
    var barColor = d3.scaleLinear()
        .domain([d3.min(barData.map(d => d.median_timespent_abroad)), d3.max(barData.map(d => d.median_timespent_abroad))])
        .range(['#BEBEBE', '#303030']);

    // Add bars
    bars = svg.append("g")
      .selectAll("path")
      .data(barData)
      .enter()
      .append("path")
        .attr("fill", function(d) { return barColor(d.median_timespent_abroad); })
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d.return_rate); })
            .startAngle(function(d) { return x(d.home_country); })
            .endAngle(function(d) { return x(d.home_country) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    // Define the div for the tooltip to show when hovering over bars, and hide it with opacity 0
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    bars.on("mouseenter", function(event, d) { //do 2 things on bar mouseover: 1- draw pie chart; 2- show tooltip
        d3.select(this).transition()
             .duration('10')
             .attr('opacity', '0.85')
        var pieData_homeCountry = pieData.filter(row => row.home_country == d.home_country)
        var pieData_toplot = Object.entries(pieData_homeCountry[0])
          .filter(row => row[1] > 0)
        drawPieChart(pieData_toplot)
        pie_svg.style('opacity', 1)
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
      });

    bars.on("mousemove", function(event, d) {
      pie_svg.style('opacity', 1)
      tooltip.html(d.home_country + "<br/>"  + d.return_rate + "% return rate"  + "<br/>"  + d.median_timespent_abroad + " median years abroad")
          //.style("left", (event.pageX + 15) + "px")
          //.style("top", (event.pageY + 15) + "px");
          .style("left", (event.pageX - 155) + "px")
          .style("top", (event.pageY -55) + "px");
    })

    bars.on("mouseleave", function(event, d) {
        d3.select(this).transition()
                 .duration('10')
                 .attr('opacity', '1');
        //drawPieChart([["",0],["",0],["",0],["",0],["",0],["",0]])
        pie_svg.selectAll("*").remove(); // clear the pie chart on mouseout
        //pie_svg.style('opacity', '0')
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

      });


    // Add radial y axis with values of return rate
    var yAxis = svg.append("g")
        .attr("text-anchor", "middle");

    var yTick = yAxis
      .selectAll("g")
      .data(y.ticks(5).slice(1))
      .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("r", y);

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "0.35em")
        .attr("fill", "none")
        .attr("stroke", "#ffffffdd")
        .attr("stroke-width", 5)
        .text(y.tickFormat(5, "s"));

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "0.35em")
        .text(y.tickFormat(5, "s"));

    yAxis.append("text")
        .attr("y", function(d) { return -y(y.ticks(5).pop()); })
        .attr("dy", "-1em")
        .text("Return Rate");

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

    // Add legend for bar colors using d3-legend library
    svg.append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(20,20)");

    var legendLinear = d3.legendColor()
      .shapeWidth(30)
      .orient('horizontal')
      .title('Median Years Spent Abroad')
      .scale(barColor);

    svg.select(".legendLinear")
      .attr("transform", `translate(${windowWidth/4}, ${-windowHeight/2.3})`)
      .call(legendLinear);

    // Add title
    svg
      .append("text")
      .attr("class", "title")
      .attr("transform", `translate(${-windowWidth/3}, ${-windowHeight/2.2})`)
      .text("Working ~Away~ From Home")
    // fit title into a third of the window width by calling the wrap function defined below (taken from Mike Bostock)
    svg.select(".title")
      .call(wrap, windowWidth/3);

    svg
      .append("text")
      .attr("class", "instructions-center")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      //.attr("x", windowWidth/2 - radius*2)
      //.attr("transform", `translate(0, ${-radius/4})`)
      .text("Destinations will appear here!")
    // fit instructions into the circle of the pie chart
    svg.select(".instructions-center")
      .call(wrap, radius);

    svg
      .append("text")
      .attr("class", "instructions")
      .style("font-size", "12px")
      .attr("text-anchor", "end")
      .attr("transform", `translate(${-outerRadius}, ${-windowHeight/3})`)
      .text("Hover over a bar to see destination countries by that home country")
    // wrap text
    svg.select(".instructions")
      .call(wrap, innerRadius);

    var lineBreak = 20

    svg
      .append("text")
      .attr("class", "takeaways")
      .style("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-windowWidth/3}, 0)`)
      .text("Takeaways")
    svg
      .append("text")
      .attr("class", "takeaways")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-windowWidth/3}, ${lineBreak})`)
      .text("Insert Takeaway 1 here.................. ........................................................ .........................................................")
    svg
      .append("text")
      .attr("class", "takeaways")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-windowWidth/3}, ${lineBreak*3})`)
      .text("Insert Takeaway 2 here.................. ........................................................ .........................................................")
    svg
      .append("text")
      .attr("class", "takeaways")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-windowWidth/3}, ${lineBreak*5})`)
      .text("Insert Takeaway 3 here.................. ........................................................ .........................................................")
    // wrap text
    svg.selectAll(".takeaways")
      .call(wrap, windowWidth/2 - outerRadius);

    svg
      .append("text")
      .attr("class", "notes")
      .style("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${windowWidth/3}, ${windowHeight/4})`)
      .text("Notes on the Data")
    svg
      .append("text")
      .attr("class", "notes")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${windowWidth/3}, ${windowHeight/4 + lineBreak})`)
      .text("Insert Note 1 here.................. ........................................................ .........................................................")
    svg
      .append("text")
      .attr("class", "notes")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${windowWidth/3}, ${windowHeight/4 + lineBreak*3})`)
      .text("Insert Note 2 here.................. ........................................................ .........................................................")
    svg
      .append("text")
      .attr("class", "notes")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${windowWidth/3}, ${windowHeight/4 + lineBreak*5})`)
      .text("Insert Note 3 here.................. ........................................................ .........................................................")
    // wrap text
    svg.selectAll(".notes")
      .call(wrap, windowWidth/2 - outerRadius);

    svg.append("path")
    .attr("id", "highest") //Unique id of the path
    .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(windowHeight/2)
        .startAngle(0)
        .endAngle(Math.PI))
    .style("fill", "none")
    //Create an SVG text element and append a textPath element
    svg.append("text")
     .append("textPath") //append a textPath to the text element
      .attr("xlink:href", "#highest") //place the ID of the path here
      .style("text-anchor","middle") //place the text halfway on the arc
      .attr("startOffset", "30%")
      .text("Highest");

    svg.append("path")
    .attr("id", "lowest") //Unique id of the path
    .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(2*Math.PI))
    .style("fill", "none")
    //Create an SVG text element and append a textPath element
    svg.append("text")
     .append("textPath") //append a textPath to the text element
      .attr("xlink:href", "#lowest") //place the ID of the path here
      .style("text-anchor","middle") //place the text halfway on the arc
      .attr("startOffset", "75%")
      .text("Lowest");

});



// Function to draw the pie chart based on the home_country bar that the user is hovering over
function drawPieChart(pieData_homeCountry) {

  // set the color scale
  var color = d3.scaleOrdinal()
    .domain(pieData_homeCountry.map(d => d[0]))
    .range(d3.schemeSet2); //["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]

    //console.log(pieData_homeCountry.map(d => d[0]))

  // Compute the position of each group on the pie:
  var pie = d3.pie()
    .value(function(d) {return d[1]; })
  var data_ready = pie(pieData_homeCountry)

  // shape helper to build arcs:
  var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  var labelArc = d3.arc()
    .outerRadius(radius)
    .innerRadius(5);

//console.log(data_ready)
  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  pie_svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
      .attr('d', arcGenerator)
      .attr('fill', function(d){ return(color(d.data[0])) })
      .attr("stroke", "black")
      .style("stroke-width", "0px")

  // Label the pie chart, adapting the rotating labels from the radial bars
  pie_svg.append("g")
      .selectAll("mySlices")
      .data(data_ready)
      .enter()
      .append("text")
        .text(function(d){ return d.data[0]})
        .attr("transform", function(d) {
          var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
          var extraRotation = d.endAngle-d.startAngle > Math.PI ? "rotate(180)" : "rotate(0)"
          return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")" + extraRotation; })
        .style("font-size", "11px")
        //.attr("text-anchor", function(d) { return (labelArc(d) + (d.endAngle-d.startAngle)/2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("text-anchor", "middle")

}

// Mike Bostock's text wrap function from https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // ems
        //x = text.attr("x"), //removing for equal spacing between lines
        y = text.attr("y"),
        dy = 0 //parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", 0).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
