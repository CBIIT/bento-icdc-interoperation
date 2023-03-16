const fetch = require("node-fetch");
const { search } = require("fast-fuzzy");
const { htmlToText } = require("html-to-text");
const { filterObjectArray } = require("../util/array-util");
const config = require("../config");
const {
  IDC_API_BASE_URL,
  IDC_COLLECTION_BASE_URL,
  IDC_API_COLLECTIONS_ENDPOINT,
  TCIA_API_BASE_URL,
  TCIA_COLLECTION_BASE_URL,
  TCIA_API_COLLECTIONS_ENDPOINT,
  TCIA_API_SERIES_ENDPOINT,
} = require("../constants/interop-constant");

// fetch and filter IDC image collections
async function getIdcCollections() {
  try {
    const response = await fetch(
      `${IDC_API_BASE_URL}${IDC_API_COLLECTIONS_ENDPOINT}`
    );
    const data = await response.json();
    const filteredCollections = filterObjectArray(
      data["collections"],
      "collection_id",
      "icdc_"
    );
    return filteredCollections;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// fetch and filter TCIA image collection IDs
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

// fetch specific TCIA image collection metadata
async function getTciaCollectionData(collection_id) {
  try {
    const response = await fetch(
      `${TCIA_API_BASE_URL}${TCIA_API_SERIES_ENDPOINT}${collection_id}`
    );
    const data = await response.json();
    return data;
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

    let tciaCollectionsData = {};
    let collectionMappings = [];

    for (collection in tciaCollections) {
      const tciaCollectionData = await getTciaCollectionData(
        tciaCollections[collection]
      );
      tciaCollectionsData[tciaCollections[collection]] = tciaCollectionData;
    }

    for (study in icdcStudies) {
      // fuzzy match strings using damerau-levenshtein distance
      let idcMatches = search(
        icdcStudies[study],
        idcCollections.map((obj) => obj.collection_id)
      );
      let tciaMatches = search(icdcStudies[study], tciaCollections);

      let collectionUrls = [];
      let numCrdcNodes = 0;
      let numImageCollections = 0;

      if (idcMatches.length !== 0) {
        for (match in idcMatches) {
          const idcCollectionUrl = `${IDC_COLLECTION_BASE_URL}${idcMatches[match]}`;
          let idcCollectionMetadata = idcCollections.find(
            (obj) => obj.collection_id === idcMatches[match]
          );
          const cleanedDescText = htmlToText(
            idcCollectionMetadata["description"],
            { wordwrap: null }
          ).replace(/\r?\n/g, " ");
          idcCollectionMetadata["description"] = cleanedDescText;
          // specify explicit type of metadata returned for GraphQL union
          idcCollectionMetadata["__typename"] = "IDCMetadata";
          collectionUrls.push({
            repository: "IDC",
            url: idcCollectionUrl,
            metadata: idcCollectionMetadata,
          });
          numImageCollections++;
        }
        numCrdcNodes++;
      }
      if (tciaMatches.length !== 0) {
        for (match in tciaMatches) {
          const tciaCollectionUrl = `${TCIA_COLLECTION_BASE_URL}${tciaMatches[match]}`;
          let tciaCollectionMetadata = tciaCollectionsData[tciaMatches[match]];
          const totalImages = tciaCollectionMetadata.reduce(
            (tot, obj) => tot + parseInt(obj.ImageCount),
            0
          );
          const totalPatients = [
            ...new Set(tciaCollectionMetadata.map((obj) => obj.PatientID)),
          ].length;
          const uniqueModalities = [
            ...new Set(tciaCollectionMetadata.map((obj) => obj.Modality)),
          ];
          const uniqueBodypartsExamined = [
            ...new Set(
              tciaCollectionMetadata.map((obj) => obj.BodyPartExamined)
            ),
          ];
          collectionUrls.push({
            repository: "TCIA",
            url: tciaCollectionUrl,
            metadata: {
              // specify explicit type of metadata returned for GraphQL union
              __typename: "TCIAMetadata",
              Collection: tciaMatches[match],
              total_patientIDs: totalPatients,
              unique_modalities: uniqueModalities,
              unique_bodypartsExamined: uniqueBodypartsExamined,
              total_imageCounts: totalImages,
            },
          });
          numImageCollections++;
        }
        numCrdcNodes++;
      }
      if (collectionUrls.length !== 0) {
        collectionMappings.push({
          CRDCLinks: collectionUrls,
          numberOfCRDCNodes: numCrdcNodes,
          numberOfImageCollections: numImageCollections,
          clinical_study_designation: icdcStudies[study],
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
