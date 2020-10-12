import { IResolvers } from "graphql-tools";
import { UserInputError } from "apollo-server-express";
import axios from "axios"
require('dotenv-flow').config();
var parser = require('fast-xml-parser');

console.log("RTMP Server: ",process.env.RTMP)

var RTMPSERVER = process.env.RTMP!

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
	streams(_:void, args: void): {} {

		return axios.get(RTMPSERVER)
		.then(e => {
			var result = parser.parse(e.data ,{
				attributeNamePrefix : "@_",
				attrNodeName: "attr", //default is 'false'
				textNodeName : "#text",
				ignoreAttributes : true,
				ignoreNameSpace : false,
				allowBooleanAttributes : false,
				parseNodeValue : true,
				parseAttributeValue : false,
				trimValues: true,
				cdataTagName: "__cdata", //default is 'false'
				cdataPositionChar: "\\c",
				parseTrueNumberOnly: false,
				arrayMode: false, 
			} );
			result = {rtmp: result.rtmp}

		var newStream = result.rtmp.server.application.map((e : any) =>{
			if (Array.isArray(e.live.stream)){
				return e
			} else {
				var newObj:any = e
				newObj.live.stream = [e.live.stream]
				return newObj
			}
		})
		var newSpec = result
		newSpec.rtmp.server.application = newStream
		return newSpec
		})
		.catch(function(error) {
			console.log(error);
		});

		
	}
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