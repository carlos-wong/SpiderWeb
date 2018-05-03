import React, { Component } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';

import logo from './logo.svg';
import './App.css';

class Login extends Component {
    render() {
        return (
            <div className="App">
              <header className="App-header">
                <h1 className="App-title">Welcome to SpiderWeb</h1>
              </header>
              <p className="Login">
                <div className="Login_Bar">
                  <a className="Login_Bar_title">Account:</a>
                  <Input className="Login_Bar_input" placeholder="Username" />
                </div>
              </p>
              <p className="Login">
                <div className="Login_Bar">
                  <a className="Login_Bar_title">Password:</a>
                  <Input className="Login_Bar_input" placeholder="Password" />
                </div>
              </p>
            </div>
        );
    }
}

export default Login;
