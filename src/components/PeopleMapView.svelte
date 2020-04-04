
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

<!-- Initialize SelectButton -->
<!-- <select id="keywordsSelect"></select> -->

<!-- Initialize clustersSelect-->
<!-- <select id="clustersSelect"></select> -->

<!-- Create a div where the graph will take place -->
<div id="PeopleMap" style = "border: 1px solid grey; width: 100%; height: 100%"></div>

<script>
import data from './datapoints.js'
import rankData from './rankData.js'
import newRankData from './ResearchQueryComplete.js'
import { onMount } from 'svelte';

import {
        selectedResearcherInfo, 
        selectedResearchInterest, 
        visKeywordEmphasis, 
        visNumClusters,
        displayNames,
        queryKeywordEmphasis, 
        queryTopChoices
} from '../stores/MapStore.js'

var currTimeout = null;

onMount(renderGraph);

function renderGraph() {
  
  // Choose whether or not it will use the ranking coloring
  var rankOption = 0

  var chartDiv = document.getElementById("PeopleMap");
  var width = chartDiv.clientWidth;
  var height = chartDiv.clientHeight;


  console.log(newRankData["machine learning (18)"][0][0].rank)




  // append the svg object to the body of the page
  var svg = d3.select("#PeopleMap")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g");

  // // Initialize a tooltip for hovering over dots in the graph
  // var tooltip = d3.select("#PeopleMap").append("div")
  //                     .attr("class", "tooltip")
  //                     .style("opacity", 0);



      for(var i = 0; i < rankData.length; i++) {
        data[i].rank = rankData[i].rank
      }


      // Set domain of the xAxis
      var x = d3.scaleLinear().range([30, width - 30]);

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
                     .attr("transform", "translate(0," + height + ")");



      // Set domain of yAxis
      var y = d3.scaleLinear().range([height - 20, 20]);

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
      var yAxis = svg.append("g");





      // Blue, Orange, Red, Green, Brown, Yellow, Gray, Black, Pink
      var colors = ["#0000CD","#FFA500", "#FF0000","#006400","#8B4513","#FFFF00","#A9A9A9","#000000","#FF1493"]


      // 7 shade gradient of blue, starting with most dark and growing lighter after that
      var blueGradient = ["#08306b","#08519c","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef", "#deebf7", "#f7fbff"]

     

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
      
            var updatedResearcherSelection = {
              name: dataPoint.Author,
              affiliation: dataPoint.Affiliation,
              scholarKeywords: dataPoint.KeyWords,
              citations: dataPoint.Citations,
              url: dataPoint.URL
            }

            selectedResearcherInfo.set(updatedResearcherSelection)

          })
 

      var text = svg.selectAll("text")
                    .data(dataFilter)
                 .enter()
                    .append("text")
                    .attr("x", function(d) {
                        return x(d.XCoordinate) + 10
                    })
                    .attr("y", function(d) {
                        return y(d.YCoordinate) + 4
                    })
                    .attr("font_family", "sans-serif")  // Font type
                    .attr("font-size", "11px")  // Font size
                    .attr("fill", "black");   // Font color


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

            text.data(dataFilter)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return x(d.xCoordinate) + 10
                })
                .attr("y", function(d) {
                    return y(d.yCoordinate) + 4
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

    // A function that update the chart with a new ranking coloring
    function updateRanking(phrase) {

        // Assign new ranking for current Research Query
        for(var i = 0; i < newRankData[phrase][0].length; i++) {
          data[i].currentRank = newRankData[phrase][0][i].rank
        }

        // Filter out data with the selection
        var dataFilter = data.map(function(d) {
          return { Author: d.Author, Affiliation: d.Affiliation, CurrentRank: d.currentRank,
                   KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL } 
        })


        dot
          .data(dataFilter)
          .transition()
          .duration(1000)
            .style("fill", function(d) {
              if (d.CurrentRank == -1 || d.CurrentRank == 9) {
                return blueGradient[8]
              } else {
                return blueGradient[d.CurrentRank]
              }
            })

    }



    // A function that update the chart with a new cluster coloring
    function updateNames(selectedOption) {


            // Filter out data with the selection
            var dataFilter = data.map(function(d) {
                return { Author: d.Author, Affiliation: d.Affiliation, KeyWords: d.KeyWords, 
                         Citations: d.Citations, URL: d.URL, Rank: d.Rank } 
            })


            text.data(dataFilter)
                .transition()
              .duration(1000)
                .text(function(d) {
                    if (selectedOption == true) {
                      return d.Author
                    } else {
                      return ""
                    }
                })
                .attr("font_family", "sans-serif")  // Font type
                .attr("font-size", "11px")  // Font size
                .attr("fill", "black");   // Font color
              



      }



    // When the button is changed, run the updateKeywords function and update the graph
    visKeywordEmphasis.subscribe((selectedOption) => {        
        // run the updateChart function with this selected option
        updateKeywords("keywordsClustersTester.json", selectedOption)
    })
    

    // When the button is changed, run the updateChart function
    visNumClusters.subscribe((selectedOption) => {    
      // run the updateChart function with this selected option
      updateClusters("keywordsClustersTester.json", selectedOption)
    })


    // When the button is changed, run the updateNames function
    displayNames.subscribe((selectedOption) => {    
      // run the updateNames function with this selected option
      updateNames(selectedOption)
    })



    // TODO: this subscription should listen to settings pane too!
    selectedResearchInterest.subscribe((value) => {

      if (newRankData[value.toLowerCase()]) {
        updateRanking(value.toLowerCase())
      }

    })


        

}

</script>
<ul class="text is-size-7" style="padding-left: 20px;">
    <li> - Each dot represents a researcher and their associated top 20 most cited publications.
    </li>
    <li> - Proximity between researchers indicates similarity in topics studied while distance indicates disparity in topics studied.
    </li>
    <li> - Cluster colors indicate groups of researchers associated with similar topics.
    </li>

</ul>