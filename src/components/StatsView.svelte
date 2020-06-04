<style>

    .level{
      background: #652DC1;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    .panel-block:hover {
      text-decoration: none;
    }

</style>

<script>

  import { queryKeywordEmphasis, selectedResearchInterest, datasetChoice } from '../stores/MapStore.js'
  import "string_score";
  import citedRankData from './citedResearchQuery.js'
  import recentRankData from './recentResearchQuery.js'
  import citedCoordinates from './citedCoordinates.js'

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

  var choices = []

  selectedResearchInterest.subscribe((val) => {
    choices = fixedKeys.sort((a, b) => b.score(val) - a.score(val)).slice(0, 5)
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

  var onFocus = () => {
    var input = document.getElementById("autocomplete-input")
    var choices = document.getElementById("autocomplete-choices")
    choices.style.top = input.getBoundingClientRect().top + 50 + "px";
    choices.style.left = input.getBoundingClientRect().left + "px";
    choices.style.width = input.getBoundingClientRect().width + "px";

    choices.style.visibility = "visible";

  }

  var onBlur = () => {
    var choices = document.getElementById("autocomplete-choices")
    choices.style.top = "1000px";
    choices.style.left = "1000px";
    choices.style.visibility = "hidden";
  }

</script>

<div style="background-color: #652DC1;">

<nav class="level is-mobile" style="padding: 10px 10px; margin-bottom: 0px; width:1340px; margin-left:auto; margin-right: auto;">

  <div class="flex-2" style="flex-2: flex-direction; row; justify-content: flex-start; min-width: 820px;">

    <div class="level-left">
      <img src="./logo.png" style="width: 50px%; height: 50px; margin-right: 10px;">
      <p class="text has-text-white" style="font-size: 30px; padding-right: 25px; padding-right: 30px; min-width: 400px;">
          Georgia Tech IDEaS Faculty
      </p>


      <div class="level-item has-text-centered" aria-label="Scholars Analyzed" data-balloon-pos="down" style="padding-right: 20px; margin-right: 0px; min-width: 65px;">
        <p class="text has-text-white" style="opacity: 75%; padding-right: 5px; font-size: 1.8rem;">{citedCoordinates.length}</p>
        <i class="fas fa-child fa-2x" style="color: white; opacity: 75%;"></i>
      </div>

      <div class="level-item has-text-centered" aria-label="Keywords Analyzed" data-balloon-pos="down" style="min-width: 85px; padding-right: 10px;">
        <p class="text has-text-white" style="opacity: 75%; padding-right: 5px; font-size: 1.8rem;">{(Object.keys(citedRankData)).length}</p>
        <i class="fas fa-atom fa-2x" style="color: white; opacity: 75%;"></i>
      </div>

  </div>

</div>




  <div class="panel-block" style="padding-left: 0px; border: 0px solid white; padding-left: 10px; padding-right: 10px; min-width: 300px; overflow: visible;">
    <p class="control has-icons-left" style="padding-right: 10px;">
      <input class="input" id="autocomplete-input" type="text" style="width: 320px;" 
        on:keydown={handleKeydown}
        on:focus={onFocus} on:blur={onBlur}
        bind:value={$selectedResearchInterest} placeholder="Query a Researcher or Area of Study">
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>

    <a 
    on:click={() => {
      selectedResearchInterest.set("")
    }}
    class="delete is-large" style="padding-right: 15px;"></a>

    <a href= https://github.com/poloclub/people-map target="_blank" style="color: white; margin-left: 20px; padding-top: 12px;">
        <span class="icon is-small">
          <i class="fab fa-github fa-2x"></i>
        </span>
    </a>

  </div>



</nav>

<div id="autocomplete-choices" style="visibility: overflow; top: 1000px; left: 10000px; z-index: 100; position: absolute; width: 300px; background: white;">
  {#each choices as choice}
    <a on:mousedown = {() => { handleInterestSelect(choice) }} class="panel-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      {choice}
    </a>
  {/each}
</div>

</div>