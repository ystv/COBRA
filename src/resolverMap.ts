import { IResolvers } from "graphql-tools";
import { UserInputError } from "apollo-server-express";

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
  },
};
export default resolverMap;
