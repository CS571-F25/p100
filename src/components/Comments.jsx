import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Form, Button, Card, Alert } from "react-bootstrap";

export default function Comments({ destinationId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState(null);

  // 监听登录状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadComments();
  }, [destinationId]);

  async function loadComments() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "destination_comments"),
        where("destinationId", "==", destinationId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const commentsList = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // 获取用户名
        let userName = data.userEmail;
        try {
          const userDoc = await getDoc(doc(db, "users", data.userId));
          if (userDoc.exists()) {
            userName = userDoc.data().name || data.userEmail;
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
        
        commentsList.push({
          id: docSnap.id,
          ...data,
          userName
        });
      }
      
      setComments(commentsList);
    } catch (error) {
      console.error("Error loading comments:", error);
      
      // 如果是index错误，给用户提示
      if (error.message.includes("index")) {
        alert("Please create Firebase index. Check console for the link.");
        console.error("Create index at:", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to comment! 💬");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setPosting(true);

    try {
      await addDoc(collection(db, "destination_comments"), {
        destinationId,
        userId: user.uid,
        userEmail: user.email,
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      });

      setNewComment("");
      
      // 立即重新加载评论
      await loadComments();
      
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  }

  return (
    <div style={{
      marginTop: "40px",
      marginBottom: "40px",
      maxWidth: "800px",
      margin: "40px auto"
    }}>
      <h2 style={{
        fontFamily: "'Pacifico', cursive",
        textAlign: "center",
        marginBottom: "30px",
        color: "#333"
      }}>
        💬 Comments ({comments.length})
      </h2>

      {/* 添加评论表单 */}
      <Card style={{
        marginBottom: "30px",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        {user ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "18px",
                color: "#333"
              }}>
                Share your thoughts...
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What did you love about this place?"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "16px"
                }}
              />
            </Form.Group>
            <Button
              type="submit"
              disabled={posting || !newComment.trim()}
              style={{
                fontFamily: "'Pacifico', cursive",
                background: "#ff8fa3",
                border: "none",
                padding: "10px 25px"
              }}
            >
              {posting ? "Posting..." : "💬 Post Comment"}
            </Button>
          </Form>
        ) : (
          <Alert variant="info" style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "16px",
            textAlign: "center",
            margin: 0
          }}>
            Please login to leave a comment 💬
          </Alert>
        )}
      </Card>

      {/* 评论列表 */}
      {loading ? (
        <p style={{
          textAlign: "center",
          fontFamily: "'Dancing Script', cursive",
          fontSize: "18px",
          color: "#666"
        }}>
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p style={{
          textAlign: "center",
          fontFamily: "'Dancing Script', cursive",
          fontSize: "18px",
          color: "#666"
        }}>
          No comments yet. Be the first to share your thoughts! ✨
        </p>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} style={{
            marginBottom: "15px",
            padding: "20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            border: "1px solid #f0f0f0"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px"
            }}>
              <span style={{
                fontFamily: "'Pacifico', cursive",
                fontSize: "16px",
                color: "#ff8fa3",
                fontWeight: "600"
              }}>
                {comment.userName}
              </span>
              <span style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "14px",
                color: "#888"
              }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p style={{
              fontFamily: "'Courgette', cursive",
              fontSize: "16px",
              color: "#333",
              margin: 0,
              lineHeight: "1.6"
            }}>
              {comment.content}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}