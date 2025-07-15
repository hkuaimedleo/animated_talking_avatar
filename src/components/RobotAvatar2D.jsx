import React, { useState, useEffect, useRef } from "react";
import { CORRESPONDING_VISEME } from "../constant";
import { ROBOT_THEMES } from "../robotConfig";

const VISEME_MIN_DURATION = 270;

// Adjust this value to control the randomness (e.g., 0.05 = ±5%)
const MOUTH_RANDOMNESS_RANGE = 0.05;

export function RobotAvatar2D(props) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const currentViseme = useRef(null);
  const visemeTimestamp = useRef(0);
  const [eyeState, setEyeState] = useState('normal'); // normal, blink, excited
  const [mouthState, setMouthState] = useState('idle'); // idle, talking, happy, sad
  const [eyeSrc, setEyeSrc] = useState("/images/eye.png");
  const eyeImg = useRef(null);
  const [mouthRandomness, setMouthRandomness] = useState({ width: 1, height: 1 });
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech is ongoing

  // Robot face configuration - use theme or default
  const robotConfig = ROBOT_THEMES[props.theme] || ROBOT_THEMES.default;

  // Load eye image
  useEffect(() => {
    const img = new window.Image();
    img.src = eyeSrc;
    eyeImg.current = img;
  }, [eyeSrc]);

  // Draw the baby face
  const drawBabyFace = (ctx, config) => {
    const { size, faceColor, eyeColor, mouthColor, screenGlow } = config;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw eyes
    drawEyes(ctx, centerX, centerY, eyeColor, eyeState);

    // Draw mouth based on current viseme
    drawMouth(ctx, centerX, centerY, mouthColor, currentViseme.current);

    // Add baby features
    drawBabyFeatures(ctx, centerX, centerY, size);
  };

  // Random blinking effect
  // useEffect(() => {

  //   const intervalId = setInterval(() => {

  //     if (Math.random() < 0.2) { // 20% chance to blink
  //       setEyeState('blink');
  //     } else {
  //       setEyeState('normal');
  //     }

  //   }, 3000); // Runs every 3000ms (3 seconds)

  //   // Cleanup function
  //   return () => {
  //     clearInterval(intervalId);
  //   };

  // }, []);

  let isBlinking = false;

  const drawEyes = (ctx, centerX, centerY, eyeColor, state) => {
    // Lower the eyes by increasing eyeY
    const eyeY = centerY + 10;
    const eyeSpacing = 180;
    const eyeWidth = 160;
    const eyeHeight = 120;

    if (!isBlinking) {
      isBlinking = true;
      state = "blink";
      setTimeout(() => {
        state = "normal";
        isBlinking = false;
      }, 2000 + Math.random() * 3000); // Random blink duration between 2000ms and 5000ms
    }

    // state = "blink";

    // state = "normal"; // Force normal state for now
    // console.log("Eye state:", state); // Debug: log current eye state

    if (state === "blink") {
      // Draw eyes as lines
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      // Left eye (line)
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing - eyeWidth / 3 + 10, eyeY);
      ctx.lineTo(centerX - eyeSpacing + eyeWidth / 3 - 20, eyeY);
      ctx.stroke();
      // Right eye (line)
      ctx.beginPath();
      ctx.moveTo(centerX + eyeSpacing - eyeWidth / 3 + 10, eyeY);
      ctx.lineTo(centerX + eyeSpacing + eyeWidth / 3 - 20, eyeY);
      ctx.stroke();
    } else {
      if (eyeImg.current && eyeImg.current.complete) {
        // Left eye
        ctx.drawImage(
          eyeImg.current,
          centerX - eyeSpacing - eyeWidth / 2,
          eyeY - eyeHeight / 2,
          eyeWidth,
          eyeHeight
        );
        // Right eye
        ctx.drawImage(
          eyeImg.current,
          centerX + eyeSpacing - eyeWidth / 2,
          eyeY - eyeHeight / 2,
          eyeWidth,
          eyeHeight
        );
      }
    }

    // Draw flat eyebrows above each eye
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    // Left eyebrow (flat)
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 40, eyeY - eyeHeight / 2 - 60);
    ctx.lineTo(centerX - eyeSpacing + 40, eyeY - eyeHeight / 2 - 60);
    ctx.stroke();
    // Right eyebrow (flat)
    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing - 40, eyeY - eyeHeight / 2 - 60);
    ctx.lineTo(centerX + eyeSpacing + 40, eyeY - eyeHeight / 2 - 60);
    ctx.stroke();
  };

  const drawMouth = (ctx, centerX, centerY, mouthColor, viseme) => {
    // Smile arc baseline
    const mouthY = centerY + 80;
    // For viseme ellipses/circles, shift down to align with smile arc
    const visemeYOffset = 60;

    let mouthWidth = 80;
    let mouthHeight = 20;

    // Apply randomness
    const widthRand = mouthRandomness.width;
    const heightRand = mouthRandomness.height;

    ctx.fillStyle = '#000000'; // Black mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;

    if (viseme) {
      switch (viseme) {
        case 'viseme_aa': // very wide open
          mouthWidth = 100 * widthRand;
          mouthHeight = 44 * heightRand;
          break;
        case 'viseme_E': // wide, not tall
          mouthWidth = 90 * widthRand;
          mouthHeight = 24 * heightRand;
          break;
        case 'viseme_I': // medium width, medium height
          mouthWidth = 70 * widthRand;
          mouthHeight = 32 * heightRand;
          break;
        case 'viseme_O': // round
          ctx.beginPath();
          ctx.arc(centerX, mouthY + visemeYOffset, 22 * widthRand, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_U': // small round, more oval
          ctx.beginPath();
          ctx.ellipse(centerX, mouthY + visemeYOffset, 14 * widthRand, 20 * heightRand, 0, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_PP': // closed, thin
          mouthWidth = 36 * widthRand;
          mouthHeight = 8 * heightRand;
          break;
        case 'viseme_FF': // flat, wide
          mouthWidth = 60 * widthRand;
          mouthHeight = 14 * heightRand;
          break;
        case 'viseme_TH': // tongue between teeth, small oval
          mouthWidth = 38 * widthRand;
          mouthHeight = 18 * heightRand;
          break;
        case 'viseme_MMM': // closed, very thin
          mouthWidth = 24 * widthRand;
          mouthHeight = 4 * heightRand;
          break;
        case 'viseme_WQ': // small oval, more open
          mouthWidth = 36 * widthRand;
          mouthHeight = 22 * heightRand;
          break;
        // Extra variants for more expressiveness:
        case 'viseme_SH': // "sh" sound, wide and flat
          mouthWidth = 80 * widthRand;
          mouthHeight = 10 * heightRand;
          break;
        case 'viseme_CH': // "ch" sound, medium oval
          mouthWidth = 50 * widthRand;
          mouthHeight = 18 * heightRand;
          break;
        case 'viseme_R': // "r" sound, small and round
          ctx.beginPath();
          ctx.arc(centerX, mouthY + visemeYOffset, 10 * widthRand, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_L': // "l" sound, medium oval
          mouthWidth = 44 * widthRand;
          mouthHeight = 18 * heightRand;
          break;
        case 'viseme_D': // "d" sound, almost closed
          mouthWidth = 30 * widthRand;
          mouthHeight = 6 * heightRand;
          break;
        default:
          mouthWidth = 40 * widthRand;
          mouthHeight = 10 * heightRand;
          // ctx.save();
          // ctx.lineWidth = 8; // Match eyebrow thickness
          // ctx.beginPath();
          // ctx.arc(centerX, mouthY, 60, Math.PI * 0.4, Math.PI * 0.6, false); // wider smile
          // ctx.stroke();
          // ctx.restore();
          // return;
          break;
      }
      // For all visemes except O, U, R, draw ellipse
      if (
        viseme !== 'viseme_O' &&
        viseme !== 'viseme_U' &&
        viseme !== 'viseme_R'
      ) {
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY + visemeYOffset, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      return;
    }

    // Default: wider, flatter smile curve
    ctx.save();
    ctx.lineWidth = 8; // Match eyebrow thickness
    ctx.beginPath();
    ctx.arc(centerX, mouthY, 60, Math.PI * 0.25, Math.PI * 0.75, false); // wider smile
    ctx.stroke();
    ctx.restore();

  };

  const drawBabyFeatures = (ctx, centerX, centerY, size) => {
    // No features (eyebrows removed)
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawBabyFace(ctx, robotConfig);

    animationRef.current = requestAnimationFrame(animate);
  };



  // Handle speech synthesis
  useEffect(() => {
    if (props?.speak) {
      const utterance = new SpeechSynthesisUtterance(props.text);

      if (props.voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const selected = voices.find((v) => v.voiceURI === props.voiceURI);
        if (selected) utterance.voice = selected;
      }

      // Set excited eyes during speech
      setEyeState('excited');
      if (props.onSpeechStart) props.onSpeechStart();

      const words = props.text.toUpperCase().split("");

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onboundary = (event) => {
        const word = words[event.charIndex];
        if (!word) return;

        const phoneme = word.toUpperCase();
        const viseme = CORRESPONDING_VISEME[phoneme];

        if (viseme) {
          // Add randomization for mouth shape
          setMouthRandomness({
            width: 1 - MOUTH_RANDOMNESS_RANGE + Math.random() * (2 * MOUTH_RANDOMNESS_RANGE),
            height: 1 - MOUTH_RANDOMNESS_RANGE + Math.random() * (2 * MOUTH_RANDOMNESS_RANGE),
          });
          currentViseme.current = viseme;
          visemeTimestamp.current = Date.now();
          setTimeout(() => {
            if (
              currentViseme.current === viseme &&
              Date.now() - visemeTimestamp.current >= VISEME_MIN_DURATION
            ) {
              currentViseme.current = null;
            }
          }, VISEME_MIN_DURATION);
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          currentViseme.current = null;
          setEyeState('normal');
        }, 300);
        if (props.onSpeechEnd) props.onSpeechEnd();
      };

      speechSynthesis.speak(utterance);
      props.setSpeak(false);
    }
  }, [props?.speak]);

  // Start animation loop
  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: '2px solid #333',
          borderRadius: '10px',
          background: '#fff'
        }}
      />
    </>
  );
}
