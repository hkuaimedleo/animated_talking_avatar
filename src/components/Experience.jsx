import { Environment, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";
import { TEXTURE_PATH } from "../constant";
import PropTypes from "prop-types";

const Experience = ({ speakingText, speak, setSpeak, voiceURI, onSpeechStart, onSpeechEnd }) => {
  const texture = useTexture(TEXTURE_PATH);
  const viewport = useThree((state) => state.viewport);

  return (
    <>
      {/* <OrbitControls /> */}{" "}
      <Avatar
        position={[0, -5, 5]}
        scale={3}
        text={speakingText}
        speak={speak}
        setSpeak={setSpeak}
        voiceURI={voiceURI}
        onSpeechStart={onSpeechStart}
        onSpeechEnd={onSpeechEnd}
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
};

export default Experience;
