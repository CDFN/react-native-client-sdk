import React, {useEffect, useRef} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  useCamera,
  useMicrophone,
  useJellyfishClient,
  VideoQuality,
  TrackEncoding,
} from '@jellyfish-dev/react-native-client-sdk';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {AppRootStackParamList} from '../../navigators/AppNavigator.tsx';

import {previewScreenLabels} from '../../types/ComponentLabels.ts';
import {BrandColors} from '../../utils/Colors.ts';
import {NoCameraView} from '../../components/NoCameraView.tsx';
import VideoPreview from '../../components/VideoPreview.tsx';

import BottomSheet from '@gorhom/bottom-sheet';
import {SoundOutputDevicesBottomSheet} from '../../components/SoundOutputDevicesBottomSheet.tsx';
import {usePreventBackButton} from '../../utils/usePreventBackButton.ts';
import {ToggleMicrophoneButton} from './ToggleMicrophoneButton.tsx';
import {ToggleCameraButton} from './ToggleCameraButton.tsx';
import LetterButton from '../../components/LetterButton.tsx';
import {
  displayIosSimulatorCameraAlert,
  isIosSimulator,
} from '../../utils/deviceUtils.ts';
import {SwitchOutputDeviceButton} from './SwitchOutputDeviceButton.tsx';

type Props = NativeStackScreenProps<AppRootStackParamList, 'Preview'>;
const {JOIN_BUTTON} = previewScreenLabels;

const PreviewScreen = ({navigation, route}: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  usePreventBackButton();
  useEffect(() => {
    if (isIosSimulator) {
      displayIosSimulatorCameraAlert();
      return;
    }
  }, []);

  const {startMicrophone, isMicrophoneOn} = useMicrophone();

  const encodings: Record<string, TrackEncoding[]> = {
    ios: ['l', 'h'],
    android: ['l', 'm', 'h'],
  };

  const {simulcastConfig, startCamera, isCameraOn, toggleVideoTrackEncoding} =
    useCamera();

  const {join} = useJellyfishClient();

  const onJoinPressed = async () => {
    await startCamera({
      simulcastConfig: {
        enabled: true,
        activeEncodings: encodings[Platform.OS],
      },
      quality: VideoQuality.HD_169,
      maxBandwidth: {l: 150, m: 500, h: 1500},
      videoTrackMetadata: {
        active: !isIosSimulator && isCameraOn,
        type: 'camera',
      },
      captureDeviceId: undefined, //todo: add device id
      cameraEnabled: !isIosSimulator && isCameraOn,
    });

    await startMicrophone({
      audioTrackMetadata: {active: isMicrophoneOn, type: 'audio'},
      microphoneEnabled: isMicrophoneOn,
    });

    await join({
      name: route?.params?.userName || 'RN Mobile',
    });

    navigation.navigate('Room');
  };

  const body = (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraPreview}>
        {!isIosSimulator && isCameraOn ? (
          // todo: add current camera id below once we are able to obtain one from sdk
          <VideoPreview currentCamera={null} />
        ) : (
          <NoCameraView username={route?.params?.userName || 'RN Mobile'} />
        )}
      </View>
      <View style={styles.mediaButtonsWrapper}>
        <ToggleMicrophoneButton />
        <ToggleCameraButton />
        <SwitchOutputDeviceButton bottomSheetRef={bottomSheetRef} />
      </View>
      <View style={styles.simulcastButtonsWrapper}>
        {encodings[Platform.OS].map(val => (
          <LetterButton
            trackEncoding={val}
            key={`encoding-${val}`}
            selected={simulcastConfig.activeEncodings.includes(val)}
            onPress={() => toggleVideoTrackEncoding(val)}
          />
        ))}
      </View>
      <View style={styles.joinButton}>
        <Button
          title="Join Room"
          onPress={onJoinPressed}
          accessibilityLabel={JOIN_BUTTON}
        />
      </View>
      {Platform.OS === 'android' && (
        <SoundOutputDevicesBottomSheet bottomSheetRef={bottomSheetRef} />
      )}
    </SafeAreaView>
  );
  if (Platform.OS === 'android') {
    return (
      <TouchableWithoutFeedback onPress={() => bottomSheetRef.current?.close()}>
        {body}
      </TouchableWithoutFeedback>
    );
  }
  return body;
};

export {PreviewScreen};

const styles = StyleSheet.create({
  callView: {display: 'flex', flexDirection: 'row', gap: 20},
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F1FAFE',
    padding: 24,
  },
  cameraPreview: {
    flex: 6,
    margin: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.darkBlue80,
    overflow: 'hidden',
  },
  mediaButtonsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    flex: 1,
  },
  simulcastButtonsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },
});
