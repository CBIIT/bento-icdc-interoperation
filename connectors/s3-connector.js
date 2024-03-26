const { randomUUID } = require("crypto");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const converter = require("json-2-csv");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require("../config");
const { errorName } = require("../constants/error-constants");

/**
 * Transforms array of JSON strings representing file manifest
 * into CSV, uploads to S3 bucket and returns pre-signed CloudFront URL.
 *
 * @async
 * @param {Object} parameters - Parameters object.
 * @param {string[]} parameters.manifest - Array of JSON strings.
 * @returns {Promise<string>} - Promise that resolves to a pre-signed CloudFront URL.
 * @throws {Error} - Throws error if file manifest is not an array of JSON strings.
 */
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
    if (!parsedManifest || !Array.isArray(parsedManifest)) {
      throw new Error(errorName.MALFORMED_FILE_MANIFEST);
    }

    const manifestCsv = await converter.json2csv(parsedManifest);
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
