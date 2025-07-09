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
    const eyeY = centerY - 50
    ;
    const eyeSpacing = 180;
    // Make the eyes bigger:
    const eyeWidth = 120;   // was 40
    const eyeHeight = 120; // was 60

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
  };

  const drawMouth = (ctx, centerX, centerY, mouthColor, viseme) => {
    const mouthY = centerY + 120;
    let mouthWidth = 60;
    let mouthHeight = 20;

    ctx.fillStyle = '#000000'; // Black mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;

    if (viseme) {
      switch(viseme) {
        case 'viseme_aa':
          mouthWidth = 80;
          mouthHeight = 30;
          break;
        case 'viseme_PP':
          mouthWidth = 40;
          mouthHeight = 8;
          break;
        case 'viseme_O':
          ctx.beginPath();
          ctx.arc(centerX, mouthY, 15, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_U':
          ctx.beginPath();
          ctx.arc(centerX, mouthY, 10, 0, Math.PI * 2);
          ctx.fill();
          return;
        case 'viseme_FF':
          mouthWidth = 50;
          mouthHeight = 12;
          break;
        default:
          // fall through to closed mouth
          break;
      }
      // For all visemes except O and U, draw ellipse
      if (viseme !== 'viseme_O' && viseme !== 'viseme_U') {
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, mouthWidth/2, mouthHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Default: closed mouth (horizontal line)
    ctx.beginPath();
    ctx.moveTo(centerX - 30, mouthY);
    ctx.lineTo(centerX + 30, mouthY);
    ctx.stroke();
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
