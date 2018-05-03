import React, { Component } from 'react';
import {Row, Col, Layout, Modal, Button, Divider, List, Avatar, Input } from 'antd';
import logo from './logo.svg';
import './App.css';
const Search = Input.Search;
const search = () => (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Test example search page</h1>
      </header>

      <p className="search">
        <div>
          <br /><br />
          <Search
            placeholder="input search text"
            onSearch={value => console.log(value)}
            style={{ width: 200 }}
          />
          <br /><br />
          <Search
            placeholder="input search text"
            style={{ width: 800 }}
            onSearch={value => console.log(value)}
            enterButton
          />
          <br /><br />
          <Search placeholder="input search text" 
          onSearch={value => console.log(value)}
          style={{ width: 800 }}
          enterButton="Search" 
          size="large" />
        </div>
      </p>


    </div>
);

export default search;