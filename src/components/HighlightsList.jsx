export default function HighlightsList({ highlights }) {
  return (
    <div style={{
      marginTop: "40px",
      marginBottom: "40px"
    }}>
      <h2 style={{
        fontFamily: "'Pacifico', cursive",
        textAlign: "center",
        marginBottom: "30px",
        color: "#333"
      }}>
        ✨ Highlights
      </h2>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        {highlights.map((item, index) => (
          <div key={index} style={{
            padding: "20px",
            background: "white",
            borderRadius: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "transform 0.3s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>
              {item.emoji}
            </div>
            <h3 style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "20px",
              marginBottom: "10px",
              color: "#333"
            }}>
              {item.title}
            </h3>
            <p style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "16px",
              color: "#666",
              margin: 0
            }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}