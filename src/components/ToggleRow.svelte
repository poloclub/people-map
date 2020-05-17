<style>
        .level{
            background: #4B0082
        }
</style>


<script>

    import {queryKeywordEmphasis, visKeywordEmphasis, visNumClusters, displayNames, displayDistributions, datasetChoice} from '../stores/MapStore.js'

    var dropdownShown = false;

    const selectionClicked = (selection) => {
      dropdownShown = !dropdownShown;
      if (selection) {
        datasetChoice.set(selection)
      }
    }

</script>


<nav style="margin-bottom:0;padding-bottom:10px; padding-top:10px;" class="level">

  <div class="level-left">
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 20px; padding-left: 20px">
          Create map based on 
      </p>
    </div>
    <div class="level-item" style="overflow: visible;">
        <div class="dropdown {dropdownShown ? 'is-active' : ''}" style="padding-left: 2%;">
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" on:click={() => { selectionClicked(); }}>
              <span>{$datasetChoice}</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu" style="background-color: black;">
            <div class="dropdown-content">
              <a class="dropdown-item" on:click={() => { selectionClicked("Most Cited Publications"); }}>
                <u>Most Cited Publications</u>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" on:click={() => { selectionClicked("Most Recent Publications"); }}>
                <u>Most Recent Publications</u>
              </a>
            </div>
          </div>
        </div>
      </div>
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 20px;">
          with
      </p>
    </div>
    <div class="level-item">
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$visKeywordEmphasis} min="0" max="10" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 120px;">
    </div>
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 20px">
          emphasis on people's research areas specified on Google Scholar.
      </p>
    </div>

  </div>

</nav>