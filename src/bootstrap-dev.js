import React from 'react';
import ReactDOM from 'react-dom';
import AppEntry from './AppEntry';

const root = document.getElementById('root');

ReactDOM.render(<AppEntry useLogger />, root, () =>
  root.setAttribute('data-ouia-safe', true)
);
