import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { db } from "./resolverMap";
const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(10)],
});
app.use("*", cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
httpServer.listen({ port: 3000 }, (): void =>
  console.log(
    `\n🚀      GraphQL is now running on http://localhost:3000/graphql`
  )
);
app.get("/", function (req, res) {
  res.send("Welcome Home");
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
