<script>

  import { selectedResearcherInfo } from '../stores/MapStore.js'

</script>

<style>
  .text {
      background: #F8F8F8;
      overflow: hidden;
      text-overflow: ellipsis;
  }
</style>

<div class="columns is-centered" style="background: #F8F8F8;">
  <div class="column">
    <div class="photo" style="margin-left: auto; margin-right: auto; width: 37%; display: block; padding-left: 20px; padding-right: 20px; padding-top: 15%">
      <div class="image_container" style="background: grey; display: flex; justify-content: center; align-items: center; width: 150px; height: 150px; border: 1px solid grey; border-radius: 50%; overflow: hidden; padding: 20px;">
          <img src="{$selectedResearcherInfo.pictureURL}" style="width: 100%; height: auto;">
      </div>
    </div>
    <div class="content">
      <p class="text is-size-2 has-text-weight-bold" style="color: #484848; text-align: center; margin-bottom: 0px;"> {$selectedResearcherInfo.name}  </p>
      <p class="text is-size-5" style="color: #484848; text-align: center; margin-bottom: 0px;"> {$selectedResearcherInfo.affiliation} </p>

      <p class="text is-size-6" style="color: #484848; text-align: center; margin-bottom: 20px"> 
            <span class="light-font" style="font-weight: lighter">Citations:</span> {$selectedResearcherInfo.citations} 
      </p>

      <p class="text is-size-6" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          <a href= {$selectedResearcherInfo.url} target="_blank" >Google Scholar </a> keywords
      </p>
      <p class="text is-size-5" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          {$selectedResearcherInfo.scholarKeywords[0]} 
      </p>
      <p class="text is-size-5" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          {$selectedResearcherInfo.scholarKeywords[1]} 
      </p>
      <p class="text is-size-5" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          {$selectedResearcherInfo.scholarKeywords[2]} 
      </p>
      <p class="text is-size-5" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          {$selectedResearcherInfo.scholarKeywords[3]} 
      </p>
      <p class="text is-size-5" style="color: #484848; text-align: left; margin-bottom: 0px; font-weight: lighter; padding-left: 20%"> 
          {$selectedResearcherInfo.scholarKeywords[4]} 
      </p>

    </div>
  </div>
</div>

