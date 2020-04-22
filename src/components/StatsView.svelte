<style>
        .level{
            background: #6e3dff
        }
</style>

<script>

  import { queryKeywordEmphasis, selectedResearchInterest, datasetChoice } from '../stores/MapStore.js'
  import "string_score";
  import citedRankData from './mostCitedMLFaculty.js'
  import recentRankData from './mostRecentMLFaculty.js'

  var newRankData = {}
  var fixedKeys = []

  datasetChoice.subscribe((value) => {
    if (value == "Most Cited") {
      newRankData = citedRankData
    } else {
      newRankData = recentRankData
    }

    fixedKeys = Object.keys(newRankData).map((key) => 
      key.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    )
  })




  var choices = [
    "Machine Learning (18)",
    "Artificial Intelligence (7)",
    "Robotics (6)",
    "Signal Processing (5)",
    "Optimization (4)"
  ]

  selectedResearchInterest.subscribe((val) => {
    choices = fixedKeys.sort((a, b) => b.score(val) - a.score(val)) // .slice(0, 5)
  })

  var handleInterestSelect = (choice) => {
    selectedResearchInterest.set(choice)
  }

  var handleKeydown = () => {
    var key = event.key;
    var keyCode = event.keyCode;
    if (keyCode == 13) {
      selectedResearchInterest.set(choices[0])
    }
  }

</script>

<nav style="padding:10px;margin-bottom:0;padding-bottom:20px;" class="level">

  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <p class="text is-size-3 has-text-white">
          PeopleMap
      </p>
    </div>
  </div>

  <div class="level-item has-text-centered">
    <div>
      <p class="text has-text-grey-light">Scholars</p>
      <p class="text has-text-white is-size-3 has-text-weight-bold">45</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="text has-text-grey-light">Total Google Scholar Keywords</p>
      <p class="text has-text-white is-size-3 has-text-weight-bold">109</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="text has-text-grey-light"> Publications Analyzed</p>
      <p class="text has-text-white is-size-3 has-text-weight-bold"> 797 </p>
    </div>
  </div>

  <div class="column" >
    <h2 class="text has-text-grey-light" style="padding-bottom:0px; font-size: 100%; width: 105%">Keywords Emphasis</h2>
    <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$queryKeywordEmphasis} min="0" max="5" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; 
    margin-bottom: 0px; width: 120px;">
  </div>

  <div class="panel-block">
    <p class="control has-icons-left">
      <input class="input" type="text" 
        on:keydown={handleKeydown}
        bind:value={$selectedResearchInterest} placeholder="Search">
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>
  </div>


</nav>