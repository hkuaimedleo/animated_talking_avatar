import React, { useState, useEffect, useRef } from "react";
import { CORRESPONDING_VISEME } from "../constant";
import { ROBOT_THEMES } from "../robotConfig";

export function RobotAvatar2D(props) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const currentViseme = useRef(null);
  const [eyeState, setEyeState] = useState('normal'); // normal, blink, excited
  const [mouthState, setMouthState] = useState('idle'); // idle, talking, happy, sad
  const [eyeSrc, setEyeSrc] = useState("/images/eye.png");
  const eyeImg = useRef(null);

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

  const drawEyes = (ctx, centerX, centerY, eyeColor, state) => {
    // Lower the eyes by increasing eyeY
    const eyeY = centerY + 10;
    const eyeSpacing = 180;
    const eyeWidth = 160;
    const eyeHeight = 120;

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

    // Draw flat eyebrows above each eye
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    // Left eyebrow (flat)
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 40, eyeY - eyeHeight / 2 - 60); // moved from -40 to -60
    ctx.lineTo(centerX - eyeSpacing + 40, eyeY - eyeHeight / 2 - 60);
    ctx.stroke();
    // Right eyebrow (flat)
    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing - 40, eyeY - eyeHeight / 2 - 60); // moved from -40 to -60
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

    ctx.fillStyle = '#000000'; // Black mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;

    if (viseme) {
      switch(viseme) {
        case 'viseme_aa': // wide open
          mouthWidth = 90;
          mouthHeight = 38;
          break;
        case 'viseme_E': // wide, not tall
          mouthWidth = 90;
          mouthHeight = 18;
          break;
        case 'viseme_I': // medium width, medium height
          mouthWidth = 60;
          mouthHeight = 24;
          break;
        case 'viseme_O': // round
          ctx.beginPath();
          ctx.arc(centerX, mouthY + visemeYOffset, 18, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_U': // small round
          ctx.beginPath();
          ctx.arc(centerX, mouthY + visemeYOffset, 12, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_PP': // closed, thin
          mouthWidth = 40;
          mouthHeight = 8;
          break;
        case 'viseme_FF': // flat, wide
          mouthWidth = 60;
          mouthHeight = 10;
          break;
        case 'viseme_TH': // tongue between teeth, small oval
          mouthWidth = 38;
          mouthHeight = 14;
          break;
        case 'viseme_MMM': // closed, very thin
          mouthWidth = 32;
          mouthHeight = 4;
          break;
        case 'viseme_WQ': // small oval
          mouthWidth = 28;
          mouthHeight = 18;
          break;
        default:
          break;
      }
      // For all visemes except O and U, draw ellipse
      if (viseme !== 'viseme_O' && viseme !== 'viseme_U') {
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY + visemeYOffset, mouthWidth/2, mouthHeight/2, 0, 0, Math.PI * 2);
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

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeState('blink');
      setTimeout(() => setEyeState('normal'), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

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

      utterance.onboundary = (event) => {
        const word = words[event.charIndex];
        if (!word) return;

        const phoneme = word.toUpperCase();
        const viseme = CORRESPONDING_VISEME[phoneme];

        if (viseme) {
          currentViseme.current = viseme;
          setTimeout(() => {
            if (currentViseme.current === viseme) {
              currentViseme.current = null;
            }
          }, 150);
        }
      };

      utterance.onend = () => {
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
  );
}
