const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { mapCollectionsToStudies } = require("./data-interface");

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
      // TODO: improve/enhance app error handling
      // code in try block below won't throw error
      // need to throw specific errors in data-interface
      let status;
      let body = { error: undefined };
      try {
        status = 400;
        body.error =
          error.message.replace(/\"/g, "") +
          ` ${JSON.stringify(error.locations).replace(/\"/g, "")}`;
      } catch (err) {
        status = 500;
        body.error = "Internal server error: " + error.message;
      }
      res.status(status);
      return body;
    },
  };
});
