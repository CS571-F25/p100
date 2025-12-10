import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db, auth, storage } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 编辑模式
  const [editMode, setEditMode] = useState(false);
  const [existingDestinations, setExistingDestinations] = useState([]);
  const [showDestinationList, setShowDestinationList] = useState(false);

  // Destination基本信息
  const [destinationId, setDestinationId] = useState("");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");

  // Story section
  const [storyEmoji, setStoryEmoji] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  // Photos
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);

  // Highlights
  const [highlights, setHighlights] = useState([
    { emoji: "", title: "", description: "" }
  ]);

  // Tips
  const [tips, setTips] = useState([""]);

  // Status
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 检查用户权限
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          if (data.role === "admin") {
            setIsAdmin(true);
            loadExistingDestinations();
          } else {
            setIsAdmin(false);
            setMessage({ 
              type: "warning", 
              text: "⚠️ You don't have admin access." 
            });
          }
        }
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // 加载现有的destinations
  async function loadExistingDestinations() {
    try {
      const snapshot = await getDocs(collection(db, "destinations"));
      const dests = [];
      snapshot.forEach((doc) => {
        dests.push({ id: doc.id, ...doc.data() });
      });
      setExistingDestinations(dests);
    } catch (error) {
      console.error("Error loading destinations:", error);
    }
  }

  // 加载destination数据进行编辑
  async function loadDestinationForEdit(destId) {
    try {
      const docRef = doc(db, "destinations", destId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        setDestinationId(data.id || destId);
        setTitle(data.title || "");
        setEmoji(data.emoji || "");
        setDescription(data.description || "");
        
        setStoryEmoji(data.story?.emoji || "");
        setStoryTitle(data.story?.title || "");
        setStoryContent(data.story?.content || "");
        
        setPhotos(data.photos || []);
        setPhotoFiles(new Array(data.photos?.length || 0).fill(null));
        
        setHighlights(data.highlights || [{ emoji: "", title: "", description: "" }]);
        setTips(data.tips || [""]);
        
        setEditMode(true);
        setShowDestinationList(false);
        setMessage({ type: "info", text: `📝 Editing: ${data.title}` });
      }
    } catch (error) {
      console.error("Error loading destination:", error);
      setMessage({ type: "danger", text: `❌ Error: ${error.message}` });
    }
  }

  // 删除destination
  async function handleDelete(destId) {
    if (!window.confirm(`Are you sure you want to delete "${destId}"? This cannot be undone!`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "destinations", destId));
      setMessage({ type: "success", text: `✅ "${destId}" deleted successfully!` });
      loadExistingDestinations();
    } catch (error) {
      console.error("Error deleting:", error);
      setMessage({ type: "danger", text: `❌ Delete failed: ${error.message}` });
    }
  }

  // 清空表单
  function resetForm() {
    setDestinationId("");
    setTitle("");
    setEmoji("");
    setDescription("");
    setStoryEmoji("");
    setStoryTitle("");
    setStoryContent("");
    setPhotos([]);
    setPhotoFiles([]);
    setHighlights([{ emoji: "", title: "", description: "" }]);
    setTips([""]);
    setEditMode(false);
  }

  // 添加photo输入框
  function addPhotoInput() {
    setPhotos([...photos, { url: "", caption: "", date: "" }]);
    setPhotoFiles([...photoFiles, null]);
  }

  // 更新photo信息
  function updatePhoto(index, field, value) {
    const newPhotos = [...photos];
    newPhotos[index][field] = value;
    setPhotos(newPhotos);
  }

  // 选择photo文件
  function handlePhotoFileChange(index, file) {
    const newPhotoFiles = [...photoFiles];
    newPhotoFiles[index] = file;
    setPhotoFiles(newPhotoFiles);
  }

  // 删除photo
  function removePhoto(index) {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  }

  // 添加highlight
  function addHighlight() {
    setHighlights([...highlights, { emoji: "", title: "", description: "" }]);
  }

  // 更新highlight
  function updateHighlight(index, field, value) {
    const newHighlights = [...highlights];
    newHighlights[index][field] = value;
    setHighlights(newHighlights);
  }

  // 删除highlight
  function removeHighlight(index) {
    setHighlights(highlights.filter((_, i) => i !== index));
  }

  // 添加tip
  function addTip() {
    setTips([...tips, ""]);
  }

  // 更新tip
  function updateTip(index, value) {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  }

  // 删除tip
  function removeTip(index) {
    setTips(tips.filter((_, i) => i !== index));
  }

  // 上传照片到Firebase Storage
  async function uploadPhotoToStorage(file, destinationId, index) {
    const timestamp = Date.now();
    const storageRef = ref(storage, `destinations/${destinationId}/photo_${index}_${timestamp}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  // 提交表单
  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. 处理照片上传
      const uploadedPhotos = [];
      for (let i = 0; i < photos.length; i++) {
        if (photoFiles[i]) {
          // 新上传的照片
          const url = await uploadPhotoToStorage(photoFiles[i], destinationId, i);
          uploadedPhotos.push({
            url,
            caption: photos[i].caption,
            date: photos[i].date
          });
        } else if (photos[i].url) {
          // 保留原有的照片
          uploadedPhotos.push(photos[i]);
        }
      }

      // 2. 组装destination数据
      const destinationData = {
        id: destinationId,
        title,
        emoji,
        description,
        story: {
          emoji: storyEmoji,
          title: storyTitle,
          content: storyContent
        },
        photos: uploadedPhotos,
        highlights: highlights.filter(h => h.title),
        tips: tips.filter(t => t)
      };

      // 3. 保存到Firestore
      await setDoc(doc(db, "destinations", destinationId), destinationData);

      setMessage({ 
        type: "success", 
        text: editMode 
          ? `✅ ${title} updated successfully!` 
          : `✅ ${title} created successfully!`
      });
      
      // 刷新列表
      loadExistingDestinations();
      
      // 清空表单
      setTimeout(() => {
        resetForm();
        setMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "danger", text: `❌ Save failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  }

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

  if (!isAdmin) {
    return (
      <div style={{
        paddingTop: "80px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
      }}>
        <Container style={{ maxWidth: "600px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Pacifico', cursive",
            marginBottom: "20px",
            color: "#333"
          }}>
            Access Denied 🔒
          </h1>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "20px",
            color: "#666",
            marginBottom: "30px"
          }}>
            Only Emma (admin) can access this page.
          </p>
          <Button
            onClick={() => navigate("/")}
            style={{
              fontFamily: "'Pacifico', cursive",
              background: "#ff8fa3",
              border: "none",
              padding: "12px 30px",
              fontSize: "18px"
            }}
          >
            Go to Home
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div style={{
      paddingTop: "80px",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #ffffff, #fcd9d9)"
    }}>
      <Container style={{ padding: "20px", maxWidth: "900px" }}>
        
        <h1 style={{
          fontFamily: "'Pacifico', cursive",
          textAlign: "center",
          marginBottom: "20px",
          color: "#333"
        }}>
          ✨ Manage Destinations
        </h1>

        {/* 按钮组 */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center"
        }}>
          <Button
            onClick={() => {
              resetForm();
              setShowDestinationList(false);
            }}
            style={{
              fontFamily: "'Pacifico', cursive",
              background: "#4CAF50",
              border: "none"
            }}
          >
            ➕ Create New
          </Button>
          
          <Button
            onClick={() => setShowDestinationList(!showDestinationList)}
            style={{
              fontFamily: "'Pacifico', cursive",
              background: "#2196F3",
              border: "none"
            }}
          >
            📋 {showDestinationList ? "Hide" : "Show"} All Destinations
          </Button>
        </div>

        {message.text && (
          <Alert variant={message.type} onClose={() => setMessage({ type: "", text: "" })} dismissible>
            {message.text}
          </Alert>
        )}

        {/* Destinations列表 */}
        {showDestinationList && (
          <Card style={{ marginBottom: "30px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              Existing Destinations ({existingDestinations.length})
            </h4>
            <ListGroup>
              {existingDestinations.map((dest) => (
                <ListGroup.Item key={dest.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}>
                  <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "18px" }}>
                    {dest.emoji} {dest.title} <code style={{ marginLeft: "10px" }}>({dest.id})</code>
                  </span>
                  <div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => loadDestinationForEdit(dest.id)}
                      style={{ marginRight: "10px", fontFamily: "'Pacifico', cursive" }}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(dest.id)}
                      style={{ fontFamily: "'Pacifico', cursive" }}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}

        <Form onSubmit={handleSubmit}>
          {/* 基本信息 */}
          <Card style={{ marginBottom: "20px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              📍 Basic Info
            </h4>
            
            <Form.Group className="mb-3">
              <Form.Label>Destination ID</Form.Label>
              <Form.Control
                type="text"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                placeholder="nyc"
                required
                disabled={editMode}
              />
              {editMode && (
                <Form.Text className="text-muted">
                  Cannot change ID in edit mode
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New York City"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Emoji</Form.Label>
              <Form.Control
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🗽"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Welcome to my NYC page..."
                required
              />
            </Form.Group>
          </Card>

          {/* Story Section */}
          <Card style={{ marginBottom: "20px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              📖 Story Section
            </h4>
            
            <Form.Group className="mb-3">
              <Form.Label>Story Emoji</Form.Label>
              <Form.Control
                type="text"
                value={storyEmoji}
                onChange={(e) => setStoryEmoji(e.target.value)}
                placeholder="📖"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Story Title</Form.Label>
              <Form.Control
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="My NYC Story"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Story Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="My first time in New York was..."
              />
            </Form.Group>
          </Card>

          {/* Photos */}
          <Card style={{ marginBottom: "20px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              📸 Photos
            </h4>
            
            {photos.map((photo, index) => (
              <div key={index} style={{
                padding: "15px",
                marginBottom: "15px",
                background: "#f8f9fa",
                borderRadius: "10px",
                position: "relative"
              }}>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removePhoto(index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px"
                  }}
                >
                  ✕
                </Button>

                <Form.Group className="mb-2">
                  <Form.Label>Photo {index + 1}</Form.Label>
                  {photo.url && (
                    <div style={{ marginBottom: "10px" }}>
                      <img src={photo.url} alt="preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                      <Form.Text className="text-muted d-block">Current photo (will be kept if no new file selected)</Form.Text>
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileChange(index, e.target.files[0])}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Caption</Form.Label>
                  <Form.Control
                    type="text"
                    value={photo.caption}
                    onChange={(e) => updatePhoto(index, "caption", e.target.value)}
                    placeholder="Times Square at night ✨"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={photo.date}
                    onChange={(e) => updatePhoto(index, "date", e.target.value)}
                    placeholder="2024-12-01"
                  />
                </Form.Group>
              </div>
            ))}

            <Button 
              variant="outline-primary" 
              onClick={addPhotoInput}
              style={{ width: "100%" }}
            >
              + Add Another Photo
            </Button>
          </Card>

          {/* Highlights */}
          <Card style={{ marginBottom: "20px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              ✨ Highlights
            </h4>
            
            {highlights.map((highlight, index) => (
              <div key={index} style={{
                padding: "15px",
                marginBottom: "15px",
                background: "#f8f9fa",
                borderRadius: "10px",
                position: "relative"
              }}>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeHighlight(index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px"
                  }}
                >
                  ✕
                </Button>

                <Form.Group className="mb-2">
                  <Form.Label>Emoji</Form.Label>
                  <Form.Control
                    type="text"
                    value={highlight.emoji}
                    onChange={(e) => updateHighlight(index, "emoji", e.target.value)}
                    placeholder="🗽"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={highlight.title}
                    onChange={(e) => updateHighlight(index, "title", e.target.value)}
                    placeholder="Statue of Liberty"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={highlight.description}
                    onChange={(e) => updateHighlight(index, "description", e.target.value)}
                    placeholder="Iconic symbol of freedom"
                  />
                </Form.Group>
              </div>
            ))}

            <Button 
              variant="outline-primary" 
              onClick={addHighlight}
              style={{ width: "100%" }}
            >
              + Add Another Highlight
            </Button>
          </Card>

          {/* Tips */}
          <Card style={{ marginBottom: "20px", padding: "20px" }}>
            <h4 style={{ fontFamily: "'Pacifico', cursive", marginBottom: "15px" }}>
              💡 Travel Tips
            </h4>
            
            {tips.map((tip, index) => (
              <div key={index} style={{ position: "relative", marginBottom: "15px" }}>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeTip(index)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    zIndex: 10
                  }}
                >
                  ✕
                </Button>
                <Form.Group>
                  <Form.Label>Tip {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={tip}
                    onChange={(e) => updateTip(index, e.target.value)}
                    placeholder="🚇 Get a MetroCard for unlimited subway rides"
                  />
                </Form.Group>
              </div>
            ))}

            <Button 
              variant="outline-primary" 
              onClick={addTip}
              style={{ width: "100%" }}
            >
              + Add Another Tip
            </Button>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={uploading}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "18px",
              fontFamily: "'Pacifico', cursive",
              background: "#ff8fa3",
              border: "none"
            }}
          >
            {uploading ? "Saving... ⏳" : editMode ? "💾 Update Destination" : "🚀 Create Destination"}
          </Button>
        </Form>

      </Container>
    </div>
  );
}