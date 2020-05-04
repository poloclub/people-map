
<div id="PeopleMap" style = "border: 1px solid grey; width: 100%; height: 100%"></div>

<script>

import cov from "compute-covariance";
import SingularValueDecomposition from 'svd-js';

import mostCitedMLFaculty from './mostCitedMLFacultyCoordinates.js'
import mostRecentMLFaculty from './mostRecentMLFacultyCoordinates.js'

import mostCitedMLFacultyRankData from './mostCitedMLFaculty.js'
import mostRecentMLFacultyRankData from './mostRecentMLFaculty.js'

import mostCitedMLFacultyClusters from './mostCitedMLFacultyClusters.js'
import mostRecentMLFacultyClusters from './mostRecentMLFacultyClusters.js'

console.log(mostCitedMLFacultyClusters.length)
console.log("test")
console.log(mostRecentMLFaculty.length)

// Merge the data between mostCitedMLFaculty and mostCitedMLFacultyClusters
for (var i = 0; i < mostCitedMLFacultyClusters.length; i++) {

  mostCitedMLFaculty[i]["grouping1,0"] = mostCitedMLFaculty[i]["grouping1"]
  mostCitedMLFaculty[i]["grouping2,0"] = mostCitedMLFaculty[i]["grouping2"]
  mostCitedMLFaculty[i]["grouping3,0"] = mostCitedMLFaculty[i]["grouping3"]
  mostCitedMLFaculty[i]["grouping4,0"] = mostCitedMLFaculty[i]["grouping4"]
  mostCitedMLFaculty[i]["grouping5,0"] = mostCitedMLFaculty[i]["grouping5"]
  mostCitedMLFaculty[i]["grouping6,0"] = mostCitedMLFaculty[i]["grouping6"]


  for (var k = 1; k <= 10; k++) {
      mostCitedMLFaculty[i]["grouping1," + k] = mostCitedMLFacultyClusters[i]["grouping1," + k]
      mostCitedMLFaculty[i]["grouping2," + k] = mostCitedMLFacultyClusters[i]["grouping2," + k]
      mostCitedMLFaculty[i]["grouping3," + k] = mostCitedMLFacultyClusters[i]["grouping3," + k]
      mostCitedMLFaculty[i]["grouping4," + k] = mostCitedMLFacultyClusters[i]["grouping4," + k]
      mostCitedMLFaculty[i]["grouping5," + k] = mostCitedMLFacultyClusters[i]["grouping5," + k]
      mostCitedMLFaculty[i]["grouping6," + k] = mostCitedMLFacultyClusters[i]["grouping6," + k]
  }
}



// Merge the data between mostRecentMLFaculty and mostRecentMLFacultyClusters
for (var i = 0; i < mostRecentMLFacultyClusters.length; i++) {
  console.log(i)

  mostRecentMLFaculty[i]["grouping1,0"] = mostRecentMLFaculty[i]["grouping1"]
  mostRecentMLFaculty[i]["grouping2,0"] = mostRecentMLFaculty[i]["grouping2"]
  mostRecentMLFaculty[i]["grouping3,0"] = mostRecentMLFaculty[i]["grouping3"]
  mostRecentMLFaculty[i]["grouping4,0"] = mostRecentMLFaculty[i]["grouping4"]
  mostRecentMLFaculty[i]["grouping5,0"] = mostRecentMLFaculty[i]["grouping5"]
  mostRecentMLFaculty[i]["grouping6,0"] = mostRecentMLFaculty[i]["grouping6"]


  for (var k = 1; k <= 10; k++) {
      mostRecentMLFaculty[i]["grouping1," + k] = mostRecentMLFacultyClusters[i]["grouping1," + k]
      mostRecentMLFaculty[i]["grouping2," + k] = mostRecentMLFacultyClusters[i]["grouping2," + k]
      mostRecentMLFaculty[i]["grouping3," + k] = mostRecentMLFacultyClusters[i]["grouping3," + k]
      mostRecentMLFaculty[i]["grouping4," + k] = mostRecentMLFacultyClusters[i]["grouping4," + k]
      mostRecentMLFaculty[i]["grouping5," + k] = mostRecentMLFacultyClusters[i]["grouping5," + k]
      mostRecentMLFaculty[i]["grouping6," + k] = mostRecentMLFacultyClusters[i]["grouping6," + k]
  }
}





import { onMount } from 'svelte';


