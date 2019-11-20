import React from 'react'
import 'draft-js/dist/Draft.css'
import './App.css'
import TestEditor from './Editor'

import auth from './images/auth.png'
import notAuth from './images/notAuth.png'
import locationPolicy from './images/locationPolicy.png'
import mfa from './images/mfa.png'
import riskEngine from './images/riskEngine.png'
import sso from './images/sso.png'

const connections = [
  { id: '1', image: auth, text: 'Authenticated' },
  { id: '2', image: notAuth, text: 'Not Authenticated' },
  { id: '3', image: mfa, text: 'Multi Factor Authentication' },
  { id: '4', image: riskEngine, text: 'Risk Engine' },
  { id: '5', image: locationPolicy, text: 'Location Policy' },
  { id: '6', image: sso, text: 'Single Sign On' },
]

function App() {
  return (
    <div className="container">
      <TestEditor options={connections} />
    </div>
  );
}

export default App;
