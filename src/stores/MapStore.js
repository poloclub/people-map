import { writable } from 'svelte/store';



const queryKeywordEmphasis = writable(1)
const queryTopChoices = writable(1)
const visKeywordEmphasis = writable(0)
const visNumClusters = writable(5)

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
  selectedResearcherInfo
}