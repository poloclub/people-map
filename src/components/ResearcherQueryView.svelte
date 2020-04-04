<script>

  import { selectedResearchInterest } from '../stores/MapStore.js'

  var choices = [
    "Machine Learning (18)",
    "Artificial Intelligence (7)",
    "Robotics (6)",
    "Signal Processing (5)",
    "Optimization (4)"
  ]

  var handleInterestSelect = (choice) => {
    selectedResearchInterest.set(choice)
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
      <input class="input" type="text" bind:value={$selectedResearchInterest} placeholder="Search">
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




