import React, { useState, useEffect, useRef } from "react";
import { CORRESPONDING_VISEME } from "../constant";
import { ROBOT_THEMES } from "../robotConfig";

export function RobotAvatar2D(props) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const currentViseme = useRef(null);
  const [eyeState, setEyeState] = useState('normal'); // normal, blink, excited
  const [mouthState, setMouthState] = useState('idle'); // idle, talking, happy, sad

  // Robot face configuration - use theme or default
  const robotConfig = ROBOT_THEMES[props.theme] || ROBOT_THEMES.default;

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
    // Spread eyes wider and higher on the canvas
    // const eyeY = centerY - 100;
    const eyeY = centerY - 40; // moved eyes lower
    const eyeSpacing = 180;
    const eyeWidth = 40;
    const eyeHeight = 60;

    ctx.fillStyle = '#000000'; // Black eyes
    ctx.shadowBlur = 0;

    switch(state) {
      case 'blink':
        ctx.fillRect(centerX - eyeSpacing - eyeWidth/2, eyeY - 4, eyeWidth, 8);
        ctx.fillRect(centerX + eyeSpacing - eyeWidth/2, eyeY - 4, eyeWidth, 8);
        break;
      case 'excited':
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing, eyeY, eyeWidth * 1.2, eyeHeight * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing, eyeY, eyeWidth * 1.2, eyeHeight * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add eye highlights
    if (state !== 'blink') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX - eyeSpacing - 12, eyeY - 18, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + eyeSpacing - 12, eyeY - 18, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawMouth = (ctx, centerX, centerY, mouthColor, viseme) => {
    // Place mouth lower and make it smaller
    const mouthY = centerY + 120;
    let mouthWidth = 60;
    let mouthHeight = 20;

    ctx.fillStyle = '#000000'; // Black mouth
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
          mouthWidth = 60;
          mouthHeight = 16;
      }
    }

    ctx.beginPath();
    ctx.ellipse(centerX, mouthY, mouthWidth/2, mouthHeight/2, 0, 0, Math.PI * 2);
    ctx.fill();
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
