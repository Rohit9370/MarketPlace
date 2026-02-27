import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { Colors, Components } from '../constants/designSystem';

export default function Avatar({
  source,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  style,
  ...props
}) {
  const [imageError, setImageError] = useState(false);
  
  const sizeValue = Components.avatar[size] || Components.avatar.md;
  
  // Check if image exists and is valid
  const hasValidImage = source && 
    typeof source === 'string' && 
    source.trim() !== '' && 
    !source.includes('placeholder') &&
    !imageError;

  return (
    <View
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: Colors.neutral[100],
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}
    >
      {hasValidImage ? (
        <Image
          source={{ uri: source }}
          style={{
            width: '100%',
            height: '100%',
          }}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      ) : (
        <Ionicons 
          name="person" 
          size={sizeValue * 0.5} 
          color={Colors.neutral[400]} 
        />
      )}
    </View>
  );
}
