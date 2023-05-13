exports.errorName = {
  STUDY_CODE_NOT_FOUND: "STUDY_CODE_NOT_FOUND",
  BENTO_BACKEND_NOT_CONNECTED: "BENTO_BACKEND_NOT_CONNECTED",
  MANIFEST_FILE_WRITE_ERROR: "MANIFEST_FILE_WRITE_ERROR",
  MANIFEST_FILE_READ_ERROR: "MANIFEST_FILE_READ_ERROR",
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
  MANIFEST_FILE_WRITE_ERROR: {
    message:
      "The server encountered an error when writing manifest data to a file.",
    statusCode: 500,
  },
  MANIFEST_FILE_READ_ERROR: {
    message:
      "The server encountered an error while reading manifest file data.",
    statusCode: 500,
  },
};
