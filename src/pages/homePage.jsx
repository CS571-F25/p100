import { useEffect, useRef, useState } from "react";
import { Container, Button, Modal, Form } from 'react-bootstrap';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { db, auth, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { loadPins } from "../pins/pins";

mapboxgl.accessToken = "pk.eyJ1IjoiZW1tYTY2NjY2NjYiLCJhIjoiY21pNmZmbXYxMGFlbTJscHpnbDl2cHcxaiJ9.2U4UX-jcL3WTRjJUN8jBqA";

function HomePage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newPin, setNewPin] = useState({ lng: 0, lat: 0 });
  const [pinName, setPinName] = useState("");
  const [pinDate, setPinDate] = useState("");
  const [pinPhoto, setPinPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // 监听登录状态
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ⭐ 修复：改成空数组依赖，地图只初始化一次
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5, 39.8], 
      zoom: 2.3,
    });

    // 加载已有的pins
    mapRef.current.on("load", () => {
      loadPins(mapRef.current);
    });


    // 点击地图添加pin
    mapRef.current.on("click", (e) => {
      // 检查是否点击了marker或popup
      if (e.originalEvent.target.classList.contains('mapboxgl-marker') ||
          e.originalEvent.target.closest('.mapboxgl-marker') ||
          e.originalEvent.target.closest('.mapboxgl-popup')) {
        return;
      }

      // ⭐ 修复：直接从auth获取当前用户，而不依赖state
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { lng, lat } = e.lngLat;
        setNewPin({ lng, lat });
        setShowModal(true);
      } else {
        alert("Please login to add pins! 📍");
      }
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []); // ⭐ 关键修复：空数组，只运行一次

  // 上传照片到Storage
  async function uploadPhoto(file) {
    const timestamp = Date.now();
    const storageRef = ref(storage, `pins/${user.uid}_${timestamp}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  // 保存pin到Firestore
  async function handleSavePin() {
    if (!pinName) {
      alert("Please enter a pin name!");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = "";
      
      // 如果有照片，先上传
      if (pinPhoto) {
        imageUrl = await uploadPhoto(pinPhoto);
      }

      // 保存pin到Firestore
      await addDoc(collection(db, "pins"), {
        name: pinName,
        date: pinDate || new Date().toISOString().split('T')[0],
        lng: newPin.lng,
        lat: newPin.lat,
        image: imageUrl,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString()
      });

      // 在地图上显示新pin
      const PIN_COLORS = [
        "#ff8fa3", "#ffb3c6", "#ffc8dd", "#a3c4f3", 
        "#90dbf4", "#8eecf5", "#b9fbc0"
      ];
      const randomColor = PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)];

      const popupHTML = `
        <div style="padding: 10px; width: 220px; font-family: 'Pacifico', cursive;">
          <h4 style="margin: 0 0 8px 0; font-size: 18px;">${pinName}</h4>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #666;">📅 ${pinDate}</p>
          ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" />` : ''}
        </div>
      `;

      new mapboxgl.Marker({ color: randomColor })
        .setLngLat([newPin.lng, newPin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML))
        .addTo(mapRef.current);

      // 关闭modal，清空表单
      setShowModal(false);
      setPinName("");
      setPinDate("");
      setPinPhoto(null);
      
      alert("Pin added successfully! 🎉");
    } catch (error) {
      console.error("Error saving pin:", error);
      alert(`Failed to save pin: ${error.message}`);
    } finally {
      setUploading(false);
    }
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
        <p style={{ 
          fontWeight: 20, 
          fontFamily: "'Courgette', cursive",
          textAlign: 'center' 
        }}>
          Every pin is a tiny piece of your story.
          Start adding them and watch your Journeyly map fill with color,
          adventure, and all the places that shaped you.
        </p>

        {!user && (
          <p style={{
            fontFamily: "'Caveat', cursive",
            textAlign: 'center',
            color: '#ff3c5fff',
            fontSize: '18px',
            marginTop: '10px'
          }}>
            👉 Login to add your own pins to the map!
          </p>
        )}
        
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

      {/* Add Pin Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "'Pacifico', cursive" }}>
            📍 Add New Pin
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Location Name *</Form.Label>
              <Form.Control
                type="text"
                value={pinName}
                onChange={(e) => setPinName(e.target.value)}
                placeholder="e.g., Central Park, My Favorite Cafe"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date (optional)</Form.Label>
              <Form.Control
                type="date"
                value={pinDate}
                onChange={(e) => setPinDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Photo (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setPinPhoto(e.target.files[0])}
              />
            </Form.Group>

            <div style={{
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                fontFamily: "'Dancing Script', cursive" 
              }}>
                📍 Lng: {newPin.lng.toFixed(4)}, Lat: {newPin.lat.toFixed(4)}
              </p>
            </div>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSavePin}
            disabled={uploading}
            style={{
              background: '#ff8fa3',
              border: 'none',
              fontFamily: "'Pacifico', cursive"
            }}
          >
            {uploading ? "Saving..." : "Save Pin 📍"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default HomePage;