const fs = require("fs");
const os = require("os");
const path = require("path");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  FILE_MANIFEST_BUCKET_NAME,
  AWS_REGION,
  CLOUDFRONT_DOMAIN,
  SIGNED_URL_EXPIRY_SECONDS,
} = require("../constants/aws-constants");
const { errorName } = require("../constants/error-constants");
const config = require("../config");

// uploads a manifest CSV to S3 and returns a signed CloudFront URL
async function uploadManifestToS3(parameters, context) {
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    },
  });

  const tempCsvFile = `${crypto.randomUUID()}.csv`;
  const tempCsvFilePath = path.join(os.tmpdir(), tempCsvFile);
  fs.writeFile(tempCsvFilePath, parameters.manifest, (error) => {
    if (error) {
      throw new Error(errorName.MANIFEST_FILE_WRITE_ERROR);
    }
  });

  const uploadParams = {
    Bucket: FILE_MANIFEST_BUCKET_NAME,
    Key: tempCsvFile,
    Body: fs.readFile(tempCsvFilePath),
  };
  const uploadCommand = new PutObjectCommand(uploadParams);
  await s3Client.send(uploadCommand);

  const signedUrl = getSignedUrl({
    keyPairId: config.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: config.CLOUDFRONT_PRIVATE_KEY,
    url: `${CLOUDFRONT_DOMAIN}/${tempCsvFile}`,
    dateLessThan: new Date(Date.now() + 1000 * SIGNED_URL_EXPIRY_SECONDS),
  });

  return signedUrl;
}

module.exports = uploadManifestToS3;
