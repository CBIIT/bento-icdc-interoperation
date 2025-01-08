const fetch = require("node-fetch");
const { search } = require("fast-fuzzy");
const { htmlToText } = require("html-to-text");
const redis = require("redis");
const { filterObjectArray } = require("../util/array-util");
const config = require("../config");
const { errorName } = require("../constants/error-constants");
const {
  CACHE_DURATION,
  SET_ONLY_NONEXISTENT_KEYS,
} = require("../constants/redis-constants");
const {
  IDC_API_BASE_URL,
  IDC_COLLECTION_BASE_URL,
  IDC_API_COLLECTIONS_ENDPOINT,
  TCIA_API_BASE_URL,
  TCIA_COLLECTION_BASE_URL,
  TCIA_API_COLLECTIONS_ENDPOINT,
  TCIA_API_SERIES_ENDPOINT,
} = require("../constants/interop-constants");

/**
 * Retrieves image collection data from the IDC API and filters for collections relevant to ICDC.
 *
 * @async
 * @returns {Promise<string[]>} - Promise that resolves with an array of IDC collections.
 */
async function getIdcCollections() {
  try {
    const response = await fetch(
      `${IDC_API_BASE_URL}${IDC_API_COLLECTIONS_ENDPOINT}`
    );
    const data = await response.json();
    const filteredCollections = filterObjectArray(
      data["collections"],
      "collection_id",
      "cmb_"
    );
    return filteredCollections;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Retrieves image collection data from the TCIA API and filters for collection IDs relevant to ICDC.
 *
 * @async
 * @returns {Promise<string[]>} - Promise that resolves with an array of TCIA collection IDs.
 */
async function getTciaCollections() {
  // return collectionIds = {}
  try {
    const response = await fetch(
      `${TCIA_API_BASE_URL}${TCIA_API_COLLECTIONS_ENDPOINT}`
    );
    const data = await response.json();
    const filtered = filterObjectArray(data, "Collection", "cmb-");
    const collectionIds = filtered.map((obj) => obj.Collection);
    return collectionIds;
  } catch (error) {
    console.error(error);
    return "TCIA Connection error";
  }
}

/**
 * Retrieves data from TCIA API for a specific TCIA image collection.
 *
 * @async
 * @param {string} collection_id - ID of TCIA image collection.
 * @returns {Promise<Object>} - Promise that resolves with data for specified TCIA collection.
 */
async function getTciaCollectionData(collection_id) {
  try {
    const response = await fetch(
      `${TCIA_API_BASE_URL}${TCIA_API_SERIES_ENDPOINT}${collection_id}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return "TCIA Connection error";
  }
}

/**
 * Retrieves study data from the ICDC backend via a GraphQL query.
 *
 * @async
 * @returns {Promise<Object[]>} - Promise that resolves with an array of ICDC study data objects.
 * @throws {Error} - Throws error if there is an issue connecting to ICDC backend instance.
 */
async function getCtdcStudyData() {
  try {
    const body = JSON.stringify({
      query: `{
        getAllStudies {
          study_id
          study_short_name
          image_collection_count
        }
      }`,
      variables: {}  // Include the variables here, even if it’s an empty object
    });
    
    const response = await fetch(config.BENTO_BACKEND_GRAPHQL_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // Make sure to set the Content-Type header to JSON
      },
      body: body,  // The body now includes both query and variables
    });
    
    const data = await response.json();
    const studyData = data.data?.getAllStudies;
    return studyData;
  } catch (error) {
    console.error(error);
    throw new Error(errorName.BENTO_BACKEND_NOT_CONNECTED);
  }
}

/**
 * Maps ICDC-related data collections from external APIs to corresponding ICDC studies.
 *
 * @async
 * @param {Object} parameters - Parameters object.
 * @param {string} parameters.study_code - (Optional) ICDC study code by which to filter collections.
 * @param {Object} context - Context object containing properties/values contained in the request.
 * @returns {Promise<Object[]>} - Promise that resolves with an array of collection mappings.
 * @throws {Error} - Throws error if provided study code is not found in ICDC studies data.
 */
async function mapCollectionsToStudies(parameters, context) {
  try {
    let redisConnected;
    let redisClient;
    let queryKey;

    try {
      if (config.REDIS_AUTH_ENABLED.toLowerCase() !== "true") {
        redisClient = redis.createClient({
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
        });
      } else {
        redisClient = redis.createClient({
          socket: {
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
          },
          password: config.REDIS_PASSWORD,
        });
      }
      redisClient.on("error", async (error) => {
        console.error(error);
        await redisClient.disconnect();
        redisConnected = false;
      });
      await redisClient.connect();
      if (redisClient.isOpen) {
        redisConnected = true;
      }
    } catch (error) {
      console.error(error);
      redisConnected = false;
    }

    if (redisConnected) {
      queryKey = context.req.body.query;
      const cacheResult = await redisClient.get(queryKey);
      if (cacheResult) {
        return JSON.parse(cacheResult);
      }
    }

    const ctdcStudies = await getCtdcStudyData();
    if (
      parameters.study_code?.length >= 0 &&
      !ctdcStudies
        .map((obj) => obj.study_id)
        .includes(parameters.study_code)
    ) {
      throw new Error(errorName.STUDY_CODE_NOT_FOUND);
    }

    const idcCollections = await getIdcCollections();
    const tciaCollections = await getTciaCollections();

    let tciaCollectionsData = {};
    let collectionMappings = [];
    if (tciaCollections != "TCIA Connection error"){
      for (collection in tciaCollections) {
        const tciaCollectionData = await getTciaCollectionData(
          tciaCollections[collection]
        );
        tciaCollectionsData[tciaCollections[collection]] = tciaCollectionData;
      }
  }
  

    for (study in ctdcStudies) {
      // fuzzy match strings using damerau-levenshtein distance
      let idcMatches = search(
        ctdcStudies[study]?.study_short_name,
        idcCollections.map((obj) => obj.collection_id)
      );

      let tciaMatches = search(
        ctdcStudies[study]?.study_id,
        tciaCollections
      )
    

    

      let collectionUrls = [];

      if (idcMatches.length !== 0) {
        for (match in idcMatches) {
          const idcCollectionUrl = `${IDC_COLLECTION_BASE_URL}${idcMatches[match]}`;
          let idcCollectionMetadata = idcCollections.find(
            (obj) => obj.collection_id === idcMatches[match]
          );
          const cleanedDescText = htmlToText(
            idcCollectionMetadata["description"],
            { wordwrap: null }
          );
          // handle oddly-formatted response HTML for GLIOMA01
          if (ctdcStudies[study]?.study_id === "GLIOMA01") {
            idcCollectionMetadata["description"] = cleanedDescText
              .replace(/\n\n|\s*\[.*?\]\s*/g, " ")
              .replace(/ \./g, ".")
              .replace(" ICDC-Glioma", "");
          } else {
            idcCollectionMetadata["description"] = cleanedDescText;
          }
          idcCollectionMetadata["__typename"] = "IDCMetadata";
          collectionUrls.push({
            associated_link_name: "IDC",
            associated_link_url: idcCollectionUrl,
            metadata: idcCollectionMetadata,
          });
        }
      } else {
        collectionUrls.push({
          associated_link_name: "IDC",
          associated_link_url: "API failed",
        });
      }

      if (tciaMatches.length !== 0 || tciaCollections != "TCIA Connection error") {
        for (match in tciaMatches) {
          if (tciaCollectionsData[tciaMatches[match]]?.length > 0) {
            const tciaCollectionUrl = `${TCIA_COLLECTION_BASE_URL}${tciaMatches[match]}`;
            let tciaCollectionMetadata =
              tciaCollectionsData[tciaMatches[match]];
            let totalImages = tciaCollectionMetadata.reduce(
              (tot, obj) => tot + parseInt(obj.ImageCount),
              0
            );
            let imageBool = false;

            if (tciaCollectionMetadata && tciaCollectionMetadata.length > 0) {
              imageBool = true
              
            }

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
            // hardcode inaccessible TCIA data for GLIOMA01
            if (ctdcStudies[study]?.study_id === "GLIOMA01") {
              uniqueModalities.push("Histopathology");
              totalImages += 84;
            }
            collectionUrls.push({
              associated_link_name: "TCIA",
              associated_link_url: tciaCollectionUrl,
              metadata: {
                __typename: "TCIAMetadata",
                Collection: tciaMatches[match],
                Aggregate_PatientID: totalPatients,
                Aggregate_Modality: uniqueModalities.join(", "),
                Aggregate_BodyPartExamined: uniqueBodypartsExamined,
                Aggregate_ImageCount: totalImages,
                Aggregate_ImageBool: imageBool,
              },
            });
          } else {
            collectionUrls.push({
              repository: "TCIA",
              url: "API failed",
            });
          }
        }
      } else {
        collectionUrls.push({
          repository: "TCIA",
          url: "API failed",
        });
      }
      if (
        parameters.study_code &&
        parameters.study_code === ctdcStudies[study]?.study_id
      ) {
        if (redisConnected) {
          await redisClient.set(queryKey, JSON.stringify(collectionUrls), {
            EX: CACHE_DURATION,
            NX: SET_ONLY_NONEXISTENT_KEYS,
          });
        }
        return collectionUrls;
      }
      if (ctdcStudies[study]?.image_collection_count > 0) {
        collectionMappings.push({
          AssociatedLinks: collectionUrls,
          image_collection_count: ctdcStudies[study]?.image_collection_count,
          study_id: ctdcStudies[study]?.study_id,
          study_short_name: ctdcStudies[study]?.study_short_name,
        });
      }
    }
    if (redisConnected) {
      await redisClient.set(queryKey, JSON.stringify(collectionMappings), {
        EX: CACHE_DURATION,
        NX: SET_ONLY_NONEXISTENT_KEYS,
      });
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
  getCtdcStudyData,
  mapCollectionsToStudies,
};
