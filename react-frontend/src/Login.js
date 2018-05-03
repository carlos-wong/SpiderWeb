import React, { Component } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';

import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            username:"",
            password:"",
        };
    }
    render() {
        return (
            <div className="App">
              <header className="App-header">
                <h1 className="App-title">Welcome to SpiderWeb</h1>
              </header>
              <div className="Login">
                <div className="Login_Bar">
                  <a className="Login_Bar_title">Account:</a>
                  <Input className="Login_Bar_input" placeholder="Username"
                         value={this.state.username}
                         onChange={(event)=>{
                             this.setState({
                                 username:event.target.value
                             });
                    }}/>
                </div>
              </div>
              <div className="Login">
                <div className="Login_Bar">
                  <a className="Login_Bar_title">Password:</a>
                  <Input className="Login_Bar_input" placeholder="Password"
                         value={this.state.password}
                         onChange={(event)=>{
                             this.setState({
                                 password:event.target.value
                             });
                             
                    }}/>
                </div>
              </div>
              <Button type="primary" loading={this.state.loading} onClick={()=>{
                    this.setState({loading:true});
                    console.log('debug state:',this.state);
                }}>
                Click me!
              </Button>
            </div>
        );
    }
}

export default Login;
