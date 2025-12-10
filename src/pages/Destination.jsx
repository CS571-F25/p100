import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Import all child components
import PhotoGallery from "../components/PhotoGallery";
import StorySection from "../components/StorySection";
import HighlightsList from "../components/HighlightsList";
import TravelTips from "../components/TravelTips";

export default function Destination() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 映射：URL里的id → Firebase里的destinationId
  const ID_MAP = {
    ny: "nyc",
    ca: "los-angeles",
    sd: "san-diego",
    chi: "chicago",
    sf: "san-francisco",
    // 以后添加新城市，只在这里加一行
  };

  useEffect(() => {
    async function fetchDestination() {
      try {
        const destinationId = ID_MAP[id] || id;
        const docRef = doc(db, "destinations", destinationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.log("No such destination!");
        }
      } catch (error) {
        console.error("Error fetching destination:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        paddingTop: "80px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
      }}>
        <p style={{
          fontFamily: "'Pacifico', cursive",
          fontSize: "24px",
          color: "#333"
        }}>
          Loading... ✨
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        paddingTop: "80px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: "48px",
            color: "#333",
            marginBottom: "20px"
          }}>
            Destination not found 😢
          </h1>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "20px",
            color: "#666"
          }}>
            We couldn't find this destination in our database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      paddingTop: "80px",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
    }}>
      <Container style={{ padding: "20px" }}>
        
        {/* Header */}
        <h1 style={{
          fontFamily: "'Pacifico', cursive",
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "48px",
          color: "#333"
        }}>
          {data.title} {data.emoji}
        </h1>

        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "20px",
          lineHeight: "1.6",
          maxWidth: "700px",
          margin: "0 auto 40px",
          textAlign: "center",
          color: "#555"
        }}>
          {data.description}
        </p>

        {/* Child Components - 只在有数据时显示 */}
        {data.photos && data.photos.length > 0 && (
          <PhotoGallery photos={data.photos} />
        )}
        
        {data.story && (
          <StorySection 
            emoji={data.story.emoji}
            title={data.story.title}
            content={data.story.content}
          />
        )}
        
        {data.highlights && data.highlights.length > 0 && (
          <HighlightsList highlights={data.highlights} />
        )}
        
        {data.tips && data.tips.length > 0 && (
          <TravelTips tips={data.tips} />
        )}

      </Container>
    </div>
  );
}