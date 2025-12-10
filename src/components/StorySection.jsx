export default function StorySection({ title, content, emoji }) {
  return (
    <div style={{
      marginTop: "40px",
      marginBottom: "40px",
      padding: "30px",
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    }}>
      <h2 style={{
        fontFamily: "'Pacifico', cursive",
        textAlign: "center",
        marginBottom: "20px",
        color: "#333"
      }}>
        {emoji} {title}
      </h2>
      
      <p style={{
        fontFamily: "'Courgette', cursive",
        fontSize: "18px",
        lineHeight: "1.8",
        color: "#555",
        textAlign: "justify",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {content}
      </p>
    </div>
  );
}