import React, { Component } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';

import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import log from 'loglevel';
import config from './config';

log.setLevel('debug');

var backend_axios_instance = null;

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
                <h1 className="App-title">Welcome to SpiderWeb Userinfo</h1>
              </header>
              <Button type="primary" loading={this.state.loading} onClick={ async ()=>{
                    this.setState({loading:true});
                    try {
                        let userinfoet = await backend_axios_instance.get(
                            '/userinfo?token=a4429cf641996f6728bcb0a90609e42a&username=12345123'
                            );
                        log.debug(userinfoet);
                    } catch (err) {
                        log.debug(err);
                    } finally {
                        this.setState({
                            loading:false
                        });
                    }
                }}>
                Login
              </Button>
            </div>
        );
    }
}

export default Login;
