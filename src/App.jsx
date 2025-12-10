import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import HomePage from "./pages/homePage"
import About from "./pages/About"
import AuthPage from "./pages/AuthPage"
import AdminPage from "./pages/AdminPage"
import DestinationRouter from "./DestinationRouter.jsx";

// 导航栏组件（带登录状态）
function NavigationBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <Navbar 
      style={{background: "linear-gradient(90deg, #ff9a9e, #fad0c4)"}} 
      variant="dark" 
      expand="lg" 
      fixed="top"
    >
      <Container fluid>
        <Navbar.Brand 
          as={Link} 
          to="/"
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: "black", 
            fontSize: 36
          }} 
          className="fw-bold"
        >
          Journeyly
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" style={{ alignItems: 'center' }}>
            <Nav.Link 
              as={Link} 
              to="/" 
              className="fs-5" 
              style={{ 
                fontFamily: "'Dancing Script', cursive",
                color: 'black',
                marginRight: '15px'
              }}
            >
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/about" 
              className="fs-5" 
              style={{ 
                fontFamily: "'Dancing Script', cursive",
                color: 'black',
                marginRight: '15px'
              }}
            >
              About
            </Nav.Link>

            {/* 只有admin能看到 */}
            {userData && userData.role === 'admin' && (
              <Nav.Link 
                as={Link} 
                to="/admin" 
                className="fs-5"
                style={{ 
                  fontFamily: "'Dancing Script', cursive",
                  color: 'black',
                  marginRight: '15px'
                }}
              >
                Admin
              </Nav.Link>
            )}

            {user ? (
              <>
                <span style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: '16px',
                  color: 'black',
                  marginRight: '15px'
                }}>
                  Hi, {userData?.name || user.email} 👋
                </span>
                
                <Button
                  onClick={handleLogout}
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: '16px',
                    background: '#ff8fa3',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '20px'
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                as={Link}
                to="/auth"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: '16px',
                  background: '#ff8fa3',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px'
                }}
              >
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  return (
    <HashRouter>
      <NavigationBar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/destination/:id" element={<DestinationRouter />} />
      </Routes>
    </HashRouter>
  );
}

export default App;