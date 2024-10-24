import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Certificate } from './Certificate'
import { SignInSide } from './SignIn'

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path='/' element={<SignInSide />} />
        <Route path='/certificado' element={<Certificate />} />
      </Routes>
    </Router>
  )
}

export default App
