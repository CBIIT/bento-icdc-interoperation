const {
  buildSchema,
  specifiedRules,
  NoSchemaIntrospectionCustomRule,
} = require("graphql");

const { createHandler } = require("graphql-http/lib/use/express");
const { uploadManifestToS3 } = require("../connectors/s3-connector");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  storeManifest: uploadManifestToS3,
};

/**
 * Central location for GraphQL security configuration.
 *
 * Additional GraphQL security controls can be added here in the future.
 */
function configureSecurity() {
  const introspectionEnabled =
    process.env.GRAPHQL_INTROSPECTION_ENABLED?.toLowerCase() === "true";

  const validationRules = [...specifiedRules];

  if (!introspectionEnabled) {
    validationRules.push(NoSchemaIntrospectionCustomRule);
  }

  return {
    validationRules,
  };
}
console.log(process.env.GRAPHQL_INTROSPECTION_ENABLED?.toLowerCase() === "true")
const securityConfig = configureSecurity();

module.exports = (req, res) => {
  createHandler({
    schema: schema,
    rootValue: root,
    context: { req },
    validationRules: securityConfig.validationRules,
  })(req, res);
};
