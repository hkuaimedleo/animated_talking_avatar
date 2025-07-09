import React from "react";
import { RobotAvatar2D } from "./RobotAvatar2D";
import PropTypes from "prop-types";

const Experience2D = ({
  speakingText,
  speak,
  setSpeak,
  voiceURI,
  onSpeechStart,
  onSpeechEnd,
  robotTheme = "default",
  background = "/textures/default.png",
}) => {
  // 2D background styles
  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.3,
    zIndex: -1
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a'
    }}>
      {/* Background */}
      <div style={backgroundStyle} />
      
      {/* Robot Avatar */}
      <RobotAvatar2D
        text={speakingText}
        speak={speak}
        setSpeak={setSpeak}
        voiceURI={voiceURI}
        onSpeechStart={onSpeechStart}
        onSpeechEnd={onSpeechEnd}
        theme={robotTheme}
      />
    </div>
  );
};

Experience2D.propTypes = {
  speakingText: PropTypes.string.isRequired,
  speak: PropTypes.bool.isRequired,
  setSpeak: PropTypes.func.isRequired,
  voiceURI: PropTypes.string,
  onSpeechStart: PropTypes.func,
  onSpeechEnd: PropTypes.func,
  robotTheme: PropTypes.string,
  background: PropTypes.string,
};

export default Experience2D;
