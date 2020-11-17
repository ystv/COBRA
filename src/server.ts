import express from "express";
var cookieParser = require("cookie-parser");
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import jwt from "jsonwebtoken";
const path = require("path");

import schema from "./schema";
import { db } from "./resolverMap";

const secret: jwt.Secret = process.env.signing_key!;

const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(10)],
  context: ({ req }) => {
    // Note! This example uses the `req` object to access headers,
    // but the arguments received by `context` vary by integration.
    // This means they will vary for Express, Koa, Lambda, etc.!
    //
    // To find out the correct arguments for a specific integration,
    // see the `context` option in the API reference for `apollo-server`:
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server/

    // Get the user token from the headers.
    //const token = req.headers.authorization || '';

    // try to retrieve a user with the token
    //const user = getUser(token);

    // add the user to the context
    //return { user };

    try {
      var decoded = jwt.verify(req.cookies.token, secret);
      console.log(decoded);
      return decoded;
    } catch (error) {
      console.log("nope");
      return null;
    }
  },
});
app.use("*", cors());
app.use(cookieParser());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);

httpServer.listen({ port: 3000 }, (): void =>
  console.log(
    `\n🚀      GraphQL is now running on http://localhost:3000/graphql`
  )
);

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.post("/key-check", function (req, res) {
  try {
    console.log("recieved key: ", req.body.name);
    checkUserProfile(req.body).then((checker) => {
      if (checker == true) {
        console.log("ACCEPTED\n");
        res.sendStatus(201);
      } else {
        console.log("DECLINED\n");
        res.sendStatus(404);
      }
    });
  } catch {
    console.log("An error occured");
    res.sendStatus(500);
  }
});

async function checkUserProfile(data: { name: string; pwd: string }) {
  // ADD DATE CHECK
  return db
    .select("*")
    .from("streamKeys")
    .where({ streamKey: data.name })
    .first()
    .then((rows: any) => {
      if (rows.pwd == data.pwd) {
        return true;
      }
      return false;
    });
}
