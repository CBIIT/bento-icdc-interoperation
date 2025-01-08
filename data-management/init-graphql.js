const { buildSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const { mapCollectionsToStudies } = require("./data-interface");
const { uploadManifestToS3 } = require("../connectors/s3-connector");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  getAllStudies: mapCollectionsToStudies,
  studyLinks: mapCollectionsToStudies,
  storeManifest: uploadManifestToS3,
};

module.exports = (req, res) => {
  createHandler({
    schema: schema,
    rootValue: root,
    context: { req },
  })(req, res);
};
