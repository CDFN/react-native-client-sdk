import {InCallButton} from '../../components';
import {Alert, Platform} from 'react-native';
import React, {useCallback} from 'react';
import {
  useCamera,
  updateVideoTrackMetadata,
} from '@jellyfish-dev/react-native-client-sdk';
import {previewScreenLabels} from '../../types/ComponentLabels.ts';
import {
  displayIosSimulatorCameraAlert,
  isIosSimulator,
} from '../../utils/deviceUtils.ts';

export const ToggleCameraButton = () => {
  const {toggleCamera, isCameraOn} = useCamera();
  const {TOGGLE_CAMERA_BUTTON} = previewScreenLabels;

  const handleCameraTogglePress = useCallback(async () => {
    if (isIosSimulator) {
      displayIosSimulatorCameraAlert();
      return;
    }
    await toggleCamera();
    await updateVideoTrackMetadata({
      active: !isCameraOn,
      type: 'camera',
    });
  }, [isCameraOn, toggleCamera]);

  return (
    <InCallButton
      iconName={isCameraOn ? 'camera' : 'camera-off'}
      onPress={handleCameraTogglePress}
      accessibilityLabel={TOGGLE_CAMERA_BUTTON}
    />
  );
};
