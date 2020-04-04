<script>

  import { selectedResearcherInfo } from '../stores/MapStore.js'

</script>

<style>
  .message-body {
      background: #E8E8E8;
  }
  .text {
      overflow: hidden;
      text-overflow: ellipsis;
  }
</style>

<article class="message is-dark">
  <div class="message-header" >
    <p>Researcher Information</p>
  </div>
  <div class="message-body">
    <p class="text is-size-5"> <u class="text has-text-weight-semibold"> Name: </u> {$selectedResearcherInfo.name} </p>
    <p class="text is-size-5"> <u class="text has-text-weight-semibold"> Affiliation: </u> {$selectedResearcherInfo.affiliation} </p>
    <p class="text is-size-5"> <u class="text has-text-weight-semibold"> Google Scholar Keywords: </u> {$selectedResearcherInfo.scholarKeywords} </p>
    <p class="text is-size-5"> <u class="text has-text-weight-semibold"> Citations: </u> {$selectedResearcherInfo.citations} </p>
    <p class="text is-size-5"> <u class="text has-text-weight-semibold"> URL: </u> {$selectedResearcherInfo.url} </p>
  </div>
</article>