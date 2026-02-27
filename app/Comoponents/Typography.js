import { Text as RNText } from 'react-native';
import { Colors, Typography as TypographySystem } from '../constants/designSystem';

export default function Typography({
  children,
  variant = 'body', // 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline'
  weight = 'regular', // 'regular' | 'medium' | 'semibold' | 'bold'
  color = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'inverse' | custom color
  align = 'left',
  numberOfLines,
  style,
  ...props
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: TypographySystem.fontSize['4xl'],
          lineHeight: TypographySystem.fontSize['4xl'] * 1.2,
          fontFamily: TypographySystem.fontFamily.bold,
        };
      case 'h2':
        return {
          fontSize: TypographySystem.fontSize['3xl'],
          lineHeight: TypographySystem.fontSize['3xl'] * 1.2,
          fontFamily: TypographySystem.fontFamily.bold,
        };
      case 'h3':
        return {
          fontSize: TypographySystem.fontSize['2xl'],
          lineHeight: TypographySystem.fontSize['2xl'] * 1.3,
          fontFamily: TypographySystem.fontFamily.semibold,
        };
      case 'h4':
        return {
          fontSize: TypographySystem.fontSize.xl,
          lineHeight: TypographySystem.fontSize.xl * 1.3,
          fontFamily: TypographySystem.fontFamily.semibold,
        };
      case 'body':
        return {
          fontSize: TypographySystem.fontSize.base,
          lineHeight: TypographySystem.fontSize.base * 1.5,
          fontFamily: TypographySystem.fontFamily[weight],
        };
      case 'caption':
        return {
          fontSize: TypographySystem.fontSize.sm,
          lineHeight: TypographySystem.fontSize.sm * 1.4,
          fontFamily: TypographySystem.fontFamily[weight],
        };
      case 'overline':
        return {
          fontSize: TypographySystem.fontSize.xs,
          lineHeight: TypographySystem.fontSize.xs * 1.4,
          fontFamily: TypographySystem.fontFamily.medium,
          textTransform: 'uppercase',
          letterSpacing: 1,
        };
      default:
        return {
          fontSize: TypographySystem.fontSize.base,
          lineHeight: TypographySystem.fontSize.base * 1.5,
          fontFamily: TypographySystem.fontFamily.regular,
        };
    }
  };

  const getColorStyle = () => {
    if (color.startsWith('#') || color.startsWith('rgb')) {
      return { color };
    }
    
    switch (color) {
      case 'primary':
        return { color: Colors.text.primary };
      case 'secondary':
        return { color: Colors.text.secondary };
      case 'tertiary':
        return { color: Colors.text.tertiary };
      case 'inverse':
        return { color: Colors.text.inverse };
      default:
        return { color: Colors.text.primary };
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        getColorStyle(),
        { textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
}