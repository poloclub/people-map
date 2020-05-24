
<div id="PeopleMap" style = "width: 100%; height: 100%; background: #FFFFFF; "></div>

<script>

import cov from "compute-covariance";
import SingularValueDecomposition from 'svd-js';

import citedCoordinates from './citedCoordinates.js'
import recentCoordinates from './recentCoordinates.js'

import citedResearchQuery from './citedResearchQuery.js'
import recentResearchQuery from './recentResearchQuery.js'

import citedClusters from './citedClusters.js'
import recentClusters from './recentClusters.js'



// Merge the data between citedCoordinates and citedClusters
for (var i = 0; i < citedClusters.length; i++) {

  citedCoordinates[i]["grouping1,0"] = citedCoordinates[i]["grouping1"]
  citedCoordinates[i]["grouping2,0"] = citedCoordinates[i]["grouping2"]
  citedCoordinates[i]["grouping3,0"] = citedCoordinates[i]["grouping3"]
  citedCoordinates[i]["grouping4,0"] = citedCoordinates[i]["grouping4"]
  citedCoordinates[i]["grouping5,0"] = citedCoordinates[i]["grouping5"]
  citedCoordinates[i]["grouping6,0"] = citedCoordinates[i]["grouping6"]


  for (var k = 1; k <= 10; k++) {
      citedCoordinates[i]["grouping1," + k] = citedClusters[i]["grouping1," + k]
      citedCoordinates[i]["grouping2," + k] = citedClusters[i]["grouping2," + k]
      citedCoordinates[i]["grouping3," + k] = citedClusters[i]["grouping3," + k]
      citedCoordinates[i]["grouping4," + k] = citedClusters[i]["grouping4," + k]
      citedCoordinates[i]["grouping5," + k] = citedClusters[i]["grouping5," + k]
      citedCoordinates[i]["grouping6," + k] = citedClusters[i]["grouping6," + k]
  }
}



