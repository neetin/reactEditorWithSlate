import React from 'react'
import 'draft-js/dist/Draft.css'
import './App.css'
import TodoEditor from './components/TodoEditor'
import Custom from './components/Custom'
import SlateEditor from './components/SlateEditor'

function App() {
  return (
    <div className="container">
      {/* <TodoEditor /> */}
      {/* <Custom /> */}
      <SlateEditor />
    </div>
  );
}

export default App;
