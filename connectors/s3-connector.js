const { randomUUID } = require("crypto");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { convertObjectArrayToCsv } = require("../util/array-util");
const config = require("../config");
const { errorName } = require("../constants/error-constants");

// uploads a manifest CSV to S3 and returns a signed CloudFront URL
async function uploadManifestToS3(parameters) {
  try {
    const s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      },
    });

    const parsedManifest = JSON.parse(parameters.manifest);
    if (!Array.isArray(parsedManifest) || !parsedManifest) {
      throw new Error(errorName.MALFORMED_FILE_MANIFEST);
    }

    const manifestCsv = convertObjectArrayToCsv(parameters.manifest);
    const tempCsvFile = `${randomUUID()}.csv`;
    const tempCsvFilePath = path.join(os.tmpdir(), tempCsvFile);
    await fs.writeFile(tempCsvFilePath, manifestCsv, {
      encoding: "utf-8",
    });

    const uploadParams = {
      Bucket: config.FILE_MANIFEST_BUCKET_NAME,
      Key: tempCsvFile,
      Body: await fs.readFile(tempCsvFilePath, { encoding: "utf-8" }),
    };
    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);

    return getSignedUrl({
      keyPairId: config.CLOUDFRONT_KEY_PAIR_ID,
      privateKey: config.CLOUDFRONT_PRIVATE_KEY,
      url: `${config.CLOUDFRONT_DOMAIN}/${tempCsvFile}`,
      dateLessThan: new Date(
        Date.now() + 1000 * config.SIGNED_URL_EXPIRY_SECONDS
      ),
    });
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { uploadManifestToS3 };
