import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import { Leva } from "leva";

function App() {
  const [text, setText] = useState("");
  const [speak, setSpeak] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  const handleSpeak = () => setSpeak(true);

  // Toggle Full-Screen Mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen(); // Firefox
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen(); // Chrome, Safari, Opera
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen(); // IE/Edge
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  // Listen for Full-Screen Exit (ESC Key)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullScreen ? "100vh" : "95vh",
        transition: "all 0.3s ease",
        backgroundColor: "#ececec",
      }}
    >
      <Leva hidden /> {/* Hide Leva UI Controls */}

      {/* Full-Screen Toggle Button */}
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          padding: "8px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          zIndex: 10, // Ensure button stays above canvas
        }}
      >
        {isFullScreen ? "Exit Full Screen" : "Full Screen"}
      </button>

      {/* 3D Avatar Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0, isFullScreen ? 8 : 10], fov: isFullScreen ? 15 : 20 }}
        style={{
          height: "100%",
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <Experience speakingText={text} speak={speak} setSpeak={setSpeak} />
      </Canvas>

      {/* UI Controls: Text Input & Speak Button */}
      {!isFullScreen && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <textarea
            rows={5}
            value={text}
            placeholder="Type something..."
            style={{ marginTop: "10px", marginBottom: "10px" }}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleSpeak}>Speak</button>
        </div>
      )}
    </div>
  );
}

export default App;
