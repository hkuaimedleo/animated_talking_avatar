import { Environment, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";
import { TEXTURE_PATH } from "../constant";
import PropTypes from "prop-types";

// Add your avatar presets here
const AVATAR_PRESETS = {
  "/models/female.glb": { position: [0, -5, 5], scale: 3 },
  "/models/male.glb": { position: [0, -5, 5], scale: 3 },
  "/models/cartoon.glb": { position: [0, -5, 1.5], scale: 3 },
  // Add more avatars and their presets as needed
};

const Experience = ({
  speakingText,
  speak,
  setSpeak,
  voiceURI,
  onSpeechStart,
  onSpeechEnd,
  maxMouthOpen = 0.5,
  avatarModel,
  background = "/textures/avatarBackground.png",
}) => {
  const texture = useTexture(background);
  const viewport = useThree((state) => state.viewport);

  // Get preset or fallback to default
  const { position = [0, -5, 5], scale = 3 } = AVATAR_PRESETS[avatarModel] || {};

  return (
    <>
      {/* <OrbitControls /> */}
      <Avatar
        position={position}
        scale={scale}
        text={speakingText}
        speak={speak}
        setSpeak={setSpeak}
        voiceURI={voiceURI}
        onSpeechStart={onSpeechStart}
        onSpeechEnd={onSpeechEnd}
        maxMouthOpen={maxMouthOpen}
        modelPath={avatarModel}
      />{" "}
      {/* Position [] take three values first is x, second is y, third is z. This is use to change the view of avatar and scale is use to handle avatar zoom */}
      <Environment preset="sunset" />{" "}
      {/*Adds realistic lighting & reflections. */}
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
};

Experience.propTypes = {
  speakingText: PropTypes.string.isRequired,
  speak: PropTypes.bool.isRequired,
  setSpeak: PropTypes.func.isRequired,
  voiceURI: PropTypes.string,
  onSpeechStart: PropTypes.func,
  onSpeechEnd: PropTypes.func,
  avatarModel: PropTypes.string,
  background: PropTypes.string,
};

export default Experience;
