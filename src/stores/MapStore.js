import { writable } from 'svelte/store';



const queryKeywordEmphasis = writable(3)
const visKeywordEmphasis = writable(0)
const visNumClusters = writable(5)
const displayNames = writable(false)
const datasetChoice = writable("Most Cited Publications")
const selectedResearchInterest = writable("")
const displayDistributions = writable(false)
// const selectedDataset = writable("ML_MOST_CITED");

const selectedResearcherInfo = writable({
  name: "",
  affiliation: "",
  scholarKeywords: ["","","","",""],
  citations: "",
  url: "",
  pictureURL: "https://scholar.google.com/citations/images/avatar_scholar_256.png"
})

export {
  queryKeywordEmphasis,
  visKeywordEmphasis, 
  visNumClusters,
  displayNames,
  displayDistributions,
  datasetChoice,
  selectedResearchInterest,
  selectedResearcherInfo,
  // selectedDataset
}