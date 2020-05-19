<style>
        .level{
            background: #4B0082
        }

        .dropdown-item:hover {
            
            text-decoration-color: white;

        }
</style>


<script>

    import {queryKeywordEmphasis, visKeywordEmphasis, visNumClusters, displayNames, displayDistributions, datasetChoice} from '../stores/MapStore.js'

    var dropdownShownDataset = false;
    var dropdownShownEmphasis = false;

    const selectionClickedDataset = (selection) => {
      dropdownShownDataset = !dropdownShownDataset;
      if (selection) {
        datasetChoice.set(selection)
      }
    }

    const selectionClickedEmphasis = (selection) => {
      dropdownShownEmphasis = !dropdownShownEmphasis;
      if (selection) {
        visKeywordEmphasis.set(selection)
      }
    }

    function displayAdjective(number) {
      if (number == 0) {
        return "No"
      } else if (number == 1) {
        return "Minimal"
      } else if (number == 2) {
        return "Small"
      } else if (number == 3) {
        return "Moderate"
      } else if (number == 4) {
        return "Strong"
      } else if (number == 5) {
        return "Maximal"
      } else {
        return "Not labeled"
      }
    }

</script>


<nav style="margin-bottom:0;padding-bottom:10px; padding-top:10px;" class="level">

  <div class="level-left">
    <div class="level-item" style="margin-right: 0px">
      <p class="text has-text-white" style="font-size: 20px; padding-left: 20px; margin-right: 0px; padding-right: 8px; padding-right: 4px">
          Create map based on 
      </p>
    </div>
    <div class="level-item" style="overflow: visible; margin-right: 0px; padding-right: 8px;">
        <div class="dropdown is-up {dropdownShownDataset ? 'is-active' : ''}" style="padding-left: 2%;">
          <div class="dropdown-trigger" style="background-color: #663399; border-radius: 10px;">
            <button class="button" style="background-color: #663399; border: 0px solid white; border-radius: 15px; height: 0px; margin-bottom: 30px; padding-top: 0px; padding-bottom: 0px; padding-left: 6px; padding-right: 6px;" aria-haspopup="true" aria-controls="dropdown-menu" on:click={() => { selectionClickedDataset(); }}>
              <span style="color: white; font-size: 20px; padding-bottom: 5px;">{$datasetChoice}</span>
              <span class="icon is-small">
                <i class="fas fa-angle-up fa-2x" style="color: white; padding-bottom: 5px; padding-left: 3px; padding-right: 8px;" aria-hidden="true"></i>
              </span>
            </button>
          
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu" style="background-color: #663399;">
            <div class="dropdown-content" style="background-color: #663399;">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedDataset("Most Cited Publications"); }}>
                <p style="color: white; font-size: 15px; background: #663399;">Most Cited Publications</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedDataset("Most Recent Publications"); }}>
                <p style="color: white; font-size: 15px; background: #663399;">Most Recent Publications</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    <div class="level-item" style="margin-right: 0px; padding-right: 8px;">
      <p class="text has-text-white" style="font-size: 20px;">
          with
      </p>
    </div>
    <div class="level-item" style="overflow: visible; margin-right: 0px; padding-right: 8px;">
        <div class="dropdown is-up {dropdownShownEmphasis ? 'is-active' : ''}" style="padding-left: 2%;">
          <div class="dropdown-trigger" style="background-color: #663399; border-radius: 10px;">
            <button class="button" aria-haspopup="true" style="background-color: #663399; border: 0px solid white; border-radius: 15px; height: 0px; margin-bottom: 30px; padding-top: 0px; padding-bottom: 0px; padding-left: 6px; padding-right: 6px;" aria-controls="dropdown-menu" on:click={() => { selectionClickedEmphasis(); }}>
              <span style="color: white; font-size: 20px; padding-bottom: 5px;">{displayAdjective($visKeywordEmphasis)}</span>
              <span class="icon is-medium">
                <i class="fas fa-angle-up fa-2x" style="color: white; padding-bottom: 5px; padding-left: 3px; padding-right: 8px;" aria-hidden="true"></i>
              </span>
            </button>
          
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content" style="background-color: #663399;">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(0); }}>
                <p style="color: white; font-size: 15px; background: #663399;">No</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(1); }}>
                <p style="color: white; font-size: 15px; background: #663399;" >Minimal</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(2); }}>
                <p style="color: white; font-size: 15px; background: #663399;" >Small</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(3); }}>
                <p style="color: white; font-size: 15px; background: #663399;" >Moderate</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(4); }}>
                <p style="color: white; font-size: 15px; background: #663399;" >Strong</p>
              </a>
              <hr class="dropdown-divider">
              <a class="dropdown-item" style="background: #663399;" on:click={() => { selectionClickedEmphasis(5); }}>
                <p style="color: white; font-size: 15px; background: #663399;" >Maximal</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    <div class="level-item">
      <p class="text has-text-white" style="font-size: 20px">
          emphasis on people's research areas specified on Google Scholar.
      </p>
    </div>


  </div>

</nav>