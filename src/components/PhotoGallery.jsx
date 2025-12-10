export default function PhotoGallery({ photos }) {
  return (
    <div style={{ marginTop: "40px", marginBottom: "40px" }}>
      <h2
        style={{
          fontFamily: "'Pacifico', cursive",
          textAlign: "center",
          marginBottom: "25px",
          color: "#333"
        }}
      >
        📸 Photo Gallery
      </h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "10px 0",
          scrollSnapType: "x mandatory",
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            style={{
              width: "400px",                     // ⭐ 图片不会太宽
              flexShrink: 0,
              borderRadius: "12px",
              overflow: "hidden",
              background: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              scrollSnapAlign: "start",
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              style={{
                width: "100%",                    // ⭐ 宽度固定
                height: "auto",                   // ⭐ 自动按比例缩放
                display: "block",
              }}
            />

            <div style={{ padding: "12px" }}>
              <p
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "16px",
                  margin: "0 0 8px",
                  color: "#555"
                }}
              >
                {photo.caption}
              </p>

              {photo.date && (
                <p
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "14px",
                    margin: 0,
                    color: "#888"
                  }}
                >
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
