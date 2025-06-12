import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  Image,
  Platform
} from 'react-native';

interface SocialLoginButtonProps {
  provider: 'google' | 'apple' | 'facebook' | 'twitter';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function SocialLoginButton({
  provider,
  onPress,
  style,
  textStyle,
}: SocialLoginButtonProps) {
  const getProviderLogo = () => {
    switch (provider) {
      case 'google':
        return 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';
      case 'apple':
        return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
      case 'facebook':
        return 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';
      case 'twitter':
        return 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg';
      default:
        return '';
    }
  };
  
  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      case 'facebook':
        return 'Facebook';
      case 'twitter':
        return 'Twitter';
      default:
        return '';
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: getProviderLogo() }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.text, textStyle]}>
        {getProviderName()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});