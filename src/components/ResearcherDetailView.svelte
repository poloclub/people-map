<script>

  import { selectedResearcherInfo, selectedResearchInterest } from '../stores/MapStore.js'
  var researcherLocked = false;
  var lockedInterest = ""
  selectedResearchInterest.subscribe((value) => {
    if (value.length == 0) lockedInterest = "";
  })

</script>

<style>
  .text {
      background: #F8F8F8;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  .scholar-keyword:hover {
    text-decoration: underline;
  }

  .image-container {
    background: grey;
    background: #E5E5E5;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 150px;
    border: 1px solid grey;
    border: 1px solid #E5E5E5;
    border-radius: 50%;
    overflow: hidden;
  }
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: contain;
  }
</style>

<div style="background: #F8F8F8;">

  <div class="columns is-centered" style="background: #F8F8F8; min-width:410px; cursor: default;">
    <div class="column">
      <div class="photo" style="margin-left: auto; margin-right: auto; width: 45%; display: block; padding-left: 20px; padding-right: 20px; padding-top: 15%">
        <div class="image-container">
            <img src="{$selectedResearcherInfo.pictureURL}">
        </div>
      </div>
      <div class="content" style="min-width: 410px;">
        <p class="text is-size-2 has-text-weight-bold" style="color: #484848; text-align: center; margin-bottom: 0px;"> {$selectedResearcherInfo.name}  </p>
        <p class="text is-size-5" style="color: #484848; text-align: center; margin-bottom: 0px;"> {$selectedResearcherInfo.affiliation} </p>

        <p class="text is-size-6" style="color: #484848; text-align: center; margin-bottom: 20px"> 
              <span class="light-font" >Citations:</span> {parseInt($selectedResearcherInfo.citations)} 
        </p>

        <p class="text is-size-6" style="color: #484848; text-align: left; margin-bottom: 0px; padding-left: 20%"> 
            <a href= {$selectedResearcherInfo.url} target="_blank" style="color: #652DC1;">Google Scholar </a> keywords
        </p>

        {#each $selectedResearcherInfo.scholarKeywords as scholarKeyword }
          { #if scholarKeyword.length != 0 }
          
          <p style="cursor: pointer; color: #8B72BE; text-align: left; margin-bottom: 0px; {lockedInterest == scholarKeyword ? "font-weight: bold;" : "font-weight: normal;"} margin-left: 20%" on:click={() =>{ 
            if (lockedInterest.length == 0) 
              lockedInterest = scholarKeyword 
            else lockedInterest = ""
            }} on:mouseenter={() => {selectedResearchInterest.set(scholarKeyword)}} on:mouseleave={() => {selectedResearchInterest.set(lockedInterest)}} class="text scholar-keyword is-size-5"> 
            {scholarKeyword} 
          </p>
          {/if}
        {/each}

  <!-- selectedResearchInterest.set("") -->

      </div>
    </div>
  </div>
  
</div>

