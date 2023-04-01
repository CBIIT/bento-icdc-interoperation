const { errorType } = require("../constants/error-constants");

const formatErrorResponse = (res, error) => {
  let status;
  let body = { error: undefined };
  try {
    status = errorType[error.message].statusCode;
    body.error = errorType[error.message].message;
  } catch (err) {
    status = 500;
    cleanedErrorMsg =
      error.message.replace(/\"/g, "") +
      ` ${JSON.stringify(error.locations).replace(/\"/g, "")}`;
    body.error = "Internal server error - " + cleanedErrorMsg;
  }
  res.status(status);
  return body;
};

module.exports = {
  formatErrorResponse,
};
