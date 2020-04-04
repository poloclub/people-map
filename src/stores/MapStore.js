import { writable } from 'svelte/store';



const queryKeywordEmphasis = writable(1)
const queryTopChoices = writable(1)
const visKeywordEmphasis = writable(0)
const visNumClusters = writable(5)
const displayNames = writable(false)
const selectedResearchInterest = writable("");

const selectedResearcherInfo = writable({
  name: "",
  affiliation: "",
  scholarKeywords: "",
  citations: "",
  url: ""
})

export {
  queryKeywordEmphasis, 
  queryTopChoices, 
  visKeywordEmphasis, 
  visNumClusters,
  displayNames,
  selectedResearchInterest,
  selectedResearcherInfo
}