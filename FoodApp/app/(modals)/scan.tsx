// The contents of app/scan.tsx should be moved here. Ensure default export.
// ... existing code from app/scan.tsx ... 

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon, Rect } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.7;

function ScannerOverlay({ highlight, dynamicBox }: { highlight: boolean, dynamicBox?: { x: number, y: number, width: number, height: number } | { corners: { x: number, y: number }[] } }) {
  const cornerSize = 20;
  const cornerThickness = 3;
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;
  const scanAreaX = centerX - SCAN_AREA_SIZE / 2;
  const scanAreaY = centerY - SCAN_AREA_SIZE / 2;

  let yellowBox = null;
  if (dynamicBox) {
    if ('x' in dynamicBox && 'y' in dynamicBox && 'width' in dynamicBox && 'height' in dynamicBox) {
      yellowBox = (
        <Rect
          x={dynamicBox.x}
          y={dynamicBox.y}
          width={dynamicBox.width}
          height={dynamicBox.height}
          stroke="yellow"
          strokeWidth={3}
          fill="none"
        />
      );
    } else if ('corners' in dynamicBox && Array.isArray(dynamicBox.corners)) {
      const points = dynamicBox.corners.map(pt => `${pt.x},${pt.y}`).join(' ');
      yellowBox = (
        <Polygon
          points={points}
          stroke="yellow"
          strokeWidth={3}
          fill="none"
        />
      );
    }
  }

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Semi-transparent overlay */}
      <Rect
        x={0}
        y={0}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        fill="rgba(0,0,0,0.5)"
      />
      {/* Clear scan area */}
      <Rect
        x={scanAreaX}
        y={scanAreaY}
        width={SCAN_AREA_SIZE}
        height={SCAN_AREA_SIZE}
        fill="transparent"
      />
      {/* Corner markers */}
      {/* Top left */}
      <Line x1={scanAreaX} y1={scanAreaY} x2={scanAreaX + cornerSize} y2={scanAreaY} stroke="white" strokeWidth={cornerThickness} />
      <Line x1={scanAreaX} y1={scanAreaY} x2={scanAreaX} y2={scanAreaY + cornerSize} stroke="white" strokeWidth={cornerThickness} />
      {/* Top right */}
      <Line x1={scanAreaX + SCAN_AREA_SIZE - cornerSize} y1={scanAreaY} x2={scanAreaX + SCAN_AREA_SIZE} y2={scanAreaY} stroke="white" strokeWidth={cornerThickness} />
      <Line x1={scanAreaX + SCAN_AREA_SIZE} y1={scanAreaY} x2={scanAreaX + SCAN_AREA_SIZE} y2={scanAreaY + cornerSize} stroke="white" strokeWidth={cornerThickness} />
      {/* Bottom left */}
      <Line x1={scanAreaX} y1={scanAreaY + SCAN_AREA_SIZE - cornerSize} x2={scanAreaX} y2={scanAreaY + SCAN_AREA_SIZE} stroke="white" strokeWidth={cornerThickness} />
      <Line x1={scanAreaX} y1={scanAreaY + SCAN_AREA_SIZE} x2={scanAreaX + cornerSize} y2={scanAreaY + SCAN_AREA_SIZE} stroke="white" strokeWidth={cornerThickness} />
      {/* Bottom right */}
      <Line x1={scanAreaX + SCAN_AREA_SIZE - cornerSize} y1={scanAreaY + SCAN_AREA_SIZE} x2={scanAreaX + SCAN_AREA_SIZE} y2={scanAreaY + SCAN_AREA_SIZE} stroke="white" strokeWidth={cornerThickness} />
      <Line x1={scanAreaX + SCAN_AREA_SIZE} y1={scanAreaY + SCAN_AREA_SIZE - cornerSize} x2={scanAreaX + SCAN_AREA_SIZE} y2={scanAreaY + SCAN_AREA_SIZE} stroke="white" strokeWidth={cornerThickness} />
      {/* Dynamic yellow bounding box if present */}
      {yellowBox}
      {/* Fallback: Simulated yellow highlight */}
      {highlight && !yellowBox && (
        <Rect
          x={scanAreaX}
          y={scanAreaY}
          width={SCAN_AREA_SIZE}
          height={SCAN_AREA_SIZE}
          stroke="yellow"
          strokeWidth={3}
          fill="none"
        />
      )}
    </Svg>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [highlight, setHighlight] = useState(false);
  const [dynamicBox, setDynamicBox] = useState<any>(undefined);
  const [scanned, setScanned] = useState(false);
  const scannedRef = React.useRef(false);
  const router = useRouter();

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    // Reset scanned when unmounting
    return () => {
      setScanned(false);
      scannedRef.current = false;
    };
  }, [permission]);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (!permission.granted) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code93', 'code128'],
        }}
        onBarcodeScanned={result => {
          if (scannedRef.current) return;
          const { data } = result;
          const boundingBox = (result as any).boundingBox;
          const corners = (result as any).corners;
          if (boundingBox) {
            setDynamicBox(boundingBox);
          } else if (corners && Array.isArray(corners)) {
            setDynamicBox({ corners });
          } else {
            setDynamicBox(undefined);
          }
          if (data) {
            setScanned(true);
            scannedRef.current = true;
            setHighlight(true);
            setTimeout(() => {
              setHighlight(false);
              router.push({
                pathname: '/(modals)/food-details',
                params: { barcode: data },
              });
              setDynamicBox(undefined);
            }, 500);
          }
        }}
      />
      <ScannerOverlay highlight={highlight} dynamicBox={dynamicBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
}); 