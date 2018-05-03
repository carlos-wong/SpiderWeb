import React, { Component,ReactDOM } from 'react';
class AddTestCase extends Component {
    render() {
        console.log('dump props is:',this.props.match.params);
        return (
            <div>
              <a>Building</a>
            </div>
        );
    }
}

export default AddTestCase;
