<script>

  import { selectedResearchInterest } from '../stores/MapStore.js'
  import "string_score";
  import newRankData from './ResearchQueryComplete.js'


  var fixedKeys = Object.keys(newRankData).map((key) => 
    key.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  )

  console.log(fixedKeys)

  var choices = [
    "Machine Learning (18)",
    "Artificial Intelligence (7)",
    "Robotics (6)",
    "Signal Processing (5)",
    "Optimization (4)"
  ]

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

</script>

<style>
  .panel-heading{
      background: #C0C0C0;
  }
  .panel-block{
      background: #F5F5F5;
  }
</style>

<nav class="panel" style="width: 100%;">
  <p class="panel-heading">
    Research Topic Search
  </p>
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
  {#each choices as choice}
    <a on:click = {() => { handleInterestSelect(choice) }} class="panel-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      {choice}
    </a>
  {/each}
</nav>

<ul class="text is-size-7" style="padding-left: 20px;">
    <li> - Use this search bar to see what scholars are most closely associated with a selected keyword.
    </li>
    <li> - The topics above are the most common keywords in the Google Scholar dataset.
    </li>
    <li> - Each number adjacent to a keyword above is the total number of scholars with that topic in their Google Scholar profile.
    </li>

</ul>




