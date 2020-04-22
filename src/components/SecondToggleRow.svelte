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
	  <div class="column is-half" >
	      <div class="field">
	        <h2 class="text is-size-6" style="padding-bottom:5px; padding-left: 44%;">Display Clusters</h2>
	        <input id="switchRtlExample" type="checkbox" name="switchRtlExample" 
	                   class="switch is-large is-rtl" bind:checked={$displayDistributions}>
	        <label for="switchRtlExample" style="padding-left: 45%; "></label>
	      </div>
	  </div>
    <div class="column is-half">
      <div class="field">
        <h2 class="text is-size-6" style="padding-bottom:5px; padding-left: 15%">Display Names</h2>
        <input id="distributionSwitch" type="checkbox" name="switchRtlExample" 
                   class="switch is-large is-rtl" bind:checked={$displayNames}>
        <label for="distributionSwitch" style="padding-left: 15%; "></label>
      </div>
  </div>
</div>