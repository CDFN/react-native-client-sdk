import {InCallButton} from '../../components';
import React, {useCallback} from 'react';
import {useMicrophone} from '@jellyfish-dev/react-native-client-sdk';
import {previewScreenLabels} from '../../types/ComponentLabels.ts';

export const ToggleMicrophoneButton = () => {
  const {isMicrophoneOn, toggleMicrophone} = useMicrophone();
  const {TOGGLE_MICROPHONE_BUTTON} = previewScreenLabels;

  const handleMicrophoneTogglePress = useCallback(async () => {
    await toggleMicrophone();
  }, [toggleMicrophone]);

  return (
    <InCallButton
      iconName={isMicrophoneOn ? 'microphone' : 'microphone-off'}
      onPress={handleMicrophoneTogglePress}
      accessibilityLabel={TOGGLE_MICROPHONE_BUTTON}
    />
  );
};
