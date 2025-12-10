import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "react-bootstrap";

export default function LikeButton({ destinationId }) {
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 监听登录状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 用户登录后，检查是否已点赞
        setHasLiked(likes.includes(currentUser.uid));
      } else {
        setHasLiked(false);
      }
    });
    return () => unsubscribe();
  }, [likes]);

  useEffect(() => {
    loadLikes();
  }, [destinationId]);

  async function loadLikes() {
    try {
      const docRef = doc(db, "destination_likes", destinationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const likesList = docSnap.data().likes || [];
        setLikes(likesList);
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          setHasLiked(likesList.includes(currentUser.uid));
        }
      } else {
        setLikes([]);
        setHasLiked(false);
      }
    } catch (error) {
      console.error("Error loading likes:", error);
    }
  }

  async function handleLike() {
    if (!user) {
      alert("Please login to like this destination! ❤️");
      return;
    }

    setLoading(true);

    try {
      const docRef = doc(db, "destination_likes", destinationId);
      
      if (hasLiked) {
        // 取消点赞
        await updateDoc(docRef, {
          likes: arrayRemove(user.uid)
        });
        setLikes(likes.filter(uid => uid !== user.uid));
        setHasLiked(false);
      } else {
        // 点赞
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            likes: arrayUnion(user.uid)
          });
        } else {
          // 第一次点赞，创建文档
          await setDoc(docRef, {
            destinationId,
            likes: [user.uid]
          });
        }
        
        setLikes([...likes, user.uid]);
        setHasLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      marginTop: "40px",
      marginBottom: "20px"
    }}>
      <Button
        onClick={handleLike}
        disabled={loading}
        style={{
          fontSize: "40px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: hasLiked ? "red" : "#444",
          transition: "0.2s",
          padding: "0"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {hasLiked ? "❤️" : "🤍"}
      </Button>

      <span style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: "20px",
        color: "#333"
      }}>
        {likes.length} {likes.length === 1 ? "like" : "likes"}
      </span>
    </div>
  );
}