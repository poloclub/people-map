<script>
    import {queryKeywordEmphasis, visKeywordEmphasis, visNumClusters, displayNames, datasetChoice} from '../stores/MapStore.js'

    let questions = [
      { id: 1, text: `Where did you go to school?` },
      { id: 2, text: `What is your mother's name?` },
      { id: 3, text: `What is another personal fact that an attacker could easily find with Google?` }
    ];

    let selected;

    let answer = '';

    function handleSubmit() {
      alert(`answered question ${selected.id} (${selected.text}) with "${answer}"`);
    }

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
      <h2 class="text has-text-weight-bold" style="padding-bottom:0px; font-size: 100%; width: 105%">Google Scholar Keywords Emphasis</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$queryKeywordEmphasis} min="0" max="5" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; 
      margin-bottom: 0px; width: 80px;">
      <output for="sliderWithValue" style="top: 0px;background: grey;width: 40px;margin-left: 0px;">{$queryKeywordEmphasis}</output>
  </div>
  <div class="column" style="background: #4C58A8;">

  </div>
  <div class="column">
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px; font-size: 100%; width: 105%"> Emphasis on Scholar's Keywords</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$visKeywordEmphasis} min="0" max="15" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 80px;">
      <output for="sliderWithValue" style="top: 0px;background: grey;width: 40px;margin-left: 0px;">{$visKeywordEmphasis}</output>
  </div>
  <div class="column">
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px; border: 0px; font-size: 100%; width: 105%">Total Number of Clusters</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" bind:value={$visNumClusters} min="1" max="6" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px; width: 80px;">
      <output for="sliderWithValue" style="top: 0px;background: grey;width: 40px;margin-left: 0px;">{$visNumClusters}</output>
  </div>
  <div class="column" >
      <div class="field">
        <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:5px; padding-left: 10%; padding-right: 10%;">Display Names</h2>
        <input id="switchRtlExample" type="checkbox" name="switchRtlExample" 
                   class="switch is-large is-rtl" bind:checked={$displayNames}>
        <label for="switchRtlExample" style="padding-left: 20%; "></label>
      </div>
  </div>
  <div class="column" style="overflow: visible">
    <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:5px; padding-left: 10%; padding-right: 10%;">Dataset</h2>
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
          <a class="dropdown-item" on:click={() => { selectionClicked("ML Faculty: Most Cited Publications"); }}>
            <u>ML Faculty:</u> Most Cited Publications
          </a>
          <hr class="dropdown-divider">
          <a class="dropdown-item" on:click={() => { selectionClicked("ML Faculty: Most Recent Publications"); }}>
            <u>ML Faculty:</u> Most Recent Publications
          </a>
          <hr class="dropdown-divider">
          <a class="dropdown-item" on:click={() => { selectionClicked("Affiliated Faculty: Most Cited Publications"); }}>
            <u>Affiliated Faculty:</u> Most Cited Publications
          </a>
          <hr class="dropdown-divider">
          <a class="dropdown-item" on:click={() => { selectionClicked("Affiliated Faculty: Most Recent Publications"); }}>
            <u>Affiliated Faculty:</u> Most Recent Publications
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
  <div class="column" style="background: #4C58A8;">
      
  </div>
</div>