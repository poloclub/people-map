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

<div class="columns" style="background: #F8F8F8;">
  <div class="column is-two-thirds" style="background: #F8F8F8;">
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Name </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.name} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Affiliation </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.affiliation} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Google Scholar Keywords </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.scholarKeywords} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Citations </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.citations} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> URL </p>
    <a class="text is-size-5" href= {$selectedResearcherInfo.url} target="_blank"> {$selectedResearcherInfo.url} </a>
  </div>
  <div class="column is-third" style="background: #F8F8F8; height: 200px;">
    <img src="{$selectedResearcherInfo.pictureURL}" style="height: 80%; border: 2px solid grey; border-radius: 2px">
  </div>
</div>

