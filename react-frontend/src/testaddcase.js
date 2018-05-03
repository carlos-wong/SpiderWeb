import React, { Component } from 'react';
import {Row, Col,Layout,Modal,Button,Divider, List, Avatar,Input } from 'antd';

import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import log from 'loglevel';
import config from './config';

log.setLevel('debug');

let backend_axios_instance = null;
class Testaddcase extends Component {
    constructor(props) {
        super(props);
        log.debug('debug route:',this.props);
        backend_axios_instance =  this.props.axios;
    }
    render() {
        return (
            <div>
              <a>Building</a>
              <Button type="primary" onClick={ async ()=>{
                    try {
                        let loginret = await backend_axios_instance.post('/addTestCase',
                                                                         {
                                                                             title: 'Fred123',
                                                                             correct: 'sfadsf'
                                                                         }
                                                                        );
                        log.debug(loginret);
                        this.props.route.history.push('/testaddcase');
                    } catch (err) {
                        log.debug('post err:',err.response.status);
                    } finally {
                    }
                }}>
                Login
              </Button>
            </div>
        );
    }
}

export default Testaddcase;
