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
      padding-left: 40px;
      background: #4C58A8;
      border: 1px solid grey;
      overflow: hidden;
  }
  .column{
    background: #79BADB; 
    border-radius: 3px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 200px;
    height: auto;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-right: 10px;
    overflow: hidden;
  }
  .text{
      padding-bottom: 10px;
      background: #79BADB;
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
<div class="columns" style="overflow: visible">
  <div class="column" >
      <h2 class="text" style="padding-bottom:0px; font-size: 100%; width: 105%">Keywords Emphasis</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$queryKeywordEmphasis} min="0" max="5" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; 
      margin-bottom: 0px; width: 120px;">
  </div>
  <div class="column" style="background: #4C58A8;">

  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
</div>