import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { BorderRadius, Colors } from '../constants/designSystem';

export default function IconButton({
  icon,
  onPress,
  size = 24,
  color = Colors.primary[600],
  backgroundColor = Colors.primary[50],
  style,
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: BorderRadius.lg,
          backgroundColor: backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}
