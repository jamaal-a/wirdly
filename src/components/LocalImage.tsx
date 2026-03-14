import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageStyle } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

// Resolves file:// URIs to base64 for reliable display on iOS (RN Image has issues with local files)
interface LocalImageProps {
  uri: string;
  style: ImageStyle;
  resizeMode?: 'cover' | 'contain';
}

const LocalImage: React.FC<LocalImageProps> = ({ uri, style, resizeMode = 'cover' }) => {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uri) return;
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      setResolvedUri(uri);
      return;
    }
    const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    FileSystem.getInfoAsync(fileUri)
      .then((info) => {
        if (!info.exists) {
          setError(true);
          return null;
        }
        return FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      })
      .then((base64) => {
        if (!base64) return;
        const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
        const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        setResolvedUri(`data:${mime};base64,${base64}`);
      })
      .catch(() => setError(true));
  }, [uri]);

  if (error) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 24 }}>📷</Text>
      </View>
    );
  }
  if (!resolvedUri) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 12, color: '#999' }}>...</Text>
      </View>
    );
  }
  return <Image source={{ uri: resolvedUri }} style={style} resizeMode={resizeMode} />;
};

export default LocalImage;
