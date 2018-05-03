import React, { Component } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';

import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import log from 'loglevel';
import config from './config';

log.setLevel('debug');

let backend_axios_instance = null;

class Login extends Component {
    constructor(props) {
        super(props);
        log.debug('debug route:',this.props);
        backend_axios_instance =  this.props.axios;
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
                         onChange={async (event)=>{
                             this.setState({
                                 password:event.target.value
                             });
                    }}/>
                </div>
              </div>
              <Button type="primary" loading={this.state.loading} onClick={ async ()=>{
                    this.setState({loading:true});
                    try {
                        let loginret = await backend_axios_instance.get('/login?username='+this.state.username+'&password='+this.state.password);
                        log.debug("login ret",loginret.data);
                        this.props.route.history.push('/testaddcase');
                    } catch (err) {
                        log.debug(err);
                        this.setState({
                            loading:false
                        });
                    } finally {
                    }
                }}>
                Login
              </Button>
            </div>
        );
    }
}

export default Login;
