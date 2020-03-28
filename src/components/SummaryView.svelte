<style>
        .content{
            background: #FFFFFF;
            padding-top: 0px;
            padding-left: 600px;
            padding-right: 575px;
            padding-bottom: 100px;
            line-height: 40px;
        }
</style>

<div class="content">
  <h1 class="text is-size-1"> What is PeopleMap? </h1>
  <p class="text is-size-5"> PeopleMap is a data visualization tool that uses natural language processing (NLP) to map out researchers through graphical representations, using a variety of textual characteristics related to each researcher, such as college/school of their professorship, laboratory affiliation, titles and abstracts of their papers found on Google Scholar, and Google Scholar keywords.
  </p>
  <p class="text is-size-5"> By analyzing this information through a variety of NLP techniques, such as NMF and TFIDF, we can get a better understanding of the topics and focuses related to the variety of academic researchers at Georgia Tech. These connections and groups can, in turn, be visualized through a graphical system of nodes and edges that builds a more intuitive image of the researchers, which helps external groups, as well as individuals at Georgia Tech, understand our vast academic diversity better.
  </p>
  <h1 class="text is-size-3"> Mapping Out Researchers </h1>
  <p class="text is-size-5"> The central graph visualizes each researcher’s publications in relation to all other researchers. Through the use of TFIDF matrices, which take into account both the frequency and occurrence of specific words in the publications, the researchers’ works can be analyzed and converted into high-dimensional vectors that can be visualized. 
  </p>
  <p class="text is-size-5"> The three controls added above each configure a different feature of the generated graph:
  </p>
  <ul class="text is-size-5">
    <li> <u>Google Scholar Keywords Added:</u> This slider allows you to affect the weight placed on each researcher’s Google Scholar keywords when constructing their vectorizations. The more emphasis placed on their keywords, the more closely they are aligned with the words they use to describe their own work. The setting 0 puts no emphasis on their Google Scholar keywords while 15 puts a great deal of emphasis.
    </li>
    <li> <u>Number of Total Clusters:</u> This slider allows you to determine the total number of clusters used to split the researchers. More clusters leads to a higher coherence within each cluster but also can lead to fairly arbitrary splits; a good balance is to pick a cluster value that optimizes both coherence and logical cluster divisions. The default value loaded for this graph is optimized to balance both.
    </li>
    <li> <u>Display Names:</u> This toggle simply displays the name of each researcher adjacent to their respective vertex in the graph
    </li>
  </ul> 
  <h1 class="text is-size-3"> Querying a Research Topic </h1>
  <p class="text is-size-5"> The left search bar allows you to find what researchers are most closely aligned with a queried research topic based on both their research work and their Google Scholar research keywords. We use the TFIDF vectors once again but instead use them to score similarity and determine which researchers are most closely aligned with a selected research topic.
  </p>
  <p class="text is-size-5"> The two toggles located above control the query itself:
  </p>
  <ul class="text is-size-5">
    <li> <u>Google Scholar Keywords Added:</u> This slider allows you to affect the weight placed on each researcher’s Google Scholar keywords when querying for a specific topic. The higher the value is, the more emphasis placed on their keywords, the more closely they are aligned with their chosen topics. Therefore, if you’d like no emphasis placed on them, set the slider to 0 so it will only focus on a researcher’s publications when determining their scoring for the queried topic. Conversely, if you’d like heavy emphasis placed on the keywords, set the slider to 15 so it will weigh a researcher’s chosen keywords when determining their scoring for the queried topic.
    </li>
    <li> <u>Number of Top Choices:</u> This slider simply affects the number of researchers highlighted after the query. For example, if it is set to 5 and the topic “Artificial Intelligence” is queried, the five researchers who scored most highly for “Artificial Intelligence” will be highlighted in the subsequent visualization.
    </li>
  </ul>
</div>