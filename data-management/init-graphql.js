const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { mapCollectionsToStudies } = require("./data-interface");
const { formatErrorResponse } = require("../util/error-util");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  studiesByProgram: mapCollectionsToStudies,
  studyLinks: mapCollectionsToStudies,
};

module.exports = graphqlHTTP((req, res) => {
  return {
    graphiql: true,
    schema: schema,
    rootValue: root,
    context: { req },
    customFormatErrorFn: (error) => {
      return formatErrorResponse(res, error);
    },
  };
});
