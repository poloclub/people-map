<script>

  import { selectedResearcherInfo } from '../stores/MapStore.js'

</script>

<style>
  .panel-block{
      background: #E8E8E8;
  }
</style>

<article class="message">
  <div class="message-header">
    <p>Researcher Information</p>
  </div>
  <a class="panel-block">
    <p class="has-text-weight-bold"> Name: {$selectedResearcherInfo.name}</p>
  </a>
  <a class="panel-block">
    <p class="has-text-weight-bold"> Affiliation: {$selectedResearcherInfo.affiliation}</p>
  </a>
  <a class="panel-block">
    <p class="has-text-weight-bold"> Google Scholar Keywords: {$selectedResearcherInfo.scholarKeywords}</p>
  </a>
  <a class="panel-block">
    <p class="has-text-weight-bold"> Citations: {$selectedResearcherInfo.citations}</p>
  </a>
  <a class="panel-block">
    <p class="has-text-weight-bold"> URL: {$selectedResearcherInfo.url}</p>
  </a>
</article>