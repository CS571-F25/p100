import mapboxgl from "mapbox-gl";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export async function loadPins(map) {
  const snapshot = await getDocs(collection(db, "pins"));

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    console.log("Loading pin:", data);

    // ⭐ 直接写 HTML 字符串
    const popupHTML = `
      <div style="padding: 10px; width: 220px; font-family: 'Pacifico', cursive; background-color: #fff;">
        <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #333;">
          ${data.name}
        </h4>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #666;">
          📅 ${data.date}
        </p>
        ${data.image ? `
          <img
            src="${data.image}"
            alt="${data.name}"
            style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; display: block; margin-bottom: 10px;"
          />
        ` : ''}
        <button 
          onclick="window.location.hash = '/ny'"
          style="
            width: 100%;
            padding: 8px;
            background-color: #ff8fa3;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            font-family: 'Pacifico', cursive;
          "
        >
          View Details →
        </button>
      </div>
    `;

    new mapboxgl.Marker({ color: "#ff8fa3" })
      .setLngLat([data.lng, data.lat])
      .setPopup(
        new mapboxgl.Popup({ 
          offset: 25,
          maxWidth: "260px",
          className: "custom-popup"
        }).setHTML(popupHTML)
      )
      .addTo(map);
  });
}