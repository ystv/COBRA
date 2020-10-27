import { IResolvers } from "graphql-tools";
import { UserInputError } from "apollo-server-express";
import axios from "axios";
require("dotenv-flow").config();
var parser = require("fast-xml-parser");
const cryptoRandomString = require("crypto-random-string");

export var db = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./cobra.sqlite",
  },
  useNullAsDefault: true,
});

console.log("RTMP Server: ", process.env.RTMP);

var RTMPSERVER = process.env.RTMP!;

const BOArray = [
  {
    id: "ab12dsd15s1d1s5",
    name: "Geneva",
    live: true,
    videoOptions: null,
    customDestination: null,
    protocol: "RTMP",
    state: "STREAMING",
    signal: "MED",
  },
  {
    id: "fsf151df51sf561",
    name: "London",
    live: false,
    videoOptions: null,
    customDestination: null,
    protocol: "RTMP",
    state: "OFFLINE",
    signal: "NONE",
  },
];

const resolverMap: IResolvers = {
  Query: {
    helloWorld(_: void, args: void): string {
      return `👋 Hello world! 👋`;
    },

    boas(_: void, args: void): {}[] {
      return BOArray;
    },

    boa(_: void, args: { id: string }): {} {
      return BOArray.filter((e) => e.id == args.id)[0];
    },

    streams(_: void, args: void): {} {
      return axios
        .get(RTMPSERVER)
        .then((e) => {
          var result = parser.parse(e.data, {
            attributeNamePrefix: "@_",
            attrNodeName: "attr", //default is 'false'
            textNodeName: "#text",
            ignoreAttributes: true,
            ignoreNameSpace: false,
            allowBooleanAttributes: false,
            parseNodeValue: true,
            parseAttributeValue: false,
            trimValues: true,
            cdataTagName: "__cdata", //default is 'false'
            cdataPositionChar: "\\c",
            parseTrueNumberOnly: false,
            arrayMode: false,
          });
          result = { rtmp: result.rtmp };

          var newStream = result.rtmp.server.application.map((e: any) => {
            if (Array.isArray(e.live.stream)) {
              return e;
            } else {
              var newObj: any = e;
              newObj.live.stream = [e.live.stream];
              return newObj;
            }
          });
          var newSpec = result;
          newSpec.rtmp.server.application = newStream;
          return newSpec;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    streamKeys(_: void, args: void): {}[] {
      return db
        .select("*")
        .from("streamKeys")
        .then((rows: any) => {
          return rows;
        });
    },
  },
  Mutation: {
    editBoa(
      _: void,
      args: {
        id: string;
        name: string;
        live: boolean;
        videoOptions: string;
        customDestination: string;
        protocol: string;
      }
    ): {} {
      const init = BOArray.filter((e) => e.id == args.id)[0]; // try and find Boa by id
      if (init === undefined) {
        throw new UserInputError("ID Does Not exist"); // if not found throw obvious err
      }
      const res = { ...init, ...args };
      return res;
    },

    genStreamKey(
      _: void,
      args: { alias: string; start: string; end: string }
    ): {} {
      if (
        validateDate(args.start) == false ||
        validateDate(args.end) == false
      ) {
        throw new UserInputError("Date wrong format");
      }

      return genNoClashStreamKey().then((newKeyFound: any) => {
        var newKey = { streamKey: newKeyFound, ...args };
        return db("streamKeys")
          .insert(newKey)
          .then((e: any) => {
            return newKey;
          });
      });
    },

    addStreamKey(
      _: void,
      args: {
        streamKey: string;
        pwd: string;
        alias: string;
        start: string;
        end: string;
      }
    ): {} {
      if (
        validateDate(args.start) == false ||
        validateDate(args.end) == false
      ) {
        throw new UserInputError("Date wrong format");
      }

      return checkClashStreamKey(args.streamKey).then((e) => {
        if (e !== false) {
          throw new UserInputError("ID exists already");
        }

        if (args.pwd == undefined || args.pwd == "") {
          args.pwd = cryptoRandomString({ length: 24, type: "alphanumeric" });
        }

        return db("streamKeys")
          .insert(args)
          .then((e: any) => args);
      });
    },
  },
};
export default resolverMap;

function genNoClashStreamKey() {
  var streamKey = cryptoRandomString({
    length: 24,
    type: "alphanumeric",
  });

  return db
    .select("*")
    .from("streamKeys")
    .where({ streamKey: streamKey })
    .first()
    .then((rows: any) => {
      if (rows == undefined) {
        return streamKey;
      } else {
        return genNoClashStreamKey();
      }
    });
}

async function checkClashStreamKey(streamKey: string): Promise<boolean> {
  // clash true or false
  return await db
    .select("*")
    .from("streamKeys")
    .where({ streamKey: streamKey })
    .first()
    .then((rows: any) => {
      if (rows !== undefined) {
        return true;
      } else {
        return false;
      }
    });
}

function validateDate(date: string): boolean {
  var test = Date.parse(date);
  if (new Date(test).toISOString().slice(0, 19).replace("T", " ") !== date) {
    return false;
  } else {
    return true;
  }
}
