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

<style>
  .columns{
      padding-left: 0px;
      ackground: #F8F8F8;
      overflow: visible;
      width: 110%;
      margin-top: 10px;
  }
  .column{
    background: #F8F8F8;
    padding-top: 0px;
    padding-bottom: 10px;
    height: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-right: 0px;
    overflow: visible;
  }
  .text{
      padding-bottom: 10px;
      background: #F8F8F8;
      color: black;
  }
  .output {
      padding-top: 20px;
  }
  .slider {
      background: white;
      width: 80px;
  }
</style>

<div class="columns" style="background: #F8F8F8;">
	  <div class="column" >
	      <div class="field">
	        <h2 class="text is-size-6" style="padding-bottom:5px; padding-left: 10%; padding-right: 10%;">Display Clusters</h2>
	        <input id="switchRtlExample" type="checkbox" name="switchRtlExample" 
	                   class="switch is-large is-rtl" bind:checked={$displayDistributions}>
	        <label for="switchRtlExample" style="padding-left: 20%; "></label>
	      </div>
	  </div>
	  <div class="column" style="overflow: visible; width: 120%">
	    <h2 class="text is-size-6" style="padding-bottom:5px; padding-left: 10%; padding-right: 10%;">Publication Set</h2>
	    <div class="dropdown {dropdownShown ? 'is-active' : ''}">
	      <div class="dropdown-trigger">
	        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" on:click={() => { selectionClicked(); }}>
	          <span>{$datasetChoice}</span>
	          <span class="icon is-small">
	            <i class="fas fa-angle-down" aria-hidden="true"></i>
	          </span>
	        </button>
	      
	      </div>
	      <div class="dropdown-menu" id="dropdown-menu" role="menu">
	        <div class="dropdown-content">
	          <a class="dropdown-item" on:click={() => { selectionClicked("Most Cited"); }}>
	            <u>Most Cited</u>
	          </a>
	          <hr class="dropdown-divider">
	          <a class="dropdown-item" on:click={() => { selectionClicked("Most Recent"); }}>
	            <u>Most Recent</u>
	          </a>
	        </div>
	      </div>
	    </div>
	  </div>
</div>