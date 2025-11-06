import { useState } from 'react'
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function Home() {
  return (
    <div className="text-center">
      <h2 className="mt-5">🏠 Home Page</h2>
      <p>Welcome to my first React + Bootstrap app!</p>
    </div>
  );
}

function About() {
  return (
    <div className="text-center">
      <h2 className="mt-5">ℹ️ About Page</h2>
      <p>This page was built using React Router and Bootstrap ✨</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <HashRouter>
    
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold fs-4">My React Site</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="fs-5">Home</Nav.Link>
            <Nav.Link as={Link} to="/about" className="fs-5">About</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          height: "100vh",
          backgroundColor: "#f8f9fa",
          paddingTop: "80px" 
        }}
      >
        <div style={{ maxWidth: "700px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>

          <Button
            variant="success"
            size="lg"
            className="mt-4 px-5 py-3"
            onClick={() => setCount(count + 1)}
          >
            You clicked {count} times 💚
          </Button>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;