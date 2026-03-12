import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { convertFile, downloadConvertedFile } from '../utils/fileConverter';

const FILE_TYPES = [
  { id: 'excel', icon: 'grid', label: 'Excel', color: '#10A37F', extensions: ['.xlsx', '.xls'] },
  { id: 'word', icon: 'document-text', label: 'Word', color: '#4285F4', extensions: ['.docx', '.doc'] },
  { id: 'powerpoint', icon: 'easel', label: 'PowerPoint', color: '#EA4335', extensions: ['.pptx', '.ppt'] },
  { id: 'image', icon: 'image', label: 'Görsel', color: '#8B5CF6', extensions: ['.jpg', '.png', '.gif'] },
  { id: 'text', icon: 'document', label: 'Metin', color: '#F59E0B', extensions: ['.txt', '.rtf'] },
];

const CONVERSION_OPTIONS = [
  { id: 'pdf', icon: 'document', label: 'PDF', color: '#DC2626' },
  { id: 'excel', icon: 'grid', label: 'Excel', color: '#10A37F' },
  { id: 'word', icon: 'document-text', label: 'Word', color: '#4285F4' },
  { id: 'powerpoint', icon: 'easel', label: 'PowerPoint', color: '#EA4335' },
  { id: 'image', icon: 'image', label: 'Görsel', color: '#8B5CF6' },
  { id: 'text', icon: 'document-outline', label: 'Metin', color: '#F59E0B' },
];

