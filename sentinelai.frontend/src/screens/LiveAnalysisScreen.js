import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, SafeAreaView, Animated
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

const RISK_COLORS = {
  High: '#FF3B5C',
  Medium: '#FFB830',
  Low: '#00F5C4',
  Unknown: '#3A4560',
};

export default function LiveAnalysisScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLive]);

  useEffect(() => {
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [intervalId]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [{ message, type, timestamp, id: Date.now() }, ...prev].slice(0, 20));
  };

  const captureAndAnalyze = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    addLog('Capturing frame...', 'info');

    try {
      const video = document.querySelector('video');
      if (!video) throw new Error('No video stream found');

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));

      addLog('Sending to AI...', 'info');

      const formData = new FormData();
      formData.append('files', blob, 'frame.jpg');

      const response = await fetch(`${API_BASE}/api/incidents/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setResult(data);
      addLog(`✓ ${data.classification} — ${data.riskLevel} Risk`,
        data.riskLevel === 'High' ? 'danger' :
        data.riskLevel === 'Medium' ? 'warning' : 'success');

    } catch (e) {
      addLog(`✗ ${e.message}`, 'danger');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleLive = () => {
    if (isLive) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsLive(false);
      addLog('Live monitoring stopped', 'info');
    } else {
      addLog('Live monitoring started — analyzing every 10s', 'success');
      setIsLive(true);
      captureAndAnalyze();
      const id = setInterval(captureAndAnalyze, 10000);
      setIntervalId(id);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={48} color="#3A4560" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSub}>SentinelAI needs camera access to analyze your surroundings.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>LIVE FEED</Text>
          <Text style={styles.headerTitle}>Analysis</Text>
        </View>
        {isLive && (
          <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ACTIVE</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.bracketTL} />
          <View style={styles.bracketTR} />
          <View style={styles.bracketBL} />
          <View style={styles.bracketBR} />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator color="#00F5C4" size="large" />
              <Text style={styles.analyzingText}>ANALYZING...</Text>
            </View>
          )}
        </CameraView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureBtn, isAnalyzing && styles.btnDisabled]}
          onPress={captureAndAnalyze}
          disabled={isAnalyzing}
        >
          <Ionicons name="camera" size={20} color="#0A0E1A" />
          <Text style={styles.captureBtnText}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.liveBtn, isLive && styles.liveBtnActive]}
          onPress={toggleLive}
        >
          <Ionicons name={isLive ? 'stop' : 'play'} size={20} color={isLive ? '#FF3B5C' : '#00F5C4'} />
          <Text style={[styles.liveBtnText, isLive && { color: '#FF3B5C' }]}>
            {isLive ? 'Stop' : 'Live'}
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.resultCard, { borderColor: RISK_COLORS[result.riskLevel] + '50' }]}>
          <View style={styles.resultRow}>
            <View style={[styles.riskPill, { backgroundColor: RISK_COLORS[result.riskLevel] + '20' }]}>
              <Text style={[styles.riskPillText, { color: RISK_COLORS[result.riskLevel] }]}>
                {result.riskLevel} RISK
              </Text>
            </View>
            <Text style={styles.classificationText}>{result.classification}</Text>
          </View>
          {result.report && (
            <Text style={styles.reportText} numberOfLines={3}>{result.report}</Text>
          )}
        </View>
      )}

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>ACTIVITY LOG</Text>
        <ScrollView style={styles.logScroll} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <Text style={styles.logEmpty}>No activity yet</Text>
          ) : (
            logs.map(log => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text style={[styles.logMsg, {
                  color: log.type === 'danger' ? '#FF3B5C' :
                    log.type === 'success' ? '#00F5C4' :
                      log.type === 'warning' ? '#FFB830' : '#6B7FA3'
                }]}>{log.message}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerSub: { color: '#3A4560', fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF3B5C40',
    gap: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B5C' },
  liveText: { color: '#FF3B5C', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  cameraContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 420,
    backgroundColor: '#111827',
  },
  camera: { flex: 1 },
  bracketTL: { position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#00F5C4' },
  bracketTR: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#00F5C4' },
  bracketBL: { position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#00F5C4' },
  bracketBR: { position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#00F5C4' },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0E1A90',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  analyzingText: { color: '#00F5C4', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F5C4',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  captureBtnText: { color: '#0A0E1A', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  liveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#00F5C430',
  },
  liveBtnActive: { borderColor: '#FF3B5C40', backgroundColor: '#FF3B5C10' },
  liveBtnText: { color: '#00F5C4', fontWeight: '700', fontSize: 14 },
  resultCard: {
    marginHorizontal: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  riskPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  riskPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  classificationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  reportText: { color: '#6B7FA3', fontSize: 12, lineHeight: 18 },
  logContainer: { flex: 1, marginHorizontal: 16, marginBottom: 8 },
  logTitle: { color: '#3A4560', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  logScroll: { flex: 1 },
  logEmpty: { color: '#3A4560', fontSize: 12, textAlign: 'center', paddingTop: 16 },
  logRow: { flexDirection: 'row', gap: 10, marginBottom: 6, alignItems: 'flex-start' },
  logTime: { color: '#3A4560', fontSize: 10, fontFamily: 'monospace', paddingTop: 1 },
  logMsg: { fontSize: 12, flex: 1, lineHeight: 16 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  permissionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  permissionSub: { color: '#6B7FA3', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  permissionBtn: { backgroundColor: '#00F5C4', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  permissionBtnText: { color: '#0A0E1A', fontWeight: '700', fontSize: 15 },
});