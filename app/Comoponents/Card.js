import { View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';

export default function Card({ 
  children, 
  style, 
  padding = Spacing.lg,
  shadow = 'md',
  ...props 
}) {
  const shadowStyle = shadow ? Shadows[shadow] : {};
  
  return (
    <View
      style={[
        {
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.xl,
          padding: padding,
        },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
