import React, { useState, useEffect, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations, useFBX } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { CORRESPONDING_VISEME } from "../constant";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";

export function Avatar(props) {
  const modelPath = props.modelPath || "/models/female.glb";
  const { scene } = useGLTF(modelPath);
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");

  idleAnimation[0].name = "Idle";

  const [animation] = useState("Idle");
  const group = useRef();
  const { actions } = useAnimations([idleAnimation[0]], group);
  const currentViseme = useRef(null);
  const mouthRandomness = useRef(1); // Add randomness ref

  const { morphTargetSmoothing } = useControls(
    {
      headFollow: true,
      smoothMorphTarget: true,
      morphTargetSmoothing: { value: 0.3, min: 0, max: 1, step: 0.01 },
    },
    { hidden: true }
  );

  // Add maxMouthOpen prop with default value 0.5
  const maxMouthOpen = props.maxMouthOpen !== undefined ? props.maxMouthOpen : 0.5;

  // useEffect(() => {
  //   actions[animation] && actions[animation].reset().fadeIn(0.5).play();
  //   return () => actions[animation] && actions[animation].fadeOut(0.5);
  // }, [animation]);

  useEffect(() => {
    if (props?.speak) {
      const utterance = new SpeechSynthesisUtterance(props.text);

      // Set the selected voice if provided
      if (props.voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const selected = voices.find((v) => v.voiceURI === props.voiceURI);
        if (selected) utterance.voice = selected;
      }

      // Notify parent that speech is starting
      if (props.onSpeechStart) props.onSpeechStart();

      const words = props.text.toUpperCase().split("");

      utterance.onboundary = (event) => {
        const word = words[event.charIndex];

        if (!word) return;

        const phoneme = word.toUpperCase();
        const viseme = CORRESPONDING_VISEME[phoneme];

        if (viseme) {
          // Add randomization for mouth shape
          mouthRandomness.current = 0.95 + Math.random() * 0.1; // 0.95 - 1.05
          currentViseme.current = viseme;

          setTimeout(() => {
            if (currentViseme.current === viseme) {
              currentViseme.current = null;
            }
          }, 150);
        }
      };

      utterance.onend = () => {
        console.log("Speech ended, resetting viseme");

        setTimeout(() => {
          currentViseme.current = null;

          Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).forEach(
            (key) => {
              const index = nodes.Wolf3D_Head.morphTargetDictionary[key];
              nodes.Wolf3D_Head.morphTargetInfluences[index] = 0;
              nodes.Wolf3D_Teeth.morphTargetInfluences[index] = 0;
            }
          );
        }, 300);
        // Notify parent that speech has ended
        if (props.onSpeechEnd) props.onSpeechEnd();
      };

      speechSynthesis.speak(utterance);
      props.setSpeak(false);
    }
  }, [props?.speak]);

  useFrame(() => {
    if (currentViseme.current) {
      const index =
        nodes.Wolf3D_Head.morphTargetDictionary[currentViseme.current];

      // Use maxMouthOpen for limiting morph target influence
      // Apply randomness to the morph target influence
      const influence = Math.min(
        THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[index],
          1 * mouthRandomness.current,
          morphTargetSmoothing
        ),
        maxMouthOpen * mouthRandomness.current
      );

      nodes.Wolf3D_Head.morphTargetInfluences[index] = influence;

      nodes.Wolf3D_Teeth.morphTargetInfluences[index] = influence;

      console.log(index + "; " + nodes.Wolf3D_Head.morphTargetInfluences[index]);

    } else {
      Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).forEach((key) => {
        const index = nodes.Wolf3D_Head.morphTargetDictionary[key];

        nodes.Wolf3D_Head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[index],
          0,
          0.15 // Lower value = smoother transition to idle
        );

        nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[index],
          0,
          0.15
        );
      });
    }
  });

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      {/* Only render if Wolf3D_Hair exists */}
      {nodes.Wolf3D_Hair && materials.Wolf3D_Hair && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
      )}
      {/* Only render glasses if present in the model */}
      {nodes.Wolf3D_Glasses && materials.Wolf3D_Glasses && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Glasses.geometry}
          material={materials.Wolf3D_Glasses}
          skeleton={nodes.Wolf3D_Glasses.skeleton}
        />
      )}
      {nodes.Wolf3D_Body && materials.Wolf3D_Body && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Bottom && materials.Wolf3D_Outfit_Bottom && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Footwear && materials.Wolf3D_Outfit_Footwear && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Top && materials.Wolf3D_Outfit_Top && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      )}
      {nodes.EyeLeft && materials.Wolf3D_Eye && (
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      )}
      {nodes.EyeRight && materials.Wolf3D_Eye && (
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Head && materials.Wolf3D_Skin && (
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Teeth && materials.Wolf3D_Teeth && (
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      )}
    </group>
  );
}

// Removed the hardcoded preload, use modelPath prop to load models dynamically
// Removed the hardcoded preload, use modelPath prop to load models dynamically
