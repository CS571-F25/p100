import { useState } from "react";
import { Container, Form, Button, Card, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage() {
  const navigate = useNavigate();
  
  // 登录
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // 注册
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  // 忘记密码
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 登录
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setMessage({ 
          type: "success", 
          text: `✅ Welcome back, ${userData.name}!` 
        });
      } else {
        setMessage({ type: "success", text: "✅ Login successful!" });
      }
      
      setTimeout(() => navigate("/"), 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. ";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage += "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage += "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage += "Too many failed attempts. Try again later.";
          break;
        default:
          errorMessage += error.message;
      }
      
      setMessage({ type: "danger", text: `❌ ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  }

  // 注册
  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (signupPassword !== signupConfirmPassword) {
      setMessage({ type: "danger", text: "❌ Passwords don't match!" });
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setMessage({ type: "danger", text: "❌ Password must be at least 6 characters!" });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupEmail, 
        signupPassword
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: signupEmail,
        name: signupName,
        role: "friend",
        createdAt: new Date().toISOString(),
        pinsCount: 0
      });

      setMessage({ 
        type: "success", 
        text: `✅ Account created successfully! Welcome, ${signupName}!` 
      });
      
      setTimeout(() => navigate("/"), 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. ";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage += "This email is already registered.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage += "Password is too weak.";
          break;
        default:
          errorMessage += error.message;
      }
      
      setMessage({ type: "danger", text: `❌ ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  }

  // 忘记密码
  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage({ 
        type: "success", 
        text: "✅ Password reset email sent! Check your inbox." 
      });
      setShowResetForm(false);
      setResetEmail("");
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({ 
        type: "danger", 
        text: `❌ Failed to send reset email: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      paddingTop: "80px",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
    }}>
      <Container style={{ maxWidth: "500px" }}>
        
        <h1 style={{
          fontFamily: "'Pacifico', cursive",
          textAlign: "center",
          marginBottom: "30px",
          color: "#333"
        }}>
          Welcome to Journeyly! ✨
        </h1>

        {message.text && (
          <Alert 
            variant={message.type} 
            onClose={() => setMessage({ type: "", text: "" })} 
            dismissible
          >
            {message.text}
          </Alert>
        )}

        {!showResetForm ? (
          <Card style={{ 
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "15px"
          }}>
            <Tabs defaultActiveKey="login" className="mb-3">
              
              <Tab eventKey="login" title="Login">
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontFamily: "'Pacifico', cursive",
                      background: "#ff8fa3",
                      border: "none",
                      fontSize: "16px"
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <div style={{ textAlign: "center", marginTop: "15px" }}>
                    <Button 
                      variant="link" 
                      onClick={() => setShowResetForm(true)}
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        color: "#ff8fa3",
                        textDecoration: "none"
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                </Form>
              </Tab>

              <Tab eventKey="signup" title="Sign Up">
                <Form onSubmit={handleSignup}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontFamily: "'Pacifico', cursive",
                      background: "#ff8fa3",
                      border: "none",
                      fontSize: "16px"
                    }}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <p style={{
                    textAlign: "center",
                    marginTop: "15px",
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "14px",
                    color: "#666"
                  }}>
                    By signing up, you can add pins to Emma's map! 📍
                  </p>
                </Form>
              </Tab>
            </Tabs>
          </Card>
        ) : (
          <Card style={{ 
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "15px"
          }}>
            <h4 style={{
              fontFamily: "'Pacifico', cursive",
              textAlign: "center",
              marginBottom: "20px"
            }}>
              Reset Password
            </h4>
            
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <Form.Text className="text-muted">
                  We'll send you a password reset link
                </Form.Text>
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontFamily: "'Pacifico', cursive",
                  background: "#ff8fa3",
                  border: "none",
                  fontSize: "16px",
                  marginBottom: "10px"
                }}
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>

              <Button
                variant="link"
                onClick={() => setShowResetForm(false)}
                style={{
                  width: "100%",
                  fontFamily: "'Dancing Script', cursive",
                  color: "#666"
                }}
              >
                Back to Login
              </Button>
            </Form>
          </Card>
        )}

      </Container>
    </div>
  );
}