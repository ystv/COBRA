import express from "express";
var cookieParser = require("cookie-parser");
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import jwt from "jsonwebtoken";
const path = require("path");

import schema from "./schema";
import { db, pollStreamServers } from "./resolverMap";

const secret: jwt.Secret = process.env.signing_key!;

const app = express();

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(10)],
  context: (reqobj) => {
    if (!reqobj.connection?.context.user) {
      try {
        var token = reqobj.req.cookies.token;
        var decoded = jwt.verify(token, secret);
        return { user: decoded };
      } catch (error) {
        throw new AuthenticationError("Couldn't authenticate HTTP cookie");
      }
    }
  },
  playground: {
    settings: {
      "request.credentials": "include",
    },
  },
  subscriptions: {
    onConnect: (connectionParams: any, webSocket, context) => {
      var wsCookie = context.request.headers.cookie
        ?.split("token=")
        .pop()
        ?.split(";")[0];
      if (wsCookie) {
        try {
          var decoded = jwt.verify(wsCookie, secret);
          return { user: decoded };
        } catch (error) {
          throw new AuthenticationError("Couldn't authenticate socket cookie");
        }
      }

      throw new Error("Missing cookie in socket!");
    },
  },
});

app.use("*", cors());
app.use(cookieParser());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
server.applyMiddleware({ app, path: "/graphql" });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 5000 }, (): void =>
  console.log(
    `\n🚀      GraphQL is now running on http://localhost:3000/graphql`
  )
);

//if (process.env.NODE_ENV === "production") {
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});
//}

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

setInterval(pollStreamServers, 2000);
