import React, { Component,ReactDOM } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';
import { BrowserRouter , Route, Link } from "react-router-dom";

import logo from './logo.svg';
import './App.css';

import Login from './Login';

class App extends Component {
  render() {
    return (
        <BrowserRouter>
          <Route path="/Login" component={Login} />
        </BrowserRouter>
    );
  }
}

export default App;
