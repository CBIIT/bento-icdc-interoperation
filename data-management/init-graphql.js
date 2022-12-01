const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

const root = {
  hello: "Hello World!",
};

module.exports = graphqlHTTP((req, res) => {
  return {
    graphiql: true,
    schema: schema,
    rootValue: root,
    // context: {
    //   userInfo: req.session.userInfo,
    // },
    customFormatErrorFn: (error) => {
      let status = undefined;
      let body = { error: undefined };
      //   try {
      //     status = errorType[error.message].statusCode;
      //     body.error = errorType[error.message].message;
      //   } catch (err) {
      //     status = 500;
      //     body.error = "Internal server error: " + error;
      //   }
      res.status(status);
      return body;
    },
  };
});
