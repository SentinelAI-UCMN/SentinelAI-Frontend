import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

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

export default function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frames, setFrames] = useState([]);
  const [framesExpired, setFramesExpired] = useState(false);
  const [framesLoading, setFramesLoading] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, []);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/incidents/${incidentId}`);
      if (!res.ok) throw new Error('Failed to fetch incident');
      const data = await res.json();
      setIncident(data);

      if (data.riskLevel === 'High' || data.riskLevel === 'Medium') {
        fetchFrames();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFrames = async () => {
    setFramesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/incidents/${incidentId}/frames`);
      if (!res.ok) throw new Error('Failed to fetch frames');
      const data = await res.json();
      if (data.length === 0) {
        setFramesExpired(true);
      } else {
        // Only show max 3 frames
        setFrames(data.slice(0, 3));
      }
    } catch (e) {
      console.log('Frames not available:', e.message);
    } finally {
      setFramesLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const risk = incident?.riskLevel || 'Unknown';
  const showFrames = risk === 'High' || risk === 'Medium';

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#00F5C4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Report</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00F5C4" size="large" />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B5C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchIncident}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

          {/* Meta Card — full width on top */}
          <View style={[styles.metaCard, { borderColor: RISK_COLORS[risk] + '40' }]}>
            <View style={styles.metaRow}>
              <View style={[styles.riskBadge, { backgroundColor: RISK_BG[risk], borderColor: RISK_COLORS[risk] + '50' }]}>
                <Text style={[styles.riskText, { color: RISK_COLORS[risk] }]}>{risk} RISK</Text>
              </View>
              <Text style={styles.classification}>{incident.classification}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#3A4560" />
              <Text style={styles.infoText}>{formatDate(incident.createdAt)}</Text>
            </View>

            {incident.reportFilePath && (
              <View style={styles.infoRow}>
                <Ionicons name="document-outline" size={14} color="#3A4560" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {incident.reportFilePath.split(/[\\/]/).pop()}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="finger-print-outline" size={14} color="#3A4560" />
              <Text style={styles.infoText}>Incident ID: {incident.id}</Text>
            </View>
          </View>

          {/* Side by side layout — report left, frames right */}
          <View style={styles.contentRow}>

            {/* LEFT — Full Report */}
            <View style={[styles.reportCard, showFrames ? styles.reportCardWithFrames : styles.reportCardFull]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={16} color="#00F5C4" />
                <Text style={styles.sectionTitle}>FULL REPORT</Text>
              </View>
              <Text style={styles.reportText}>
                {incident.fullReport || incident.summary || 'No report content available.'}
              </Text>
            </View>

            {/* RIGHT — Evidence Frames (High/Medium only) */}
            {showFrames && (
              <View style={styles.framesCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="images-outline" size={16} color="#00F5C4" />
                  <Text style={styles.sectionTitle}>EVIDENCE</Text>
                </View>

                {framesLoading ? (
                  <View style={styles.framesCenter}>
                    <ActivityIndicator color="#00F5C4" size="small" />
                    <Text style={styles.framesSubText}>Loading frames...</Text>
                  </View>
                ) : framesExpired ? (
                  <View style={styles.framesCenter}>
                    <Ionicons name="time-outline" size={24} color="#3A4560" />
                    <Text style={styles.framesSubText}>Frames expired</Text>
                    <Text style={styles.framesSubTextSmall}>30-day retention policy</Text>
                  </View>
                ) : frames.length === 0 ? (
                  <View style={styles.framesCenter}>
                    <Ionicons name="alert-circle-outline" size={24} color="#3A4560" />
                    <Text style={styles.framesSubText}>No frames available</Text>
                  </View>
                ) : (
                  <View style={styles.framesList}>
                    {frames.map((frame, index) => (
                      <View key={index} style={styles.frameItem}>
                        <Text style={styles.frameLabel}>FRAME {frame.frameIndex + 1}</Text>
                        <img
                          src={frame.base64}
                          style={{
                            width: '100%',
                            borderRadius: 6,
                            marginTop: 4,
                            border: '1px solid #1A2035',
                          }}
                          alt={`evidence-frame-${frame.frameIndex}`}
                        />
                      </View>
                    ))}
                    <Text style={styles.framesNote}>
                      Showing {frames.length} of available frames
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: '#111827',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A2035',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#3A4560', fontSize: 14 },
  errorText: { color: '#FF3B5C', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1A2035',
  },
  retryText: { color: '#00F5C4', fontWeight: '600', fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  metaCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    gap: 10,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  riskBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  riskText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  classification: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1A2035' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#6B7FA3', fontSize: 12, flex: 1 },

  // Side by side layout
  contentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },

  // Report takes 55% when frames are present, full width when not
  reportCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1A2035',
  },
  reportCardWithFrames: { flex: 55 },
  reportCardFull: { flex: 1 },

  // Frames take 45% of the row
  framesCard: {
    flex: 45,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1A2035',
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#3A4560', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  reportText: { color: '#C8D4E8', fontSize: 13, lineHeight: 22 },

  framesList: { gap: 10 },
  frameItem: { gap: 2 },
  frameLabel: { color: '#3A4560', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  framesCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  framesSubText: { color: '#3A4560', fontSize: 12, textAlign: 'center' },
  framesSubTextSmall: { color: '#1A2035', fontSize: 10, textAlign: 'center' },
  framesNote: {
    color: '#3A4560',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});