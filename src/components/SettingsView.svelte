<style>
        .columns{
            padding-left: 40px;
            background: white;
            border: 1px solid grey;
        }
        .column{
          background: #DDA0DD; 
          border-radius: 3px;
          padding-top: 23px;
          width: 200px;
          height: 100px;
          margin-top: 10px;
          margin-bottom: 10px;
          margin-right: 10px;
        }
        .text{
            padding-bottom: 10px;
            background: #DDA0DD;
        }
        .output {
            padding-top: 20px;
        }
        .slider {
            background: white;
        }
</style>
<div class="columns">
  <div class="column" >
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px;">Keywords Included</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" min="0" max="15" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px;">
      <output for="sliderWithValue" style="top:0px;">1</output>
  </div>
  <div class="column">
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px;"> Top Choices</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" min="0" max="15" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px;">
      <output for="sliderWithValue" style="top:0px;">1</output>
  </div>
  <div class="column" style="background: white;">

  </div>
  <div class="column">
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px;">Keywords Added</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" min="0" max="15" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px;">
      <output for="sliderWithValue" style="top:0px;">1</output>
  </div>
  <div class="column">
      <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:0px; border: 0px;">Clusters</h2>
      <input id="sliderWithValue" class="slider has-output svelte-1v4uv99" min="0" max="15" step="1" type="range" style="margin-top: 0px;outline: none;border-top-width: 0px;border-right-width: 0px;border-left-width: 0px;border-bottom-width: 0px;">
      <output for="sliderWithValue" style="top:0px;">1</output>
  </div>
  <div class="column">
      <div class="field">
        <h2 class="text is-size-6 has-text-weight-bold" style="padding-bottom:5px; ">Display Names</h2>
        <input id="switchRtlExample" type="checkbox" name="switchRtlExample" 
                   class="switch is-rtl" checked="checked">
        <label for="switchRtlExample" style="padding-left: 25px;"></label>
      </div>
  </div>
  <div class="column" style="background: white;">

  </div>
  <div class="column" style="background: white; ">
      
  </div>
  <div class="column" style="background: white;">
      
  </div>
</div>