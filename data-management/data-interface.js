const fetch = require("node-fetch");
const { search } = require("fast-fuzzy");
const { filterObjectArray } = require("../util/array-util");
const config = require("../config");
const {
  IDC_API_BASE_URL,
  IDC_COLLECTION_BASE_URL,
  IDC_API_COLLECTIONS_ENDPOINT,
  TCIA_API_BASE_URL,
  TCIA_COLLECTION_BASE_URL,
  TCIA_API_COLLECTIONS_ENDPOINT,
} = require("../constants/interop-constant");

// fetch and filter IDC image collections
async function getIdcCollections() {
  try {
    const response = await fetch(
      `${IDC_API_BASE_URL}${IDC_API_COLLECTIONS_ENDPOINT}`
    );
    const data = await response.json();
    const filtered = filterObjectArray(
      data["collections"],
      "collection_id",
      "icdc_"
    );
    const collectionIds = filtered.map((obj) => obj.collection_id);
    return collectionIds;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// fetch and filter TCIA image collections
async function getTciaCollections() {
  try {
    const response = await fetch(
      `${TCIA_API_BASE_URL}${TCIA_API_COLLECTIONS_ENDPOINT}`
    );
    const data = await response.json();
    const filtered = filterObjectArray(data, "Collection", "ICDC-");
    const collectionIds = filtered.map((obj) => obj.Collection);
    return collectionIds;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// fetch ICDC study IDs via Bento Backend API
async function getIcdcStudyIds() {
  try {
    const body = JSON.stringify({
      query: `{
              studiesByProgram {
                  clinical_study_designation
              }
          }`,
    });
    const response = await fetch(config.BENTO_BACKEND_GRAPHQL_URI, {
      method: "POST",
      body: body,
    });
    const data = await response.json();
    const studyIds = data.data.studiesByProgram.map(
      (obj) => obj.clinical_study_designation
    );
    return studyIds;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// map image collections to corresponding ICDC studies
async function mapCollectionsToStudies() {
  try {
    const idcCollections = await getIdcCollections();
    const tciaCollections = await getTciaCollections();
    const icdcStudies = await getIcdcStudyIds();

    let collectionMappings = [];

    for (study in icdcStudies) {
      // fuzzy match strings using damerau-levenshtein distance
      let idcMatches = search(icdcStudies[study], idcCollections);
      let tciaMatches = search(icdcStudies[study], tciaCollections);

      let collectionUrls = [];
      let numCrdcNodes = 0;
      let numImageCollections = 0;

      if (idcMatches.length !== 0) {
        const topIdcMatch = idcMatches[0];
        const idcCollectionUrl = `${IDC_COLLECTION_BASE_URL}${topIdcMatch}`;
        collectionUrls.push({ text: topIdcMatch, url: idcCollectionUrl });
        numImageCollections++;
        numCrdcNodes++;
      }
      if (tciaMatches.length !== 0) {
        const topTciaMatch = tciaMatches[0];
        const tciaCollectionUrl = `${TCIA_COLLECTION_BASE_URL}${topTciaMatch}`;
        collectionUrls.push({ text: topTciaMatch, url: tciaCollectionUrl });
        numImageCollections++;
        numCrdcNodes++;
      }
      if (collectionUrls.length !== 0) {
        collectionMappings.push({
          CRDCLinks: collectionUrls,
          numberOfCRDCNodes: numCrdcNodes,
          numberOfImageCollections: numImageCollections,
        });
      }
    }
    return collectionMappings;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getIdcCollections,
  getTciaCollections,
  getIcdcStudyIds,
  mapCollectionsToStudies,
};
