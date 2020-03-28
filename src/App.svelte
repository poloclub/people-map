<script>
  import PeopleMapView from './components/PeopleMapView.svelte'
  import ResearcherDetailView from './components/ResearcherDetailView.svelte'
  import ResearcherQueryView from './components/ResearcherQueryView.svelte'
  import SettingsView from './components/SettingsView.svelte'
  import StatsView from './components/StatsView.svelte'
  import SummaryView from './components/SummaryView.svelte'


  // example request code.
  var url = "http://localhost:8000/"
  var data = {
    "inputString": "Machine Learning",
    "numKeywords": 3,
    "numChoices": 5
  }
  
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data), 
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return response.json()
  }).then((json) => {
    console.log(json);
  });

</script>

<style>
        .columns{
            background: #F8F8F8;
            padding-left: 30px;
            padding-right: 30px;
        }
</style>

<StatsView />
<SettingsView />
<div class="columns is-3">
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
<SummaryView />