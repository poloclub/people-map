import { writable } from 'svelte/store';



const queryKeywordEmphasis = writable(3)
const visKeywordEmphasis = writable(0)
const visNumClusters = writable(5)
const displayNames = writable(false)
const datasetChoice = writable("ML Faculty: Most Cited Publications");
const selectedResearchInterest = writable("");
// const selectedDataset = writable("ML_MOST_CITED");

const selectedResearcherInfo = writable({
  name: "",
  affiliation: "",
  scholarKeywords: "",
  citations: "",
  url: ""
})

export {
  queryKeywordEmphasis,
  visKeywordEmphasis, 
  visNumClusters,
  displayNames,
  datasetChoice,
  selectedResearchInterest,
  selectedResearcherInfo,
  // selectedDataset
}