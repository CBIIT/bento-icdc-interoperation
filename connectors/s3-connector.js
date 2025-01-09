const { randomUUID } = require("crypto");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require("../config");
const { errorName } = require("../constants/error-constants");

/**
 * Writes CSV-formatted string (representing file manifest) to file,
 * uploads to S3 bucket and returns pre-signed CloudFront URL.
 *
 * @async
 * @param {Object} parameters - Parameters object.
 * @param {string[]} parameters.manifest - CSV-formatted string.
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
    
    //convert body into a CSV file
    const manifestCsv = parameters.manifest
    const tempCsvFile = `${randomUUID()}.csv`;
    const tempCsvFilePath = path.join(os.tmpdir(), tempCsvFile);
    try {
    await fs.writeFile(tempCsvFilePath, manifestCsv, {
      encoding: "utf-8",
    });
    } catch (e){
      
      try{
        const manifestCsvTry = JSON.stringify(parameters.manifest)
        console.log(parameters.manifest)
        console.log('Attempting to Stringify data')
        await fs.writeFile(tempCsvFilePath, manifestCsvTry, {
          encoding: "utf-8",
        });}
      catch (e){
        console.log('Failed to Write to file , Malformed data ')
          return getSignedUrl({
            url: `Failed to Write to file , Malformed data `,
            dateLessThan: new Date(
              Date.now() + 1000 * config.SIGNED_URL_EXPIRY_SECONDS
            ),
        });
      }
    
    }
    

    const uploadParams = {
      Bucket: config.FILE_MANIFEST_BUCKET_NAME,
      Key: tempCsvFile,
      Body: await fs.readFile(tempCsvFilePath, { encoding: "utf-8" }),
    };
    const uploadCommand = new PutObjectCommand(uploadParams);
    //upload CSV
    console.log('Sending upload to S3Client')
    try {
    await s3Client.send(uploadCommand);
    }
    catch{
      return getSignedUrl({
        url: `S3 failed connect `,
        dateLessThan: new Date(
          Date.now() + 1000 * config.SIGNED_URL_EXPIRY_SECONDS
        ),
    });

    }
    //Return signed URL for CSV
    console.log('returning Signed URL')
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
    return getSignedUrl({
      url: 'code exits uploadManifestToS3' + error,
      dateLessThan: new Date(
        Date.now() + 1000 * config.SIGNED_URL_EXPIRY_SECONDS
      ),
  });
  }
}

module.exports = { uploadManifestToS3 };