import {
        selectedResearcherInfo, 
        selectedResearchInterest, 
        visKeywordEmphasis, 
        visNumClusters,
        displayNames,
        displayDistributions,
        queryKeywordEmphasis,
        datasetChoice
} from '../stores/MapStore.js'

var currTimeout = null;
var currentSelectedFaculty = mostCitedMLFaculty;
var currentSelectedFacultyRankData = mostCitedMLFacultyRankData;

onMount(renderGraph);

function renderGraph() {
  

  var chartDiv = document.getElementById("PeopleMap");
  var width = chartDiv.clientWidth;
  var height = chartDiv.clientHeight;


  // append the svg object to the body of the page
  var svg = d3.select("#PeopleMap")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g");


      // Set domain of the xAxis
      var x = d3.scaleLinear().range([30, width - 30]);

      x.domain([d3.min(currentSelectedFaculty, function(d) {

        var min = d.x0
        for (var i = 0; i <= 15; i++) {
          if (d["x" + i] < min) {
            min = d["x" + i]
          }
        }
        return min

      }), d3.max(currentSelectedFaculty, function(d) { 
        
          var max = d.x0
          for (var i = 0; i <= 15; i++) {
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

      y.domain([d3.min(currentSelectedFaculty, function(d) {

          var min = d.y0
          for (var i = 0; i <= 15; i++) {
            if (d["y" + i] < min) {
              min = d["y" + i]
            }
          }
          return min

      }), d3.max(currentSelectedFaculty, function(d) { 
        
          var max = d.y0
          for (var i = 0; i <= 15; i++) {
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
      var dataFilter = currentSelectedFaculty.map(function(d) {
        return {xCoordinate: d["x0"], yCoordinate: d["y0"], Author: d.Author, Group: d.grouping6,
                Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL, PictureURL: d.PictureURL} 
      })


      //Isolates the clusters of researchers for ellipse computation
      function splitResearchers(filteredData, groupingNumber) {

        var arrayOfClusteredResearchers = []
        var total = 0
        var currentGroup = 0
        var currentSet = []
        while (total < filteredData.length) {
          currentSet = filteredData.filter(function(d) {
              if (d.Group == currentGroup) {
                return d
              }
          })

          arrayOfClusteredResearchers[currentGroup] = currentSet
          total += currentSet.length
          currentGroup += 1

        }

        return arrayOfClusteredResearchers

      }


      //Separates the researcher groups into arrays of x and y coordinates
      function generateXAndYCoordinates(splitGroups, keywordsEmphasis) {
        
        var totalCoordinates = []
        for (var i = 0; i < splitGroups.length; i++) {
          var currentGroup = []
          for (var j = 0; j < splitGroups[i].length; j++) {
            currentGroup[j] = [splitGroups[i][j].xCoordinate, splitGroups[i][j].yCoordinate]
          }
          totalCoordinates[i] = currentGroup
        }
        return totalCoordinates
      }

      //Gets the center among all of the coordinates and the eigenvectors
      function generateEllipseInfo(coordinateMatrices) {
        
        var totalInfo = []

        for (var i = 0; i < coordinateMatrices.length; i++) {
          
          var centerX = 0
          var centerY = 0
          var xValues = []
          var yValues = []

          for (var j = 0; j < coordinateMatrices[i].length; j++) {
            centerX += coordinateMatrices[i][j][0]
            centerY += coordinateMatrices[i][j][1]
            xValues[j] = coordinateMatrices[i][j][0]
            yValues[j] = coordinateMatrices[i][j][1]
          }

          centerX = centerX / coordinateMatrices[i].length
          centerY = centerY / coordinateMatrices[i].length

          var covarianceMatrix = cov(xValues, yValues)
          var eigenvectors = (SingularValueDecomposition.SVD(covarianceMatrix)).u
          var eigenvalues = (SingularValueDecomposition.SVD(covarianceMatrix)).q

          var currentEllipseData = {CenterX: centerX, CenterY: centerY, Eigenvectors: eigenvectors, Eigenvalues: eigenvalues, Group: i}

          totalInfo[i] = currentEllipseData
        }

        return totalInfo

      }

      // Process initial info for ellipses
      var separation = splitResearchers(dataFilter, 6)
      var completedSet = generateXAndYCoordinates(separation, 0)
      var ellipseInfo = generateEllipseInfo(completedSet)

      var currentEllipseInfo = ellipseInfo;

      // Ellipses representing the Gaussian distribution
      var outerEllipse = svg.selectAll('outerEllipse')
                             .data(ellipseInfo)
                          .enter()
                             .append('ellipse');

      outerEllipse.attr("rx", function(d) {
                               return x(d.Eigenvalues[0] / d.Eigenvalues[1]) / 4
                          })
                    .attr("ry", function(d) {
                                return y(d.Eigenvalues[1]) / 4
                          })
                    .attr("transform", function(d) {
                                var angle = Math.atan(d.Eigenvectors[0][1] / d.Eigenvectors[0][0])
                                angle = (angle / 3.1415) * 180 + 90
                                return "translate("+ x(d.CenterX) +"," + y(d.CenterY) + ") rotate(" + angle + ")"
                          })
                    .style("fill", function(d) {
                        return "url(#radial-gradient" + d.Group + ")"
                    })
                    .style('mix-blend-mode',"multiply")
                    .attr("opacity", "0%");





      // Set the jittering width
      var jitterWidth = 0



      var text = svg.selectAll("text")
                    .data(dataFilter)
                 .enter()
                    .append("text")
                    .text(function(d) {
                        return d.Author
                    })
                    .attr("x", function(d) {
                        return x(d.xCoordinate) + 10 + Math.random() * jitterWidth
                    })
                    .attr("y", function(d) {
                        return y(d.yCoordinate) + 4 + Math.random() * jitterWidth
                    })
                    .style("text-shadow","-1.5px 0 white, 0 1.5px white, 1.5px 0 white, 0 -1.5px white")
                    .attr("font_family", "sans-serif")  // Font type
                    .attr("font-size", "11px")  // Font size
                    .attr("fill", "black");   // Font color




      // Initialize dots with Zero Keywords and Five Clusters
      var dot = svg
        .selectAll('circle')
        .data(dataFilter)
        .enter()
        .append('circle')
          .attr("cx", function(d) {
            return x(d.xCoordinate) + Math.random() * jitterWidth
          })
          .attr("cy", function(d) { 
            return y(d.yCoordinate) + Math.random() * jitterWidth
          })
          .attr("r", 8)
          .style("fill", function(d) {
              return colors[d.Group]
          })
          .style("stroke", "grey")
          .style("stroke-width", "1px")
          .attr("opacity", "70%")
          .on("mouseover", function(dataPoint) {
      
            var updatedResearcherSelection = {
              name: dataPoint.Author,
              affiliation: dataPoint.Affiliation,
              scholarKeywords: dataPoint.KeyWords,
              citations: dataPoint.Citations,
              url: dataPoint.URL,
              pictureURL: dataPoint.PictureURL
            }

            selectedResearcherInfo.set(updatedResearcherSelection)

            text.data(dataFilter)
                .transition()
              .duration(1000)
                .attr("opacity", function(d) {
                    if (d.Author == dataPoint.Author & $displayNames == true) {
                      return "100%"
                    } else {
                      return "0%"
                    }
                })
          })
          .on("mouseout", function(dataPoint) {
              text.data(dataFilter)
                .transition()
              .duration(2000)
                .attr("opacity", function(d) {
                    if ($displayNames == true) {
                      return "100%"
                    } else {
                      return "0%"
                    }
                })
          });













      // Add gradient ellipses
      var defs = svg.append("defs");

      //Append a radialGradient element to the defs and give it a unique id
      var radialGradient0 = defs.append("radialGradient")
          .attr("id", "radial-gradient0")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient0.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[0])
          .attr("opacity", "50%");
      radialGradient0.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");

      var radialGradient1 = defs.append("radialGradient")
          .attr("id", "radial-gradient1")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient1.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[1])
          .attr("opacity", "50%");
      radialGradient1.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");

      var radialGradient2 = defs.append("radialGradient")
          .attr("id", "radial-gradient2")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient2.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[2])
          .attr("opacity", "50%");
      radialGradient2.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");

      var radialGradient3 = defs.append("radialGradient")
          .attr("id", "radial-gradient3")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient3.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[3])
          .attr("opacity", "50%");
      radialGradient3.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");

      var radialGradient4 = defs.append("radialGradient")
          .attr("id", "radial-gradient4")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient4.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[4])
          .attr("opacity", "50%");
      radialGradient4.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");

      var radialGradient5 = defs.append("radialGradient")
          .attr("id", "radial-gradient5")
          .attr("rx", "50%")   //The radius of the gradient
          .attr("ry", "50%");   //The radius of the gradient
      radialGradient5.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[5])
          .attr("opacity", "50%");
      radialGradient5.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");















      // A function that update the chart
      function updateKeywords(json, selectedGroup, clustersNumber) {


            // Filter out data with the selection
            var dataFilter = currentSelectedFaculty.map(function(d) {
              return {xCoordinate: d["x" + selectedGroup], yCoordinate:d["y" + selectedGroup], Author: d.Author,
                      Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL,
                      Group: d["grouping" + clustersNumber + "," + selectedGroup], PictureURL: d.PictureURL} 
            })


            dot
              .data(dataFilter)
              .transition()
              .duration(1000)
                .attr("cx", function(d) {
                  return x(+d.xCoordinate) + Math.random() * jitterWidth
                })
                .attr("cy", function(d) { 
                  return y(+d.yCoordinate) + Math.random() * jitterWidth 
                })
                .style("fill", function(d) {
                  return colors[d.Group]
                })

            text.data(dataFilter)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return x(d.xCoordinate) + 10 + Math.random() * jitterWidth
                })
                .attr("y", function(d) {
                    return y(d.yCoordinate) + 4 + Math.random() * jitterWidth
                })

            
              



      }

      // A function that update the chart with a new cluster coloring
      function updateClusters(json, selectedGroup, keywordsEmphasis) {

       
            // Filter out data with the selection
            var dataFilter = currentSelectedFaculty.map(function(d) {
              return { Grouping: d["grouping" + selectedGroup + "," + keywordsEmphasis], Author: d.Author, Affiliation: d.Affiliation, 
                       KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL, PictureURL: d.PictureURL } 
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
    function updateRanking(phrase, emphasis) {

        // Assign new ranking for current Research Query
        for(var i = 0; i < currentSelectedFaculty.length; i++) {
          console.log(phrase)
          console.log(emphasis)
          currentSelectedFaculty[i].currentRank = currentSelectedFacultyRankData[phrase][emphasis][i].rank
        }

        // Filter out data with the selection
        var dataFilter = currentSelectedFaculty.map(function(d) {
          return { Author: d.Author, Affiliation: d.Affiliation, CurrentRank: d.currentRank,
                   KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL, PictureURL: d.PictureURL } 
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
            var dataFilter = currentSelectedFaculty.map(function(d) {
                return { Author: d.Author, Affiliation: d.Affiliation, KeyWords: d.KeyWords, 
                         Citations: d.Citations, URL: d.URL, Rank: d.Rank, PictureURL: d.PictureURL } 
            })


            text.data(dataFilter)
                .transition()
              .duration(1000)
                .attr("font_family", "sans-serif")  // Font type
                .attr("font-size", "11px")  // Font size
                .attr("fill", "black")   // Font color
                .attr("opacity", function(d){
                    if (selectedOption == true) {
                      return "100%"
                    } else {
                      return "0%"
                    }
                });


      }




      // A function that updates the chart with a new Gaussian distribution set
      function updateDistributions(selectedOption, keywordsEmphasis, clustersNumber) {


          outerEllipse.data(currentEllipseInfo)
                        .transition()
                        .duration(1000)
                        .attr("opacity", "0%")



          // Filter out data with the selection
          var dataFilter = currentSelectedFaculty.map(function(d) {
            return {xCoordinate: d["x" + keywordsEmphasis], yCoordinate:d["y" + keywordsEmphasis], Author: d.Author,
                    Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL, 
                    Group: d["grouping" + clustersNumber + "," + keywordsEmphasis], PictureURL: d.PictureURL} 
          })

          var separation = splitResearchers(dataFilter, clustersNumber)
          var completedSet = generateXAndYCoordinates(separation, keywordsEmphasis)
          var ellipseInfo = generateEllipseInfo(completedSet)

          currentEllipseInfo = ellipseInfo


            outerEllipse.data(ellipseInfo)
                        .transition()
                        .duration(1000)
                        .attr("rx", function(d) {

                                  var firstEigenvalue = d.Eigenvalues[0]
                                  var secondEigenvalue = d.Eigenvalues[1]
                                  var confidenceInterval = Math.sqrt(d.Eigenvalues[0] * 5.991 * 4)
                                  return confidenceInterval * width / 2
                                   

                              })
                        .attr("ry", function(d) {

                                  var firstEigenvalue = d.Eigenvalues[0]
                                  var secondEigenvalue = d.Eigenvalues[1]
                                  var confidenceInterval = Math.abs(Math.sqrt(d.Eigenvalues[1] * 5.991 * 4))
                                  return confidenceInterval * height / 2

                              })
                        .attr("transform", function(d) {
                                    var angle = Math.atan(d.Eigenvectors[0][1] / d.Eigenvectors[0][0])
                                    angle = (angle / 3.1415) * 180
                                    return "translate("+ x(d.CenterX) +"," + y(d.CenterY) + ") rotate(" + angle + ")"
                              })
                        .style("fill", function(d) {
                            return "url(#radial-gradient" + d.Group + ")"
                        })
                        .style('mix-blend-mode',"multiply")
                        .attr("opacity", function(d) {
                            if (selectedOption == true) {
                                return "50%"
                            } else {
                                return "0%"
                            }
                        });
                
      }





      // A function that update the chart
      function updateDataset(json, selectedKeywords, selectedClusters) {


            // Filter out data with the selection
            var dataFilter = currentSelectedFaculty.map(function(d) {
              return {xCoordinate: d["x" + selectedKeywords], yCoordinate:d["y" + selectedKeywords], Author: d.Author,
                      Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL,
                      Grouping: d["grouping" + selectedClusters + "," + selectedKeywords], PictureURL: d.PictureURL} 
            })


            dot
              .data(dataFilter)
              .transition()
              .duration(1000)
                .attr("cx", function(d) {
                  return x(+d.xCoordinate) + Math.random() * jitterWidth
                })
                .attr("cy", function(d) { 
                  return y(+d.yCoordinate) + Math.random() * jitterWidth
                })
                .style("fill", function(d) {
                  return colors[d.Grouping]
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






    // When the button is changed, run the updateKeywords function and update the graph
    visKeywordEmphasis.subscribe((selectedOption) => {        
        // run the updateChart function with this selected option
        updateKeywords("keywordsClustersTester.json", selectedOption, $visNumClusters)
        updateDistributions($displayDistributions, selectedOption, $visNumClusters)
    })
    

    // When the button is changed, run the updateChart function
    visNumClusters.subscribe((selectedOption) => {    
      // run the updateChart function with this selected option
      updateClusters("keywordsClustersTester.json", selectedOption, $visKeywordEmphasis)
      updateDistributions($displayDistributions, $visKeywordEmphasis, selectedOption)
    })



    // When the button is changed, run the updateNames function
    displayNames.subscribe((selectedOption) => {    
      // run the updateNames function with this selected option
      updateNames(selectedOption)
    })


    // When the button is changed, run the updateDistributions function
    displayDistributions.subscribe((selectedOption) => {    
      // run the updateNames function with this selected option
      updateDistributions(selectedOption, $visKeywordEmphasis, $visNumClusters)
    })


    queryKeywordEmphasis.subscribe((emphasis) => {

      var value = $selectedResearchInterest;
      if (currentSelectedFacultyRankData[value.toLowerCase()]) {
        updateRanking(value.toLowerCase(), emphasis)
      }

    })

    // TODO: this subscription should listen to settings pane too!
    selectedResearchInterest.subscribe((value) => {
      
      var emphasis = $queryKeywordEmphasis;
      if (currentSelectedFacultyRankData[value.toLowerCase()]) {
        updateRanking(value.toLowerCase(), emphasis)
        $displayDistributions = false
        updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters)
      }

    })


    datasetChoice.subscribe((value) => {

      if (value == "Most Cited Publications") {
        currentSelectedFaculty = mostCitedMLFaculty;
        currentSelectedFacultyRankData = mostCitedMLFacultyRankData;
      } else if (value == "Most Recent Publications") {
        currentSelectedFaculty = mostRecentMLFaculty;
        currentSelectedFacultyRankData = mostRecentMLFacultyRankData;
      }

      // var emphasis = $queryKeywordEmphasis;
      // if (currentSelectedFacultyRankData[value.toLowerCase()]) {
      //   updateRanking(value.toLowerCase(), emphasis)
      // }

      updateDataset("keywordsClustersTester.json", $visKeywordEmphasis, $visNumClusters)
      updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters)
    })

        

}

</script>
<ul class="text is-size-7" style="padding-left: 20px;">
    <li> - Each dot represents a researcher and their associated top 50 publications from the publication set selected.
    </li>
    <li> - Proximity between researchers indicates similarity in topics studied while distance indicates disparity in topics studied.
    </li>
    <li> - Cluster colors indicate groups of researchers associated with similar topics.
    </li>

</ul>