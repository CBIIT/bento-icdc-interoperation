const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { mapCollectionsToStudies } = require("./data-interface");
const { uploadManifestToS3 } = require("../connectors/s3-connector");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  studiesByProgram: mapCollectionsToStudies,
  studyLinks: mapCollectionsToStudies,
  storeManifest: uploadManifestToS3,
};

module.exports = graphqlHTTP((req, res) => {
  return {
    graphiql: true,
    schema: schema,
    rootValue: root,
    context: { req },
  };
});
