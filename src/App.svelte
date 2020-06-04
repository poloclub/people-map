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
<div class="columns is-mobile" style="margin-top: 0px; padding-top: 0px; margin-bottom: 0px; padding-left: 0px; padding-right: 0px; min-width: 1300px; width:1340px; margin-left:auto; margin-right: auto;">
  <div class="column" style="min-height: 625px; padding-bottom: 35px; margin-bottom: 0px; background: #FFFFFF; padding-right: 0px; padding-left: 0px; margin-left: 0px; margin-right: 0px; width: 100%; padding-top: 0px;">
    <PeopleMapView />
  </div>
  <div class="column is-narrow" style="padding-right: 20px; margin: 0px; padding-left: 18px;">
    <div class="level-item" style="width: 400px;">
      <ResearcherDetailView />
    </div>
  </div>
</div>
<ToggleRow />
<SummaryView />