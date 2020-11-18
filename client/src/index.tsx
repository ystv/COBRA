import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import {
  split,
  HttpLink,
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

import { Layout, Menu, Breadcrumb } from "antd";
import { tokenRefresh } from "./commonFunctions";

const { Header, Content, Footer } = Layout;

const httpLink = new HttpLink();

const wsLink = new WebSocketLink({
  uri: `ws://${process.env.REACT_APP_API}/graphql`,
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Layout className="layout">
        <Header className="light-header">
          <div className="logo" />
          <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1">Stats</Menu.Item>
            <Menu.Item disabled key="2">
              StreamKeys
            </Menu.Item>
            <Menu.Item disabled key="3">
              BOAs
            </Menu.Item>
            <Menu.Item disabled key="4">
              ASPs
            </Menu.Item>
            <Menu.Item disabled key="5">
              Relays
            </Menu.Item>
          </Menu>
        </Header>
        <App />
        <Footer style={{ textAlign: "center" }}>
          COBRA ©2020 Created by Ben Allen
        </Footer>
      </Layout>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

setInterval(tokenRefresh, 5 * 60000);
