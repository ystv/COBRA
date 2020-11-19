import React, { useEffect } from "react";
import "./App.css";
import { tokenRefresh } from "./commonFunctions";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Stats from "./pages/Stats";
import { Layout, Menu, Breadcrumb } from "antd";
import Streamkeys from "./pages/Streamkeys";
import { Stream } from "stream";

const { Header, Content, Footer } = Layout;

function App() {
  useEffect(tokenRefresh, []);
  const loc = useLocation();

  function defaultSelectedKey() {
    switch (loc.pathname) {
      case "/streamkeys":
        return ["2"];
        break;

      default:
        return ["1"];
        break;
    }

    return ["1"];
  }

  return (
    <Layout>
      <Header className="light-header">
        <div className="logo" />
        <Menu mode="horizontal" defaultSelectedKeys={defaultSelectedKey()}>
          <Menu.Item key="1">
            <Link to="/">Stats</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/streamkeys">StreamKeys</Link>
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

      <div className="App-Container">
        <div className="App-Content">
          <Switch>
            <Route path="/streamkeys">
              <Streamkeys />
            </Route>
            <Route path="/">
              <Stats />
            </Route>
          </Switch>
        </div>
      </div>
      <Footer style={{ textAlign: "center" }}>
        COBRA ©2020 Created by Ben Allen
      </Footer>
    </Layout>
  );
}

function Users() {
  return <h2>Users</h2>;
}

export default App;
