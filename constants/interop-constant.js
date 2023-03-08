module.exports = Object.freeze({
  IDC_API_BASE_URL: "https://api.imaging.datacommons.cancer.gov/v1",
  IDC_COLLECTION_BASE_URL:
    "https://portal.imaging.datacommons.cancer.gov/explore/filters/?collection_id=",
  IDC_API_COLLECTIONS_ENDPOINT: "/collections",
  TCIA_API_BASE_URL: "https://services.cancerimagingarchive.net/services/v4",
  TCIA_COLLECTION_BASE_URL:
    "https://nbia.cancerimagingarchive.net/nbia-search/?MinNumberOfStudiesCriteria=1&CollectionCriteria=",
  TCIA_API_COLLECTIONS_ENDPOINT: "/TCIA/query/getCollectionValues",
  TCIA_API_SERIES_ENDPOINT: "/TCIA/query/getSeries?Collection=",
});
