declare module 'react-native-onboarding-swiper' {
  import { ComponentType, ReactElement } from 'react';
  import { TextStyle, ViewStyle, ImageSourcePropType } from 'react-native';

  export interface OnboardingProps {
    pages: Page[];
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    bottomBarColor?: string;
    controlStatusBar?: boolean;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    skipLabel?: string;
    nextLabel?: string;
    allowFontScaling?: boolean;
    onSkip?: () => void;
    onDone?: () => void;
    skipToPage?: number;
    transitionAnimationDuration?: number;
    containerStyles?: ViewStyle;
    imageContainerStyles?: ViewStyle;
    titleStyles?: TextStyle;
    subTitleStyles?: TextStyle;
    skipButtonStyle?: ViewStyle;
    buttonTextStyle?: TextStyle;
    DotComponent?: ComponentType<DotProps>;
    SkipButtonComponent?: ComponentType<SkipButtonProps>;
    NextButtonComponent?: ComponentType<NextButtonProps>;
    DoneButtonComponent?: ComponentType<DoneButtonProps>;
  }

  export interface Page {
    backgroundColor: string;
    image: ReactElement | ComponentType;
    title: string;
    subtitle: string;
    titleStyles?: TextStyle;
    subTitleStyles?: TextStyle;
  }

  export interface DotProps {
    selected: boolean;
    isLight: boolean;
  }

  export interface SkipButtonProps {
    skipLabel: string;
    isLight: boolean;
    onPress: () => void;
  }

  export interface NextButtonProps {
    nextLabel: string;
    isLight: boolean;
    onPress: () => void;
  }

  export interface DoneButtonProps {
    isLight: boolean;
    onPress: () => void;
  }

  export default class Onboarding extends React.Component<OnboardingProps> {}
} 