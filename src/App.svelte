<script>
  import PeopleMapView from './components/PeopleMapView.svelte'
  import ResearcherDetailView from './components/ResearcherDetailView.svelte'
  import ResearcherQueryView from './components/ResearcherQueryView.svelte'
  import StatsView from './components/StatsView.svelte'
  import SummaryView from './components/SummaryView.svelte'
  import FirstToggleRow from './components/FirstToggleRow.svelte'
  import SecondToggleRow from './components/SecondToggleRow.svelte' 

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
<div class="columns" style="padding-bottom: 0px;">
  <!-- <div class="column is-one-quarter">
    <ResearcherQueryView />
  </div> -->
  <div class="column is-two-thirds" style="height: 750px; padding-bottom: 100px;">
    <PeopleMapView />
  </div>
  <div class="column is-one-third">
    <div class="columns" style="padding-bottom: 0px;">
      <FirstToggleRow />
    </div>
    <div class="columns" style="padding-bottom: 0px;">
      <SecondToggleRow />
    </div>
    <div class="is-divider"></div>
    <ResearcherDetailView />
  </div>
</div>
<SummaryView />