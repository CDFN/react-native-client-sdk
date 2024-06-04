import {InCallButton} from '../../components';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {previewScreenLabels} from '../../types/ComponentLabels.ts';
import {
  displayIosSimulatorCameraAlert,
  isIosSimulator,
} from '../../utils/deviceUtils.ts';
import {useCamera, CaptureDevice} from '@jellyfish-dev/react-native-client-sdk';

export const ToggleMicrophoneButton = () => {
  const {SWITCH_CAMERA_BUTTON} = previewScreenLabels;
  const [currentCamera, setCurrentCamera] = useState<CaptureDevice | null>(
    null,
  );
  const availableCameras = useRef<CaptureDevice[]>([]);
  const {getCaptureDevices, switchCamera} = useCamera();

  //todo Switches between front-facing and back-facing cameras or displays a list of available cameras.
  const handleCameraSwitchPress = useCallback(() => {
    if (isIosSimulator) {
      displayIosSimulatorCameraAlert();
      return;
    }

    if (currentCamera === null) {
      return;
    }

    const cameras = availableCameras.current;
    const currentCameraIndex = cameras.findIndex(dev => dev === currentCamera);
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;

    setCurrentCamera(cameras[nextCameraIndex] || null);
    switchCamera(cameras[nextCameraIndex].id);
  }, [switchCamera, currentCamera]);

  useEffect(() => {
    getCaptureDevices().then(devices => {
      availableCameras.current = devices;
      setCurrentCamera(devices.find(device => device.isFrontFacing) || null);
    });
  }, [getCaptureDevices]);

  return (
    <InCallButton
      iconName="camera-switch"
      onPress={handleCameraSwitchPress}
      accessibilityLabel={SWITCH_CAMERA_BUTTON}
    />
  );
};
