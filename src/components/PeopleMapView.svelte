
<style>

.tooltip {
  position: absolute;
  font-size: 18px;
  pointer-events: none;
  background: lightsteelblue;       
  border-radius: 8px;
  width: 400px;                    
  height: auto;                   
  padding: 2px; 
  white-space: pre-line;
}



</style>

<!-- Initialize SelectButton-->
<select id="keywordsSelect"></select>

<!-- Initialize clustersSelect-->
<select id="clustersSelect"></select>

<!-- Create a div where the graph will take place -->
<div id="PeopleMap" style = "border: 1px solid grey; width: 100%; height: 100%"></div>

<script>
import data from './datapoints.js'
import rankData from './rankData.js'
import { onMount } from 'svelte';

onMount(renderGraph);
// set the dimensions and margins of the graph
function renderGraph() {
  
  // Choose whether or not it will use the ranking coloring
  var rankOption = 0

  var chartDiv = document.getElementById("PeopleMap");
  var width = chartDiv.clientWidth;
  var height = chartDiv.clientHeight;
  console.log(width)
  console.log(height)


  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 100, bottom: 30, left: 30},
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom;



  // append the svg object to the body of the page
  var svg = d3.select("#PeopleMap")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Initialize a tooltip for hovering over dots in the graph
  var tooltip = d3.select("#PeopleMap").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);



      for(var i = 0; i < rankData.length; i++) {
        data[i].rank = rankData[i].rank
      }


      // List of keyword groups (here I have one group per column)
      var keywordsGroup = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

      // add the options to the button
      d3.select("#keywordsSelect")
        .selectAll('myOptions')
        .data(keywordsGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button


      var clustersGroup = [1, 2, 3, 4, 5, 6]

      // add the options to the button
      d3.select("#clustersSelect")
        .selectAll('myOptions')
        .data(clustersGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button


      // Set domain of the xAxis
      var x = d3.scaleLinear().range([0, width]);

      x.domain([d3.min(data, function(d) {

        var min = d.x0
        for (i = 0; i <= 15; i++) {
          if (d["x" + i] < min) {
            min = d["x" + i]
          }
        }
        return min

      }), d3.max(data, function(d) { 
        
          var max = d.x0
          for (i = 0; i <= 15; i++) {
            if (d["x" + i] > max) {
              max = d["x" + i]
            }
          }
          return max

      })]); 

      // Append xAxis
      var xAxis = svg.append("g")
                     .attr("transform", "translate(0," + height + ")")
                     .call(d3.axisBottom(x).tickFormat(""));



      // Set domain of yAxis
      var y = d3.scaleLinear().range([height, 0]);

      y.domain([d3.min(data, function(d) {

          var min = d.y0
          for (i = 0; i <= 15; i++) {
            if (d["y" + i] < min) {
              min = d["y" + i]
            }
          }
          return min

      }), d3.max(data, function(d) { 
        
        var max = d.y0
          for (i = 0; i <= 15; i++) {
            if (d["y" + i] > max) {
              max = d["y" + i]
            }
          }
        return max

      })]); 

      // Append yAxis
      var yAxis = svg.append("g")
                     .call(d3.axisLeft(y).tickFormat(""));





      // Blue, Orange, Red, Green, Brown, Yellow, Gray, Black, Pink
      var colors = ["#0000CD","#FFA500", "#FF0000","#006400","#8B4513","#FFFF00","#A9A9A9","#000000","#FF1493"]


      // 7 shade gradient of blue, starting with most dark and growing lighter after that
      var blueGradient = ["#084594","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef","#eff3ff"]

      // 7 shade gradient of green, starting with most dark and growing lighter after that
      var greenGradient = ['#005a32', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0', '#edf8e9']
     

      // Filter out data with the selection
      var dataFilter = data.map(function(d) {
        return {XCoordinate: d["x0"], YCoordinate: d["y0"], Author: d.Author, Group: d.group, Rank: d.rank,
                Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL} 
      })


      // Initialize dots with Zero Keywords and Five Clusters
      var dot = svg
        .selectAll('circle')
        .data(dataFilter)
        .enter()
        .append('circle')
          .attr("cx", function(d) {
            return x(d.XCoordinate) 
          })
          .attr("cy", function(d) { 
            return y(d.YCoordinate) 
          })
          .attr("r", 7)
          .style("fill", function(d) {
            if (rankOption == 1) {
              if (d.Rank == -1) {
                return blueGradient[6]
              } else {
                return blueGradient[d.Rank]
              }
            } else {
              return colors[d.Group]
            }
          })
          .style("stroke", "black")
          .on("mouseover", function(dataPoint) {
                  tooltip.transition()       
                      .style("opacity", 1.0);
                  var tester = "Researcher: " + dataPoint.Author + "\n" + "\n" + "Affiliation: " + dataPoint.Affiliation
                                + "\n" + "\n" + "Google Scholar Keywords: " + dataPoint.KeyWords + "\n" + "\n" + 
                                "Citations: " + dataPoint.Citations + "\n" + "\n" + "URL: " + dataPoint.URL
                  tooltip .html(tester)  
                      .style("top", (height / 3 - 200) + "px")  
                      .style("left", (width + 135) + "px");     
                  })
        .on("mouseout", function(dataPoint) {       
                  tooltip.transition()
                            .style("opacity", 0);   
              });


      // A function that update the chart
      function updateKeywords(json, selectedGroup) {


            // Filter out data with the selection
            var dataFilter = data.map(function(d) {
              return {xCoordinate: d["x" + selectedGroup], yCoordinate:d["y" + selectedGroup], Author: d.Author,
                      Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL} 
            })


            dot
              .data(dataFilter)
              .transition()
              .duration(1000)
                .attr("cx", function(d) {
                  return x(+d.xCoordinate) 
                })
                .attr("cy", function(d) { 
                  return y(+d.yCoordinate) 
                })
              



      }

      // A function that update the chart with a new cluster coloring
      function updateClusters(json, selectedGroup) {

       
            // Filter out data with the selection
            var dataFilter = data.map(function(d) {
              return { Grouping: d["grouping" + selectedGroup], Author: d.Author, Affiliation: d.Affiliation, 
                       KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL } 
            })


            dot
              .data(dataFilter)
              .transition()
              .duration(1000)
                .style("fill", function(d) {
                  return colors[d.Grouping]
                })
              



      }



    // When the button is changed, run the updateKeywords function and update the graph
    d3.select("#keywordsSelect").on("change", function(d) {
        
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        
        // run the updateChart function with this selected option
        updateKeywords("keywordsClustersTester.json", selectedOption)

    })



    // When the button is changed, run the updateChart function
    d3.select("#clustersSelect").on("change", function(d) {
        
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        
        // run the updateChart function with this selected option
        updateClusters("keywordsClustersTester.json", selectedOption)

    })

}

</script>
<ul class="text is-size-7" style="padding-left: 20px;">
    <li> - Each dot represents a researcher and their associated top 20 most cited publications.
    </li>
    <li> - Proximity between researchers indicates similarity in topics studied.
    </li>
    <li> - Distance between researchers indicates disparity in topics studied.
    </li>
    <li> - Cluster colors indicate groups of researchers associated with similar topics.
    </li>

</ul>