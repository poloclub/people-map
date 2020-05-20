<style>

    .level{
            background: #652DC1;
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

<nav style="padding:10px;margin-bottom:0;padding-bottom:20px;" class="level">

  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <img src="./logo.png" style="width: 50px%; height: 50px;">
    </div>
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 40px; font-weight: lighter">
          for
      </p>
    </div>
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 40px;">
          IDEaS@GT Faculty
      </p>
    </div>
  </div>

  <div class="level-item has-text-centered">
    <div>
      <p class="text has-text-white is-size-3 has-text-weight-bold" style="opacity: 75%; padding-right: 5px;">{citedCoordinates.length}</p>
    </div>
    <div>
      <i class="fas fa-child fa-2x" style="color: white; opacity: 75%;"></i>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div class="tooltip">
        <div class="level-item has-text-centered">
          <p class="text has-text-white is-size-3 has-text-weight-bold" style="opacity: 75%; padding-right: 5px;">{(Object.keys(citedRankData)).length}</p>
          <i class="fas fa-atom fa-2x" style="color: white; opacity: 75%;"></i>
        </div>
    </div>
  </div>



  <div class="panel-block" style="padding-left: 0px; border: 0px solid white;">
    <p class="control has-icons-left" style="padding-right: 10px;">
      <input class="input" id="autocomplete-input" type="text" style="width: 500px;" 
        on:keydown={handleKeydown}
        on:focus={onFocus} on:blur={onBlur}
        bind:value={$selectedResearchInterest} placeholder="Find a Researcher or query a Research Topic">
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>

  </div>

  <button class="button" style="background: #8B72BE; color: white; margin-right: 10px;" > Clear </button>

</nav>

<div id="autocomplete-choices" style="visibility: hidden; top: 1000px; left: 1000px; z-index: 100; position: absolute; width: 300px; background: white;">
  {#each choices as choice}
    <a on:mousedown = {() => { handleInterestSelect(choice) }} class="panel-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      {choice}
    </a>
  {/each}
</div>

