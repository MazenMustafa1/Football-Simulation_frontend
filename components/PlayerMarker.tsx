'use client';

import { memo } from 'react';
import { Text } from '@react-three/drei';

type Props = {
  position: [number, number, number];
  color?: string;
  player?: string;
};

// Memoized PlayerMarker to prevent unnecessary re-renders
const PlayerMarker = memo(({ position, color = 'blue', player }: Props) => (
  <group position={position}>
    {/* Cylinder base */}
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 1.6, 8]} />
      <meshStandardMaterial color="white" />
    </mesh>
    {/* Sphere on top of cylinder */}
    <mesh position={[0, 2.6, 0]}>
      <sphereGeometry args={[1.2, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Player name above the sphere */}
    {player && (
      <Text
        fontSize={2}
        color="white"
        anchorX="center"
        anchorY="bottom"
        position={[0, 4.2, 0]}
      >
        {player}
      </Text>
    )}
  </group>
));

PlayerMarker.displayName = 'PlayerMarker';

export default PlayerMarker;
