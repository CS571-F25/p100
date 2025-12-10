export default function PhotoGallery({ photos }) {
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
        📸 Photo Gallery
      </h2>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
      }}>
        {photos.map((photo, index) => (
          <div key={index} style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            background: "white",
            transition: "transform 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover"
              }}
            />
            <div style={{ padding: "15px" }}>
              <p style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "16px",
                color: "#555",
                margin: "0 0 8px 0"
              }}>
                {photo.caption}
              </p>
              {photo.date && (
                <p style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "14px",
                  color: "#888",
                  margin: 0
                }}>
                  📅 {photo.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}