// Merge the data between recentCoordinates and recentClusters
for (var i = 0; i < recentClusters.length; i++) {

  recentCoordinates[i]["grouping1,0"] = recentCoordinates[i]["grouping1"]
  recentCoordinates[i]["grouping2,0"] = recentCoordinates[i]["grouping2"]
  recentCoordinates[i]["grouping3,0"] = recentCoordinates[i]["grouping3"]
  recentCoordinates[i]["grouping4,0"] = recentCoordinates[i]["grouping4"]
  recentCoordinates[i]["grouping5,0"] = recentCoordinates[i]["grouping5"]
  recentCoordinates[i]["grouping6,0"] = recentCoordinates[i]["grouping6"]


  for (var k = 1; k <= 10; k++) {
      recentCoordinates[i]["grouping1," + k] = recentClusters[i]["grouping1," + k]
      recentCoordinates[i]["grouping2," + k] = recentClusters[i]["grouping2," + k]
      recentCoordinates[i]["grouping3," + k] = recentClusters[i]["grouping3," + k]
      recentCoordinates[i]["grouping4," + k] = recentClusters[i]["grouping4," + k]
      recentCoordinates[i]["grouping5," + k] = recentClusters[i]["grouping5," + k]
      recentCoordinates[i]["grouping6," + k] = recentClusters[i]["grouping6," + k]
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
var currentSelectedFaculty = citedCoordinates;
var currentSelectedFacultyRankData = citedResearchQuery;


onMount(renderGraph);

function renderGraph() {
  

  var chartDiv = document.getElementById("PeopleMap");

  var width = chartDiv.clientWidth;
  var height = chartDiv.clientHeight;




  // Calculate emphasis range
  var countEmphasis = 0
  while (currentSelectedFaculty[0]['x' + countEmphasis] != null) {
      countEmphasis += 1
  }
  countEmphasis = countEmphasis - 1


  // append the svg object to the body of the page
  var svg = d3.select("#PeopleMap")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g");


  // Rectangle for registering clicks on the graph
  svg.append('rect')
     .attr("width", width)
     .attr("height", height)
     .attr("opacity","0%")
     .on("click", function(d) {
        handleClick(currentlyClicked);
     })
    


      // Set domain of the xAxis
      var x = d3.scaleLinear().range([80, width - 150]);

      x.domain([d3.min(currentSelectedFaculty, function(d) {

        var min = d.x0
        for (var i = 0; i <= countEmphasis; i++) {
          if (d["x" + i] < min) {
            min = d["x" + i]
          }
        }
        return min

      }), d3.max(currentSelectedFaculty, function(d) { 
        
          var max = d.x0
          for (var i = 0; i <= countEmphasis; i++) {
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
      var y = d3.scaleLinear().range([height - 60, 20]);




      

      y.domain([d3.min(currentSelectedFaculty, function(d) {

          var min = d.y0
          for (var i = 0; i <= countEmphasis; i++) {
            if (d["y" + i] < min) {
              min = d["y" + i]
            }
          }
          return min

      }), d3.max(currentSelectedFaculty, function(d) { 
        
          var max = d.y0
          for (var i = 0; i <= countEmphasis; i++) {
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


      // 7 shade gradient of purple, starting with most dark and growing lighter after that
      var purpleGradient = ["#3f007d","#54278f","#6a51a3","#807dba","#9e9ac8","#bcbddc","#dadaeb","#efedf5","#fcfbfd"]



     

      // Filter out data with the selection
      var dataFilter = currentSelectedFaculty.map(function(d) {
        return {xCoordinate: d["x0"], yCoordinate: d["y0"], Author: d.Author, Group: d.grouping6,
                Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL, PictureURL: d.PictureURL} 
      })

      


      // Currently click author
      var currentlyClicked = ""



      // Assign researcher detail view to display the first datapoint data
      var keywordTokens = dataFilter[0].KeyWords.split(", ")

      var finalTokens = ["","","","",""]

      for (var i = 0; i < keywordTokens.length; i++) {
          finalTokens[i] = keywordTokens[i]
      }
      
      var updatedResearcherSelection = {
          name: dataFilter[0].Author,
          affiliation: dataFilter[0].Affiliation,
          scholarKeywords: finalTokens,
          citations: dataFilter[0].Citations,
          url: dataFilter[0].URL,
          pictureURL: dataFilter[0].PictureURL
      }

      selectedResearcherInfo.set(updatedResearcherSelection)




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
          .attr("opacity", "70%")
          .on("mouseover", function(dataPoint) {

              if (currentlyClicked == "") {


                  var keywordTokens = dataPoint.KeyWords.split(", ")

                  var finalTokens = ["","","","",""]

                  for (var i = 0; i < keywordTokens.length; i++) {
                      finalTokens[i] = keywordTokens[i]
                  }
            
                  var updatedResearcherSelection = {
                    name: dataPoint.Author,
                    affiliation: dataPoint.Affiliation,
                    scholarKeywords: finalTokens,
                    citations: dataPoint.Citations,
                    url: dataPoint.URL,
                    pictureURL: dataPoint.PictureURL
                  }

                  selectedResearcherInfo.set(updatedResearcherSelection)

                  text.data(dataFilter).transition()
                    .duration(300)
                      .text(function(d) {
                        if (d.Author == dataPoint.Author) {
                          return d.Author
                        } else {
                          return ""
                        }
                    })

                  dot.data(dataFilter).transition()
                    .duration(300)
                      .attr("opacity", function(d) {
                          if (d.Author == dataPoint.Author) {
                            return "100%"
                          } else {
                            return "20%"
                          }
                      })
                      .attr("r", function(d) {
                          if (d.Author == dataPoint.Author) {
                            return 10
                          } else {
                            return 8
                          }
                      })

              }

          })
          .on("mouseout", function(dataPoint) {
              text.data(dataFilter)
                .transition()
              .duration(300)
                .text(function(d) {
                        if ($displayNames == true) {
                          return d.Author
                        } else {
                          return ""
                        }
                    })

              dot.data(dataFilter)
                .transition()
              .duration(300)
                .attr("opacity", function(d) {
                    if (currentlyClicked != "") {

                        if (currentlyClicked == d.Author) {
                          return "100%"
                        } else {
                          return "20%"
                        }

                    } else {
                        return "70%"
                    }
                    
                })
                .attr("r", function(d) {

                    if (currentlyClicked != "") {

                        if (currentlyClicked == d.Author) {
                          return 10
                        } else {
                          return 8
                        }

                    } else {
                        return 8
                    }

                })
          })
          .on("click", function(dataPoint) {

              handleClick(dataPoint.Author);

          })

          var text = svg.selectAll("text")
                    .data(dataFilter)
                 .enter()
                    .append("text")
                    .text(function(d) {
                        return ""
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



          // Insert ResearchQuery Legend
          var legend = svg.append("defs")
                          .append("svg:linearGradient")
                          .attr("id", "gradient")
                          .attr("x1", "100%")
                          .attr("y1", "0%")
                          .attr("x2", "100%")
                          .attr("y2", "100%")
                          .attr("spreadMethod", "pad");

                        legend.append("stop")
                          .attr("offset", "0%")
                          .attr("stop-color", "#3f007d")
                          .attr("stop-opacity", 1);

                        legend.append("stop")
                          .attr("offset", "100%")
                          .attr("stop-color", "#dadaeb")
                          .attr("stop-opacity", 1);

                        var legendRect = svg.append("rect")
                                            .attr("width", 20)
                                            .attr("height", 200)
                                            .style("fill", "url(#gradient)")
                                            .attr("transform", "translate(" + (width - 40) + ", 15)")
                                            .attr("opacity", "0%");

                        var yLegend = d3.scaleLinear()
                          .range([199, 0])
                          .domain([6, 1]);

                        var yLegendAxis = d3.axisLeft()
                          .scale(yLegend)
                          .ticks(5)
                          .tickFormat(function(d) {
                              if (d == 1) {
                                return "Most Aligned"
                              } else if (d == 6) {
                                return "Least Aligned"
                              }
                          });

                        


                        svg.append("g")
                            .attr("class", "yAxisLegend")
                            .attr("transform", "translate(" + (width - 40) + ", 15)")
                            .call(yLegendAxis)
                            .append("text");

                        d3.select('.yAxisLegend')
                                   .style("opacity", "0%");

                    



      // Add gradient ellipses
      var defs = svg.append("defs");

      //Append a radialGradient element to the defs and give it a unique id
      var radialGradient0 = defs.append("radialGradient")
          .attr("id", "radial-gradient0")
          .attr("rx", "50%")   
          .attr("ry", "50%");  
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
          .attr("rx", "50%")  
          .attr("ry", "50%");  
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
          .attr("rx", "50%")   
          .attr("ry", "50%");   
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
          .attr("rx", "50%")   
          .attr("ry", "50%");   
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
          .attr("rx", "50%")   
          .attr("ry", "50%");   
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
          .attr("rx", "50%")   
          .attr("ry", "50%");   
      radialGradient5.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[5])
          .attr("opacity", "50%");
      radialGradient5.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#F8F8F8")
          .attr("opacity", "50%");















      // Upon change of keywords emphasis, updates the graph visualization
      function updateKeywords(selectedGroup, clustersNumber) {


            // Filter out data with the selection
            var dataFilter = currentSelectedFaculty.map(function(d) {
              return {xCoordinate: d["x" + selectedGroup], yCoordinate:d["y" + selectedGroup], Author: d.Author,
                      Affiliation: d.Affiliation, KeyWords: d.KeyWords, Citations: d.Citations, URL: d.URL,
                      Group: d["grouping" + clustersNumber + "," + selectedGroup], PictureURL: d.PictureURL} 
            })


            dot
              .data(dataFilter)
              .attr('pointer-events', 'none')
              .transition()
              .duration(1000)
              // Temporarlly disable pointer events
              .attr("cx", function(d) {
                return x(+d.xCoordinate) + Math.random() * jitterWidth
              })
              .attr("cy", function(d) { 
                return y(+d.yCoordinate) + Math.random() * jitterWidth 
              })
              .style("fill", function(d) {
                return colors[d.Group]
              })
              .on('end', (d, i, g) => {
                // Restore pointer events after the animation
                d3.select(g[i])
                  .attr('pointer-events', 'auto');
              });
          
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
      function updateClusters(selectedGroup, keywordsEmphasis) {

       
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
              if (d.CurrentRank == -1 || d.CurrentRank >= 5) {
                return purpleGradient[6]
              } else {
                return purpleGradient[d.CurrentRank]
              }
            })

        legendRect.transition()
                  .duration(1000)
                  .attr("opacity","100%");

        d3.select('.yAxisLegend').transition()
                                 .duration(1000)
                                 .style("opacity", "100%");
     

    }



    // A function that update the chart with the researcher names, either displayed or undisplayed
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
                .text(function(d) {
                        if (selectedOption == true) {
                          return d.Author
                        } else {
                          return ""
                        }
                    })


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





      // A function that updates the graph with the new dataset
      function updateDataset(selectedKeywords, selectedClusters) {


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


      function handleClick(dataPoint) {


          if (currentlyClicked == "" & dataPoint != "") {

                    currentlyClicked = dataPoint

                    dot.data(dataFilter)
                        .transition()
                      .duration(300)
                        .attr("opacity", function(d) {
                            if (d.Author == dataPoint) {
                              return "100%"
                            } else {
                              return "20%"
                            }
                        })
                        .attr("r", function(d) {
                            if (d.Author == dataPoint) {
                              return 10
                            } else {
                              return 8
                            }
                        })
                        .attr("stroke-width", function(d) {
                            if (d.Author == dataPoint) {
                              return "2px"
                            } else {
                              return "0px"
                            }
                        })
                        .attr("stroke", function(d) {
                            if (d.Author == dataPoint) {
                              return "#6495ED"
                            } else {
                              return "black"
                            }
                        })

                } else if (currentlyClicked != "" & dataPoint == currentlyClicked) {



                    dot.data(dataFilter)
                              .transition()
                            .duration(300)
                              .attr("opacity", "70%")
                              .attr("r", 8)
                              .attr("stroke-width", "0px")

                    currentlyClicked = ""

                }


      }






    // When the button is changed, run the updateKeywords function and update the graph
    visKeywordEmphasis.subscribe((selectedOption) => {        
        // run the updateChart function with this selected option
        updateKeywords(selectedOption, $visNumClusters)
        updateDistributions($displayDistributions, selectedOption, $visNumClusters)

        legendRect.transition()
                  .duration(1000)
                  .attr("opacity","0%");

        d3.select('.yAxisLegend').transition()
                                 .duration(1000)
                                 .style("opacity", "0%");
    })
    

    // When the button is changed, run the updateClusters function and update the graph
    visNumClusters.subscribe((selectedOption) => {    
      // run the updateChart function with this selected option
      updateClusters(selectedOption, $visKeywordEmphasis)
      updateDistributions($displayDistributions, $visKeywordEmphasis, selectedOption)

      $selectedResearchInterest = ""

      legendRect.transition()
                  .duration(1000)
                  .attr("opacity","0%");

      d3.select('.yAxisLegend').transition()
                               .duration(1000)
                               .style("opacity", "0%");
    })



    // When the button is changed, run the updateNames function and update the graph
    displayNames.subscribe((selectedOption) => {    
      // run the updateNames function with this selected option
      updateNames(selectedOption)
    })


    // When the button is changed, run the updateDistributions function and update the graph
    displayDistributions.subscribe((selectedOption) => {    
      
      updateDistributions(selectedOption, $visKeywordEmphasis, $visNumClusters)
      updateClusters($visNumClusters, $visKeywordEmphasis)

      $selectedResearchInterest = ""

      legendRect.transition()
                  .duration(1000)
                  .attr("opacity","0%");

      d3.select('.yAxisLegend').transition()
                               .duration(1000)
                               .style("opacity", "0%");
    })



    // When a new research query is inputted, update the graph with the new ranking
    selectedResearchInterest.subscribe((value) => {
      
      if (value == "") {
        updateClusters($visNumClusters, $visKeywordEmphasis)

        legendRect.transition()
                  .duration(1000)
                  .attr("opacity","0%");

        d3.select('.yAxisLegend').transition()
                                 .duration(1000)
                                 .style("opacity", "0%");

        return

      }

      var emphasis = $queryKeywordEmphasis;
      if (currentSelectedFacultyRankData[value.toLowerCase()]) {
        updateRanking(value.toLowerCase(), emphasis)
        $displayDistributions = false
        updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters)
      }


    })

    // When a new dataset is selected, update the graph with the new dataset
    datasetChoice.subscribe((value) => {

      if (value == "Most Cited Publications") {
        currentSelectedFaculty = citedCoordinates;
        currentSelectedFacultyRankData = citedResearchQuery;
      } else if (value == "Most Recent Publications") {
        currentSelectedFaculty = recentCoordinates;
        currentSelectedFacultyRankData = recentResearchQuery;
      }

      $selectedResearchInterest = ""

      updateDataset($visKeywordEmphasis, $visNumClusters)
      updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters)

      legendRect.transition()
                  .duration(1000)
                  .attr("opacity","0%");

      d3.select('.yAxisLegend').transition()
                               .duration(1000)
                               .style("opacity", "0%");

    })

        

}

</script>

<style>

  
  .switch[type="checkbox"].is-small:checked + label::before {
    background: #652DC1;
  }

</style>



<nav class="level" style="padding-top: 0px; margin-top: 0px; padding-bottom: 15px; padding-left: 15px;">

  <input id="ShowNamesSwitch" type="checkbox" name="ShowNamesSwitch" 
                class="switch is-small is-rounded" style="padding-top: 0px; color: purple;" bind:checked={$displayNames}>
  <label for="ShowNamesSwitch" ></label>
  <p class="text is-black" style="width: 105%; padding-top: 14px">Show All Names</p>

  <p class="text is-black" style="padding-top: 14px;">#Clusters</p>
  <input id="sliderWithValue" class="slider has-output svelte-1v4uv99 is-circle is-purple" bind:value={$visNumClusters} min="1" max="6" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 150px; padding-top: 37px; fill: #652DC1; padding-right: 25px">

  <input id="ShowGradientsSwitch" type="checkbox" name="ShowGradientsSwitch" 
                class="switch is-small is-rounded" style="padding-top: 0px" bind:checked={$displayDistributions}>
  <label for="ShowGradientsSwitch" ></label>
  <p class="text is-black" style="padding-top: 14px; width: 20%">Show Gradients</p>

</nav>