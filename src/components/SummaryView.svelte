<style>
        .content{
            background: #FFFFFF;
            padding-top: 25px;
            padding-left: 30%;
            padding-right: 30%;
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
  <p class="text is-size-5"> The five controls added to the left of the visualization each configure a different feature of the generated graph:
  </p>
  <ul class="text is-size-5">
    <li> <u>Keywords Weight:</u> This slider allows you to affect the weight placed on each researcher’s Google Scholar keywords when constructing their vectorizations. The more emphasis placed on their keywords, the more closely they are aligned with the words they use to describe their own work. Placing the slider furthest to the left puts no emphasis on their Google Scholar keywords while placing the slider furthest to the right puts a great deal of emphasis.
    </li>
    <li> <u>#Clusters:</u> This slider allows you to determine the total number of clusters used to split the researchers. More clusters leads to a higher coherence within each cluster but also can lead to fairly arbitrary splits; a good balance is to pick a cluster value that optimizes both coherence and logical cluster divisions.
    </li>
    <li> <u>Display Gradient:</u> This toggle reveals the different Gaussian distributions that generate the clusters in the visualization. Each gradient represents a separate standard distribution in the Gaussian mixture model of the visualization. The gradient extends out three standard deviations in each direction of its axes.
    </li>
    <li> <u>Display Names:</u> This toggle simply displays the name of each researcher adjacent to their respective vertex in the graph
    </li>
    <li> <u>Publication Set:</u> This dropdown allows the user to select which dataset to load into the visualization. With the "Most Cited Publications" choice, the fifty most cited publications of each researcher will be used in generating their visualization. With the "Most Recent Publications" choice, the fifty most recent publications of each researcher will be used in generating their visualization. 
    </li>
  </ul> 
  <h1 class="text is-size-3"> Querying a Research Topic </h1>
  <p class="text is-size-5"> The top-right search bar allows you to find what researchers are most closely aligned with a queried research topic based on both their research work and their Google Scholar research keywords. We use the TFIDF vectors once again but instead use them to score similarity and determine which researchers are most closely aligned with a selected research topic.
  </p>
  <p class="text is-size-5"> The toggle located to the left of the query itself:
  </p>
  <ul class="text is-size-5">
    <li> <u>Keywords Emphasis:</u> This slider allows you to affect the weight placed on each researcher’s Google Scholar keywords when querying for a specific topic. The higher the value is, the more emphasis placed on their keywords, the more closely they are aligned with their chosen topics. Therefore, if you’d like no emphasis placed on them, set the slider to the leftmost point so it will only focus on a researcher’s publications when determining their scoring for the queried topic. Conversely, if you’d like heavy emphasis placed on the keywords, set the slider to the rightmost point so it will weigh a researcher’s chosen keywords when determining their scoring for the queried topic.
    </li>
  </ul>
</div>