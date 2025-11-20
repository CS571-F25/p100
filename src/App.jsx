import { useState } from 'react'
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import HomePage from "./pages/homePage"
import About from "./pages/About"
import NY from "./destinations/ny";



function App() {
  const [count, setCount] = useState(0);

  return (
    <HashRouter>
      <Navbar style = {{background: "linear-gradient(90deg, #ff9a9e, #fad0c4)",}} variant="dark" expand="lg" fixed="top">
        <Container fluid>
          <Navbar.Brand  style={{
    fontFamily: "'Dancing Script', cursive",
    color: "black", fontSize : 36, textAlign:'center'
  }} href="#" className="fw-bold fs-4">Journeyly</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="fs-5" style={{ fontFamily: "'Dancing Script', cursive",color: 'black'}}>Home</Nav.Link>
            <Nav.Link as={Link} to="/about" className="fs-5" style={{ fontFamily: "'Dancing Script', cursive",color: 'black'}}>About</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/ny" element={<NY />} />

      </Routes>
    </HashRouter>
  );
}

export default App;