import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "../components/Experience";
import Experience2D from "../components/Experience2D";
import { MdFullscreen, MdCloseFullscreen, MdVolumeUp } from "react-icons/md";

function AvatarView() {
  const [text, setText] = useState(
    "Hi there! Just wanted to check in and see how you're feeling today. Did you sleep okay? I hope you're having a comfortable morning so far. If there's anything you need or if you just feel like chatting for a bit, I'm always here. It's always nice to hear how you're doing."
  );
  const [speak, setSpeak] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [avatarModel, setAvatarModel] = useState("/models/female.glb");
  const [background, setBackground] = useState("/textures/default.png");
  const [is2DMode, setIs2DMode] = useState(false); // New state for 2D/3D mode
  const [robotTheme, setRobotTheme] = useState("default"); // New state for robot theme
  const containerRef = useRef(null);

  const avatarOptions = [
    { label: "Female", value: "/models/female.glb" },
    { label: "Male", value: "/models/male.glb" },
    { label: "Cartoon", value: "/models/cartoon.glb" },
    { label: "2D Robot", value: "2d-robot" }, // New 2D option
    // Add more avatars here as needed
  ];

  const backgroundOptions = [
    { label: "Default", value: "/textures/default.png" },
    { label: "Beach", value: "/textures/beach.jpg" },
    { label: "Living Room", value: "/textures/living_room.jpg" },
    // Add more backgrounds as needed
  ];

  const robotThemeOptions = [
    { label: "Default", value: "default" },
    { label: "Friendly", value: "friendly" },
    { label: "Serious", value: "serious" },
    { label: "Retro", value: "retro" },
  ];

  const height = useMemo(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Increase the percentage for mobile and desktop
    return width < 768
      ? `${Math.round(height * 0.75)}px` // was 0.68
      : `${Math.round(width * 0.35)}px`;  // was 0.3
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current
        ?.requestFullscreen?.()
        .then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullScreen(false));
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    // Remove body margin
    const originalMargin = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = originalMargin;
    };
  }, []);

  // Fetch available voices
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      // Only keep voices with lang === "en-US"
      const enUSVoices = synthVoices.filter(v => v.lang === "en-US");
      setVoices(enUSVoices);
      if (enUSVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(enUSVoices[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Handle avatar model changes to set 2D mode
  const handleAvatarModelChange = (value) => {
    setAvatarModel(value);
    setIs2DMode(value === "2d-robot");
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#2d2d2d",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: height,
          transition: "all 0.3s ease",
          backgroundColor: "#2d2d2d",
          borderRadius: isFullScreen ? "0" : "15px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={toggleFullScreen}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.4)")
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
          }
          title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullScreen ? (
            <MdCloseFullscreen size={25} />
          ) : (
            <MdFullscreen size={25} />
          )}
        </button>

        {is2DMode ? (
          <Experience2D
            speakingText={text}
            speak={speak}
            setSpeak={setSpeak}
            voiceURI={selectedVoice}
            onSpeechStart={() => setSpeaking(true)}
            onSpeechEnd={() => setSpeaking(false)}
            robotTheme={robotTheme}
            background={background}
          />
        ) : (
          <Canvas
            shadows
            camera={{ position: [0, 0, 10], fov: 20 }}
            style={{
              height: "100%",
              width: "100%",
              transition: "all 0.3s ease",
            }}
          >
            <color attach="background" args={["#2d2d2d"]} />
            <Experience
              key={avatarModel}
              speakingText={text}
              speak={speak}
              setSpeak={setSpeak}
              voiceURI={selectedVoice}
              onSpeechStart={() => setSpeaking(true)}
              onSpeechEnd={() => setSpeaking(false)}
              avatarModel={avatarModel}
              background={background}
            />
          </Canvas>
        )}
      </div>

      {!isFullScreen && (
        <div
          style={{
            width: "100%",
            height: "20vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 20px",
            backgroundColor: "rgba(45, 45, 45, 0.9)",
            boxSizing: "border-box",
          }}
        >
          <textarea
            rows={4}
            value={text}
            placeholder="Type something..."
            style={{
              padding: "10px",
              width: "70%",
              borderRadius: "10px",
              border: "1px solid #555",
              resize: "none",
              fontSize: "16px",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box",
            }}
            onChange={(e) => setText(e.target.value)}
          />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px", marginRight: "10px" }}>
            <select
              id="avatar-select"
              value={avatarModel}
              onChange={e => handleAvatarModelChange(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#1e1e1e",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "8px"
              }}
              title="Choose avatar"
            >
              {avatarOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              id="voice-select"
              value={selectedVoice || ""}
              onChange={e => setSelectedVoice(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#1e1e1e",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "8px"
              }}
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} {voice.lang} {voice.default ? "(default)" : ""}
                </option>
              ))}
            </select>
            <select
              id="background-select"
              value={background}
              onChange={e => setBackground(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#1e1e1e",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "8px"
              }}
              title="Choose background"
            >
              {backgroundOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {is2DMode && (
              <select
                id="robot-theme-select"
                value={robotTheme}
                onChange={e => setRobotTheme(e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #555",
                  backgroundColor: "#1e1e1e",
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "8px"
                }}
                title="Choose robot theme"
              >
                {robotThemeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => {
              setSpeak(true);
            }}
            disabled={speaking}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: speaking ? "#888" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: speaking ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!speaking) e.target.style.backgroundColor = "#45a049";
            }}
            onMouseLeave={(e) => {
              if (!speaking) e.target.style.backgroundColor = "#4CAF50";
            }}
          >
            <MdVolumeUp size={20} style={{ marginRight: "8px" }} />
            Speak
          </button>
          <button
            onClick={() => setIs2DMode(!is2DMode)}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: is2DMode ? "#007BFF" : "#555",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
          >
            {is2DMode ? "Switch to 3D" : "Switch to 2D"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AvatarView;
