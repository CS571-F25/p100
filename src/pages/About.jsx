import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

function About() {

  // 从 localStorage 取数据
  const [likes, setLikes] = useState(() => {
    return Number(localStorage.getItem("aboutLikes")) || 0;
  });

  const [liked, setLiked] = useState(() => {
    return localStorage.getItem("aboutLiked") === "true";
  });

  function handleLike() {
    let newLikes = likes;
    let newLiked = liked;

    if (liked) {
      newLikes = likes - 1;
      newLiked = false;
    } else {
      newLikes = likes + 1;
      newLiked = true;
    }

    setLikes(newLikes);
    setLiked(newLiked);

    // 保存到 localStorage
    localStorage.setItem("aboutLikes", newLikes);
    localStorage.setItem("aboutLiked", newLiked);
  }

  return (
    <div style={{ 
      width: "100%", 
      minHeight: "100vh",
      paddingTop: "80px",
      display: "flex", 
      justifyContent: "center",
      background: "linear-gradient(to bottom, #ffffffff, #fcd9d9ff)" 
    }}>
      <Container style={{ width: "100%", maxWidth: "100%", padding: "20px" }}>

        <h1 style={{ 
          fontFamily: "'Dancing Script', cursive",
          color: 'black',
          textAlign: 'center' 
        }}>
          About Me
        </h1>

        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          marginTop: "40px",
          padding: "0 40px",
          flexWrap: "wrap"
        }}>
          
          <img 
            src="https://i.ibb.co/7xytZVLR/IMG-7075.jpg"   
            alt="Emma"
            style={{
              width: "280px",
              height: "280px",
              objectFit: "cover",
              borderRadius: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          />

          <p style={{ 
            fontFamily: "'Courgette', cursive",
            fontSize: "20px",
            lineHeight: "1.6",
            maxWidth: "500px",
            textAlign: "left"
          }}>
            Hi! I'm Emma — an international student living in the United States. 
            I created Journeyly as a personal space to record my trips, daily life, 
            and the little moments that shape my journey. This website is my way of 
            preserving beautiful memories and sharing them with anyone who enjoys 
            exploring new places and finding joy in simple things.
            <br/><br/>
            From road trips and city walks to everyday experiences on campus, 
            Journeyly is a collection of the places I’ve been, the people I’ve met, 
            and the memories I never want to forget. Thank you for visiting — 
            I hope my stories bring a little warmth, inspiration, or curiosity to your day.
          </p>
        </div>

        {/* ❤️ 点赞区域 */}
        <div style={{
          marginTop: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px"
        }}>
          <button
            onClick={handleLike}
            style={{
              fontSize: "40px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: liked ? "red" : "#444",
              transition: "0.2s"
            }}
          >
            {liked ? "❤️" : "🤍"}
          </button>

          <span style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "20px",
            color: "#333"
          }}>
            {likes} likes
          </span>
        </div>

      </Container>
    </div>
  );
}

export default About;