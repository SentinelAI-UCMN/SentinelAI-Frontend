import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, SafeAreaView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.161.34:8082';

const RISK_COLORS = {
  High: '#FF3B5C',
  Medium: '#FFB830',
  Low: '#00F5C4',
  Unknown: '#3A4560',
};

const RISK_BG = {
  High: '#2A0A10',
  Medium: '#2A1A00',
  Low: '#002A20',
  Unknown: '#1A2035',
};

export default function UploadScreen() {
  const [mode, setMode] = useState('image'); // 'image' or 'video'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const analyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    startPulse();

    try {
      const formData = new FormData();

      if (mode === 'image') {
        setProgress('Sending images to AI...');
        selectedFiles.forEach(file => formData.append('files', file));
        const res = await fetch(`${API_BASE}/api/incidents/analyze`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setResult(data);
      } else {
        setProgress('Uploading video and extracting frames...');
        formData.append('video', selectedFiles[0]);
        const res = await fetch(`${API_BASE}/api/incidents/analyze-video`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
      setProgress('');
      stopPulse();
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const risk = result?.riskLevel || 'Unknown';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>AI ANALYSIS</Text>
            <Text style={styles.headerTitle}>Upload</Text>
          </View>
          {selectedFiles.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
              <Ionicons name="trash-outline" size={16} color="#FF3B5C" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mode Selector */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'image' && styles.modeBtnActive]}
            onPress={() => { setMode('image'); clearAll(); }}
          >
            <Ionicons name="images-outline" size={18} color={mode === 'image' ? '#0A0E1A' : '#3A4560'} />
            <Text style={[styles.modeBtnText, mode === 'image' && styles.modeBtnTextActive]}>Images</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'video' && styles.modeBtnActive]}
            onPress={() => { setMode('video'); clearAll(); }}
          >
            <Ionicons name="film-outline" size={18} color={mode === 'video' ? '#0A0E1A' : '#3A4560'} />
            <Text style={[styles.modeBtnText, mode === 'video' && styles.modeBtnTextActive]}>Video</Text>
          </TouchableOpacity>
        </View>

        {/* Drop Zone */}
        <View style={styles.dropZoneWrapper}>
          {/* Hidden file input - rendered via web div */}
          {typeof document !== 'undefined' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed ' + (selectedFiles.length > 0 ? '#00F5C4' : '#1A2035'),
                borderRadius: 16,
                padding: 32,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: selectedFiles.length > 0 ? 'rgba(0,245,196,0.05)' : '#111827',
                transition: 'all 0.2s ease',
              }}
              onClick={() => mode === 'image' ? imageInputRef.current?.click() : videoInputRef.current?.click()}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              {selectedFiles.length === 0 ? (
                <div style={{ color: '#3A4560' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>
                    {mode === 'image' ? '🖼️' : '🎬'}
                  </div>
                  <div style={{ color: '#6B7FA3', fontSize: 15, marginBottom: 6, fontFamily: 'monospace' }}>
                    Drop {mode === 'image' ? 'images' : 'video'} here or click to browse
                  </div>
                  <div style={{ color: '#3A4560', fontSize: 12, fontFamily: 'monospace' }}>
                    {mode === 'image' ? 'JPEG, PNG supported • Multiple files allowed' : 'MP4 supported • Max 200MB'}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ color: '#00F5C4', fontSize: 13, marginBottom: 12, fontFamily: 'monospace', fontWeight: 600 }}>
                    ✓ {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                  </div>
                  {selectedFiles.map((file, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      backgroundColor: 'rgba(0,245,196,0.08)', borderRadius: 8,
                      padding: '8px 12px', marginBottom: 6,
                      fontFamily: 'monospace', fontSize: 12,
                    }}>
                      <span style={{ color: '#C8D4E8' }}>{file.name}</span>
                      <span style={{ color: '#3A4560' }}>{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                  <div style={{ color: '#3A4560', fontSize: 11, marginTop: 8, fontFamily: 'monospace' }}>
                    Click to change selection
                  </div>
                </div>
              )}
            </div>
          )}
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, (isAnalyzing || selectedFiles.length === 0) && styles.analyzeBtnDisabled]}
          onPress={analyze}
          disabled={isAnalyzing || selectedFiles.length === 0}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color="#0A0E1A" size="small" />
              <Text style={styles.analyzeBtnText}>{progress || 'Analyzing...'}</Text>
            </>
          ) : (
            <>
              <Ionicons name="scan-outline" size={20} color="#0A0E1A" />
              <Text style={styles.analyzeBtnText}>
                Analyze {mode === 'image' ? 'Images' : 'Video'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Note for video */}
        {mode === 'video' && !isAnalyzing && (
          <Text style={styles.note}>
            ⚡ Video analysis extracts frames every 5 seconds (up to 5 frames) and may take 30–60 seconds.
          </Text>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#FF3B5C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, { borderColor: RISK_COLORS[risk] + '40' }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#00F5C4" />
              <Text style={styles.resultHeaderText}>ANALYSIS COMPLETE</Text>
            </View>

            <View style={styles.resultRow}>
              <View style={[styles.riskBadge, { backgroundColor: RISK_BG[risk], borderColor: RISK_COLORS[risk] + '50' }]}>
                <Text style={[styles.riskText, { color: RISK_COLORS[risk] }]}>{risk} RISK</Text>
              </View>
              <Text style={styles.classification}>{result.classification}</Text>
            </View>

            <View style={styles.divider} />

            {result.report && (
              <Text style={styles.reportText}>{result.report}</Text>
            )}

            {result.videoName && (
              <View style={styles.metaRow}>
                <Ionicons name="videocam-outline" size={13} color="#3A4560" />
                <Text style={styles.metaText}>{result.videoName}</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Ionicons name="finger-print-outline" size={13} color="#3A4560" />
              <Text style={styles.metaText}>Incident ID: {result.id}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerSub: { color: '#3A4560', fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF3B5C10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF3B5C30',
  },
  clearText: { color: '#FF3B5C', fontSize: 13, fontWeight: '600' },
  modeRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: { backgroundColor: '#00F5C4' },
  modeBtnText: { color: '#3A4560', fontWeight: '600', fontSize: 14 },
  modeBtnTextActive: { color: '#0A0E1A' },
  dropZoneWrapper: { marginHorizontal: 16, marginBottom: 16 },
  analyzeBtn: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F5C4',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  analyzeBtnDisabled: { opacity: 0.4 },
  analyzeBtnText: { color: '#0A0E1A', fontWeight: '700', fontSize: 15 },
  note: {
    color: '#3A4560',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorCard: {
    marginHorizontal: 16,
    backgroundColor: '#FF3B5C10',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FF3B5C30',
    marginBottom: 12,
  },
  errorText: { color: '#FF3B5C', fontSize: 13, flex: 1 },
  resultCard: {
    marginHorizontal: 16,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultHeaderText: { color: '#00F5C4', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  riskBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  riskText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  classification: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1A2035' },
  reportText: { color: '#C8D4E8', fontSize: 13, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#3A4560', fontSize: 12 },
});