export default function TravelTips({ tips }) {
  return (
    <div style={{
      marginTop: "40px",
      marginBottom: "40px",
      padding: "30px",
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      borderRadius: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{
        fontFamily: "'Pacifico', cursive",
        textAlign: "center",
        marginBottom: "25px",
        color: "#333"
      }}>
        💡 Travel Tips
      </h2>
      
      <div style={{
        maxWidth: "700px",
        margin: "0 auto"
      }}>
        {tips.map((tip, index) => (
          <div key={index} style={{
            padding: "15px",
            marginBottom: "15px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "12px",
            borderLeft: "4px solid #ff8fa3"
          }}>
            <p style={{
              fontFamily: "'Courgette', cursive",
              fontSize: "17px",
              color: "#333",
              margin: 0
            }}>
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}