import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Shadows, Spacing, Typography } from '../constants/designSystem';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) {
  const getVariantStyles = () => {
    const baseStyle = {
      height: Components.button.height[size],
      paddingHorizontal: Components.button.paddingHorizontal,
      borderRadius: Components.button.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[2],
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? Colors.neutral[300] : Colors.primary[600],
            ...Shadows.sm,
          },
          text: {
            color: Colors.text.inverse,
            fontSize: Typography.fontSize.base,
            fontFamily: Typography.fontFamily.semibold,
          },
        };
      
      case 'secondary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? Colors.neutral[100] : Colors.neutral[900],
            ...Shadows.sm,
          },
          text: {
            color: Colors.text.inverse,
            fontSize: Typography.fontSize.base,
            fontFamily: Typography.fontFamily.semibold,
          },
        };
      
      case 'outline':
        return {
          container: {
            ...baseStyle,
            backgroundColor: Colors.background.primary,
            borderWidth: 1.5,
            borderColor: disabled ? Colors.border.main : Colors.primary[600],
          },
          text: {
            color: disabled ? Colors.text.disabled : Colors.primary[600],
            fontSize: Typography.fontSize.base,
            fontFamily: Typography.fontFamily.semibold,
          },
        };
      
      case 'ghost':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
          },
          text: {
            color: disabled ? Colors.text.disabled : Colors.primary[600],
            fontSize: Typography.fontSize.base,
            fontFamily: Typography.fontFamily.semibold,
          },
        };
      
      default:
        return {
          container: baseStyle,
          text: {},
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[600] : Colors.text.inverse} 
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}