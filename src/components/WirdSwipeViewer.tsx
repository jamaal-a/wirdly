import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { WirdReminder } from '../types';

// Resolves file:// URIs to base64 for reliable display on iOS
const ResolvedImage: React.FC<{ uri: string; style: any }> = ({ uri, style }) => {
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
  if (error) return <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 48 }}>📷</Text></View>;
  if (!resolvedUri) return <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 14, color: '#999' }}>Loading...</Text></View>;
  return <Image source={{ uri: resolvedUri }} style={style} resizeMode="contain" />;
};

const { width } = Dimensions.get('window');

interface WirdSwipeViewerProps {
  visible: boolean;
  reminders: WirdReminder[];
  onClose: () => void;
  onComplete: (id: string) => void;
  onViewReminder?: (reminder: WirdReminder) => void;
}

const WirdSwipeViewer: React.FC<WirdSwipeViewerProps> = ({
  visible,
  reminders,
  onClose,
  onComplete,
  onViewReminder,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSwipeComplete = () => {
    if (currentIndex < reminders.length) {
      const currentReminder = reminders[currentIndex];
      onComplete(currentReminder.id);
      
      if (currentIndex < reminders.length - 1) {
        // Move to next reminder
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      } else {
        // All done
        Alert.alert('Well Done! 🎉', 'You have completed all wirds for this prayer time.', [
          { text: 'Close', onPress: onClose }
        ]);
      }
    }
  };

  const renderWird = ({ item, index }: { item: WirdReminder; index: number }) => {
    const isLast = index === reminders.length - 1;
    
    return (
      <View style={styles.card}>
        <ScrollView style={styles.cardContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          
          {item.description && (
            <Text style={styles.cardDescription}>{item.description}</Text>
          )}

          {item.imageUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={async () => {
                try {
                  const Sharing = require('expo-sharing');
                  await Sharing.shareAsync(item.imageUrl, {
                    mimeType: 'image/jpeg',
                    dialogTitle: 'View Image',
                  });
                } catch (error) {
                  console.error('Error sharing image:', error);
                }
              }}
            >
              <ResolvedImage
                uri={item.imageUrl}
                style={styles.cardImage}
              />
            </TouchableOpacity>
          )}

          {item.linkUrl && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL(item.linkUrl!)}
            >
              <Text style={styles.linkButtonText}>🔗 Open Link</Text>
            </TouchableOpacity>
          )}

          {item.fileUrl && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL(item.fileUrl!)}
            >
              <Text style={styles.linkButtonText}>📄 Open File</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleSwipeComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>
              {isLast ? '✓ Complete All' : '✓ Complete & Next →'}
            </Text>
          </TouchableOpacity>
          {(item.imageUrl || item.linkUrl || item.fileUrl) && onViewReminder && (
            <TouchableOpacity
              style={styles.viewReminderButton}
              onPress={() => onViewReminder(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewReminderButtonText}>View Reminder</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Fixed header with close button outside FlatList */}
        <View style={styles.fixedHeader}>
          <Text style={styles.headerText}>
            {currentIndex + 1} / {reminders.length}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('Close button tapped');
              onClose();
            }} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={reminders}
          renderItem={renderWird}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          decelerationRate="fast"
          snapToAlignment="center"
          snapToInterval={width}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0EC',
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#F0F0EC',
    zIndex: 1000,
    elevation: 5,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    elevation: 6,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    width: width,
    flex: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 18,
    color: '#555',
    lineHeight: 28,
    marginBottom: 20,
    textAlign: 'left',
  },
  cardImage: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    marginVertical: 20,
  },
  linkButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: 20,
  },
  completeButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewReminderButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  viewReminderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WirdSwipeViewer;