export default function AIFileScreen({ t, theme, onClose }) {
  const [selectedFileType, setSelectedFileType] = useState('excel');
  const [selectedConversion, setSelectedConversion] = useState('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploadedFile(file);
        
        // Otomatik dosya türü algılama
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const detectedType = FILE_TYPES.find(type => 
          type.extensions.some(ext => ext.slice(1) === fileExtension)
        );
        
        if (detectedType) {
          setSelectedFileType(detectedType.id);
          Alert.alert('Dosya Yüklendi', `${file.name} başarıyla yüklendi. Otomatik olarak ${detectedType.label} olarak algılandı.`);
        } else {
          Alert.alert('Dosya Yüklendi', `${file.name} başarıyla yüklendi.`);
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu.');
      console.error('File upload error:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleConvert = async () => {
    if (!uploadedFile) {
      Alert.alert('Hata', 'Lütfen önce bir dosya yükleyin.');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Web Gerekli',
        'Bu sürümde gerçek dosya dönüştürme işlemi web üzerinde indirme olarak çalışır. Lütfen web sürümünden deneyin.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const result = await convertFile({
        asset: uploadedFile,
        sourceType: selectedFileType,
        targetType: selectedConversion,
      });

      const downloadedName = downloadConvertedFile({
        blob: result.blob,
        originalName: uploadedFile.name,
        targetType: selectedConversion,
      });

      setIsProcessing(false);
      Alert.alert(
        'Dönüşüm Başarılı!',
        `${uploadedFile.name} dosyası ${downloadedName} olarak indirildi.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      setIsProcessing(false);
      console.error('Conversion error:', error);
      Alert.alert(
        'Dönüşüm Hatası',
        error?.message || 'Dosya dönüştürülürken beklenmeyen bir hata oluştu.'
      );
    }
  };

  const currentFileType = FILE_TYPES.find(f => f.id === selectedFileType);
  const currentConversion = CONVERSION_OPTIONS.find(c => c.id === selectedConversion);

  // Default theme values
  const safeTheme = {
    headerText: theme?.headerText || '#FFFFFF',
    headerIcon: theme?.headerIcon || '#FFFFFF',
    screenBackground: theme?.screenBackground || '#343541',
    sidebarBackground: theme?.sidebarBackground || '#202123',
    sidebarText: theme?.sidebarText || '#FFFFFF',
    sidebarBorder: theme?.sidebarBorder || '#4D4D4F',
    sidebarMutedText: theme?.sidebarMutedText || '#8E8EA0',
    headerBackground: theme?.headerBackground || '#343541',
  };

  return (
    <View style={[styles.container, { backgroundColor: safeTheme.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: safeTheme.sidebarBorder }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={safeTheme.headerIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: safeTheme.headerText }]}>AI Dosya Dönüştürücü</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: safeTheme.headerBackground }]}>
          <View style={[styles.heroIcon, { backgroundColor: currentConversion.color + '20' }]}>
            <Ionicons name="flash" size={32} color={currentConversion.color} />
          </View>
          <Text style={[styles.heroTitle, { color: safeTheme.headerText }]}>
            Dosya Dönüştürme
          </Text>
          <Text style={[styles.heroSubtitle, { color: safeTheme.sidebarMutedText }]}>
            Yapay zeka ile dosyalarınızı farklı formatlara dönüştürün
          </Text>
        </View>

        {/* File Upload Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeTheme.sidebarText }]}>
            Dosya Yükle
          </Text>
          
          {uploadedFile ? (
            <View style={[styles.uploadedFileCard, { backgroundColor: safeTheme.headerBackground, borderColor: safeTheme.sidebarBorder }]}>
              <View style={styles.fileInfo}>
                <View style={[styles.fileIcon, { backgroundColor: currentFileType.color + '20' }]}>
                  <Ionicons name={currentFileType.icon} size={24} color={currentFileType.color} />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: safeTheme.sidebarText }]} numberOfLines={1}>
                    {uploadedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: safeTheme.sidebarMutedText }]}>
                    {uploadedFile.size ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Bilinmeyen boyut'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removeFileButton} onPress={handleRemoveFile}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: safeTheme.headerBackground, borderColor: safeTheme.sidebarBorder }]} 
              onPress={handleFileUpload}
            >
              <View style={[styles.uploadIcon, { backgroundColor: currentConversion.color + '20' }]}>
                <Ionicons name="cloud-upload" size={32} color={currentConversion.color} />
              </View>
              <Text style={[styles.uploadTitle, { color: safeTheme.sidebarText }]}>
                Dosya Seç
              </Text>
              <Text style={[styles.uploadSubtitle, { color: safeTheme.sidebarMutedText }]}>
                Herhangi bir dosya türü yükleyin, otomatik algılanacaktır
              </Text>
              <View style={[styles.uploadButtonInner, { backgroundColor: currentConversion.color }]}>
                <Ionicons name="folder-open" size={16} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Gözat</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* File Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeTheme.sidebarText }]}>
            Kaynak Dosya Türü
          </Text>
          <View style={styles.fileTypeGrid}>
            {FILE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.fileTypeCard,
                  {
                    backgroundColor: selectedFileType === type.id ? type.color + '15' : 'transparent',
                    borderColor: selectedFileType === type.id ? type.color : safeTheme.sidebarBorder,
                  },
                ]}
                onPress={() => setSelectedFileType(type.id)}
              >
                <View style={[styles.fileTypeIcon, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon} size={24} color={type.color} />
                </View>
                <Text style={[styles.fileTypeName, { color: safeTheme.sidebarText }]}>
                  {type.label}
                </Text>
                <Text style={[styles.fileTypeExtensions, { color: safeTheme.sidebarMutedText }]}>
                  {type.extensions.join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conversion Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeTheme.sidebarText }]}>
            Dönüştürülecek Format
          </Text>
          <View style={styles.conversionGrid}>
            {CONVERSION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.conversionCard,
                  {
                    backgroundColor: selectedConversion === option.id ? option.color + '15' : 'transparent',
                    borderColor: selectedConversion === option.id ? option.color : safeTheme.sidebarBorder,
                  },
                ]}
                onPress={() => setSelectedConversion(option.id)}
              >
                <View style={[styles.conversionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={20} color={option.color} />
                </View>
                <Text style={[styles.conversionName, { color: safeTheme.sidebarText }]}>
                  {option.label}
                </Text>
                {selectedConversion === option.id && (
                  <Ionicons name="checkmark-circle" size={16} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Convert Button */}
        <TouchableOpacity
          style={[
            styles.convertButton,
            { backgroundColor: currentConversion.color },
            isProcessing && styles.convertButtonDisabled,
          ]}
          onPress={handleConvert}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Ionicons name="sync" size={20} color="#FFFFFF" style={styles.convertButtonIcon} />
              <Text style={styles.convertButtonText}>Dönüştürülüyor...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#FFFFFF" style={styles.convertButtonIcon} />
              <Text style={styles.convertButtonText}>
                {currentFileType.label} → {currentConversion.label}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10A37F" />
            <Text style={[styles.featureText, { color: safeTheme.sidebarText }]}>
              Hızlı ve güvenli dönüşüm
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10A37F" />
            <Text style={[styles.featureText, { color: safeTheme.sidebarText }]}>
              Yüksek kalite koruma
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10A37F" />
            <Text style={[styles.featureText, { color: safeTheme.sidebarText }]}>
              Otomatik format algılama
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    marginVertical: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  removeFileButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  fileTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fileTypeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  fileTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileTypeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileTypeExtensions: {
    fontSize: 11,
    textAlign: 'center',
  },
  conversionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  conversionCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  conversionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversionName: {
    fontSize: 12,
    fontWeight: '600',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 24,
    gap: 8,
  },
  convertButtonDisabled: {
    opacity: 0.6,
  },
  convertButtonIcon: {
    marginRight: 8,
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
  },
});
