<script>
  import PeopleMapView from './components/PeopleMapView.svelte'
  import ResearcherDetailView from './components/ResearcherDetailView.svelte'
  import StatsView from './components/StatsView.svelte'
  import SummaryView from './components/SummaryView.svelte'
  import ToggleRow from './components/ToggleRow.svelte'

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
<!-- <SettingsView /> -->
<div class="columns" style="padding-top: 0px; margin-bottom: 0px; margin-left: 0px; padding-left: 0px; padding-right: 0px; margin-right: 0px; width: 100%;">
  <div class="column" style="height: 750px; padding-bottom: 60px; margin-bottom: 0px; background: #FFFFFF; padding-right: 0px; padding-left: 0px; margin-left: 0px; margin-right: 0px; width: 100%;">
    <PeopleMapView />
  </div>
  <div class="column is-narrow" style="padding-right: 20px; margin: 0px">
    <div class="level-item" style="width: 400px;">
      <ResearcherDetailView />
    </div>
  </div>
</div>
<ToggleRow />
<SummaryView />