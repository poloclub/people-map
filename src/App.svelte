<script>
  import PeopleMapView from './components/PeopleMapView.svelte'
  import ResearcherDetailView from './components/ResearcherDetailView.svelte'
  import ResearcherQueryView from './components/ResearcherQueryView.svelte'
  import SettingsView from './components/SettingsView.svelte'
  import StatsView from './components/StatsView.svelte'
  import SummaryView from './components/SummaryView.svelte'

</script>

<style>
        .columns{
            background: #F8F8F8;
            padding-left: 30px;
            padding-right: 30px;
            padding-bottom: 0px;
        }
</style>

<StatsView />
<SettingsView />
<div class="columns" style="padding-bottom: 0px;">
  <div class="column is-one-quarter">
    <ResearcherQueryView />
  </div>
  <div class="column is-two-quarters" style="height: 750px; padding-bottom: 100px;">
    <PeopleMapView />
  </div>
  <div class="column is-one-quarter">
    <ResearcherDetailView />
  </div>
</div>
<SummaryView />