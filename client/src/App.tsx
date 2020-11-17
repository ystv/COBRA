import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { gql, useSubscription } from "@apollo/client";

const COMMENTS_SUBSCRIPTION = gql`
  subscription {
    streamsChanged {
      rtmp {
        uptime
        server {
          application {
            name
            live {
              stream {
                name
              }
            }
          }
        }
      }
    }
  }
`;

function App() {
  const ServerStatus = useSubscription(COMMENTS_SUBSCRIPTION);

  function LatestComment() {
    return (
      <>
        {ServerStatus.loading || ServerStatus.error !== undefined ? (
          <p>Loading</p>
        ) : (
          ServerStatus.data.streamsChanged.rtmp.server.application.map(
            (e: any) => {
              let res = <></>;
              try {
                res = e.live.stream.map((e: any) => <small>{e.name}</small>);
              } catch {}
              return (
                <div>
                  <h5>{e.name}</h5>
                  {res}
                </div>
              );
            }
          )
        )}
      </>
    );
  }

  function TestAPI() {
    fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ helloThere }" }),
    })
      .then((e) => e.json())
      .then((e) => console.log(e.data.helloThere));
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <p>{JSON.stringify(streamState)}</p> */}
        {LatestComment()}
        <button onClick={TestAPI}>Hello There (Test GQL)</button>
      </header>
    </div>
  );
}

export default App;
