import React, { Component,ReactDOM } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';
import { BrowserRouter , Route, Link,Switch,Redirect } from "react-router-dom";

import logo from './logo.svg';
import './App.css';

import Login from './Login';
import search from './search'

class App extends Component {
  render() {
    return (
        <BrowserRouter>
          <Switch>
          <Route path="/Login" component={Login} />
          <Route path="/search" component={search} />
          <Route component={NoMatch} />
          </Switch>
        </BrowserRouter>
    );
  }
}

const NoMatch = ({ location }) => (
    <Redirect
      to={{
          pathname: "/login"
      }}
      />
);

export default App;
