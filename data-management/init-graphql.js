const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { mapCollectionsToStudies } = require("./data-interface");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  studiesByProgram: mapCollectionsToStudies,
};

module.exports = graphqlHTTP((req, res) => {
  return {
    graphiql: true,
    schema: schema,
    rootValue: root,
    context: {},
    customFormatErrorFn: (error) => {
      let status = error.message;
      let body = { error: status };
      res.status(status);
      return body;
    },
  };
});
