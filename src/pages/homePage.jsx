import { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { loadPins } from "../pins/pins";

mapboxgl.accessToken = "pk.eyJ1IjoiZW1tYTY2NjY2NjYiLCJhIjoiY21pNmZmbXYxMGFlbTJscHpnbDl2cHcxaiJ9.2U4UX-jcL3WTRjJUN8jBqA";



function HomePage() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
  if (mapRef.current) return;

  mapRef.current = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [-98.5, 39.8], 
    zoom: 3.5,
  });

  // 🟡 等地图加载完，再加载 Firebase 里的 pins
  mapRef.current.on("load", () => {
    loadPins(mapRef.current);
  });

  // Madison 默认 marker
  new mapboxgl.Marker({ color: "#5dade2" })
    .setLngLat([-89.4012, 43.0731])
    .setPopup(new mapboxgl.Popup().setHTML("<b>Madison</b>"))
    .addTo(mapRef.current);

  // ⭐ 修改点击事件 - 只在点击地图空白处时添加 pin
  mapRef.current.on("click", (e) => {
    // 检查是否点击了 marker 或 popup
    const features = mapRef.current.queryRenderedFeatures(e.point);
    
    // 如果点击的是 marker 区域，就不添加新 pin
    if (e.originalEvent.target.classList.contains('mapboxgl-marker') ||
        e.originalEvent.target.closest('.mapboxgl-marker') ||
        e.originalEvent.target.closest('.mapboxgl-popup')) {
      return; // ⭐ 直接返回，不创建新 pin
    }

    const { lng, lat } = e.lngLat;

    new mapboxgl.Marker({ color: "#ffbd77ff" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<b>New Pin</b><br/>Lng: ${lng.toFixed(4)}, Lat: ${lat.toFixed(4)}`
        )
      )
      .addTo(mapRef.current);

    setMarkers((prev) => [...prev, { lng, lat }]);
  });

  return () => {
    if (mapRef.current) mapRef.current.remove();
  };
}, []);

  return (
  <div style={{ 
    width: "100%", 
    minHeight: "100vh",  // 全屏高度
    paddingTop: "80px",  // 给 navbar 留空间
    display: "flex", 
    justifyContent: "center",
    background: "linear-gradient(to bottom, #ffffffff, #fcd9d9ff)" 
  }}>
    <Container style={{ 
      width: "100%",
      maxWidth: "100%",  
      padding: "20px"
    }}>
      <h1 style={{ 
        fontFamily: "'Dancing Script', cursive",
        color: 'black',
        textAlign: 'center' 
      }}>
        Welcome to Journeyly!
      </h1>
      <p style={{ fontWeight :20, fontFamily: "'Dancing Script',cursive", textAlign: 'center' }}>Every pin is a tiny piece of your story.
Start adding them and watch your Journeyly map fill with color,
adventure, and all the places that shaped you.</p>
      
      <div style={{ 
        display: "flex", 
        justifyContent: "center",
        marginTop: "20px" 
      }}>
        <div 
          ref={mapContainerRef}
          style={{
            width: "80%",  
            height: "600px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </Container>
  </div>
);
}

export default HomePage;