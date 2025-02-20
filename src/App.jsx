import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import { Leva } from "leva";
function App() {
  const [text, setText] = useState("");
  const [speak, setSpeak] = useState(false);

  const handleSpeak = () => setSpeak(true);

  return (
    <div
      style={{
        height: "95vh",
      }}
    >
      <Leva hidden /> {/* This keeps the controls but hides the UI */}
      {/** Position is use to change the view of full screen avatar it take three values first is x, second is y, third is z. fov is use to zoom the avatar in inverse order */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 20 }}
        style={{
          height: "100%",
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <Experience speakingText={text} speak={speak} setSpeak={setSpeak} />
      </Canvas>
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
    </div>
  );
}

export default App;
