const fs = require("fs").promises;
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
const {
  filterObjectArrayByProps,
  convertObjectArraytoCsv,
} = require("../util/array-util");
const { errorName } = require("../constants/error-constants");
const config = require("../config");

// uploads a manifest CSV to S3 and returns a signed CloudFront URL
async function uploadManifestToS3(parameters) {
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    },
  });

  const filteredManifest = filterObjectArrayByProps(parameters.manifest, [
    "file_name",
    "case_id",
    "study_code",
    "md5sum",
  ]);
  const manifestCsv = convertObjectArraytoCsv(filteredManifest);

  const tempCsvFile = `${crypto.randomUUID()}.csv`;
  const tempCsvFilePath = path.join(os.tmpdir(), tempCsvFile);
  await fs.writeFile(tempCsvFilePath, manifestCsv, {
    encoding: "utf-8",
  });

  const uploadParams = {
    Bucket: FILE_MANIFEST_BUCKET_NAME,
    Key: tempCsvFile,
    Body: await fs.readFile(tempCsvFilePath, { encoding: "utf-8" }),
  };
  const uploadCommand = new PutObjectCommand(uploadParams);
  await s3Client.send(uploadCommand);

  return getSignedUrl({
    keyPairId: config.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: config.CLOUDFRONT_PRIVATE_KEY,
    url: `${CLOUDFRONT_DOMAIN}/${tempCsvFile}`,
    dateLessThan: new Date(Date.now() + 1000 * SIGNED_URL_EXPIRY_SECONDS),
  });
}

module.exports = uploadManifestToS3;
