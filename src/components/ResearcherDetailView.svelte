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

<div class="content" style="background: #F8F8F8;">
  <div class="message" style="background: #F8F8F8;">
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Name </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.name} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Affiliation </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.affiliation} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Google Scholar Keywords </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.scholarKeywords} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> Citations </p>
    <p class="text is-size-5" style="color: #484848;"> {$selectedResearcherInfo.citations} </p>
    <p class="text is-size-6" style="color: #808080; margin-bottom: 0px"> URL </p>
    <p class="text is-size-5"> {$selectedResearcherInfo.url} </p>
  </div>
</div>

