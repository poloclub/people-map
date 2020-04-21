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
      overflow: hidden;
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
    overflow: hidden;
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
	<div class="column">
      <h2 class="text is-size-6" style="padding-bottom:0px; font-size: 100%; width: 105%"> Keywords Weight </h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$visKeywordEmphasis} min="0" max="10" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 120px;">
  	</div>
  	<div class="column">
      <h2 class="text is-size-6" style="padding-bottom:0px; border: 0px; font-size: 100%; width: 105%">#Clusters</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$visNumClusters} min="1" max="6" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 120px;">
  	</div>
  	<div class="column" >
      <div class="field">
        <h2 class="text is-size-6" style="padding-bottom:5px; padding-left: 10%; padding-right: 10%;">Display Names</h2>
        <input id="distributionSwitch" type="checkbox" name="switchRtlExample" 
                   class="switch is-large is-rtl" bind:checked={$displayNames}>
        <label for="distributionSwitch" style="padding-left: 20%; "></label>
      </div>
  </div>
</div>