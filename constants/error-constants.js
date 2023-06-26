exports.errorName = {
  STUDY_CODE_NOT_FOUND: "STUDY_CODE_NOT_FOUND",
  BENTO_BACKEND_NOT_CONNECTED: "BENTO_BACKEND_NOT_CONNECTED",
  TCIA_API_QUERY_ERROR: "TCIA_API_QUERY_ERROR",
};

exports.errorType = {
  STUDY_CODE_NOT_FOUND: {
    message:
      "The provided study code does not match any existing ICDC studies.",
    statusCode: 404,
  },
  BENTO_BACKEND_NOT_CONNECTED: {
    message: "The server was unable to connect to a Bento backend instance.",
    statusCode: 503,
  },
  TCIA_API_QUERY_ERROR: {
    message: "The server was unable to query data from the TCIA API",
    statusCode: 503,
  },
};
