import React, { Component,ReactDOM } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';
import { BrowserRouter , Route, Link,Switch,Redirect } from "react-router-dom";
import log from 'loglevel';

import logo from './logo.svg';
import './App.css';

import Login from './Login';
import AddTestCase from './AddTestCase';
import axios from 'axios';
import config from './config';

var backend_axios_instance = axios.create({
    baseURL: config.serverurl,
    timeout: 10000,
    withCredentials: true,
});

log.setLevel('debug');
class App extends Component {
  render() {
    return (
        <BrowserRouter axios={backend_axios_instance}>
          <Switch>
            <Route path="/login/:id" axios="bar" component={(route) => (<Login route={route} axios={backend_axios_instance} />)} />
            <Route path="/params/:id/hello/:newid" component={Params} />
            <Route path="/addtestcase/:id/:name/:code"  component={AddTestCase} />
            <Route component={NoMatch} />
          </Switch>
        </BrowserRouter>
    );
  }
}

const Params = ({ match }) => (
    <div>
      <h3>ID: {match.params.newid}</h3>
    </div>
);

const NoMatch = ({ location }) => (
    <Redirect
      to={{
          pathname: "/login"
      }}
      />
);

export default App;
