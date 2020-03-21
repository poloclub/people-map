<script>
  import PeopleMapView from './components/PeopleMapView.svelte'
  import ResearcherDetailView from './components/ResearcherDetailView.svelte'
  import ResearcherQueryView from './components/ResearcherQueryView.svelte'
  import SettingsView from './components/SettingsView.svelte'

</script>

<div class="columns">
  <div class="column">
    <ResearcherQueryView />
  </div>
  <div class="column">
    <PeopleMapView />
  </div>
  <div class="column">
    <ResearcherDetailView />
  </div>
</div>

<style>
</style>