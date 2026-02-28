import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, SafeAreaView
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

export default function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncident();
  }, []);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/incidents/${incidentId}`);
      if (!res.ok) throw new Error('Failed to fetch incident');
      const data = await res.json();
      setIncident(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      
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
          {}
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
                <Text style={styles.infoText} numberOfLines={1}>{incident.reportFilePath.split(/[\\/]/).pop()}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="finger-print-outline" size={14} color="#3A4560" />
              <Text style={styles.infoText}>Incident ID: {incident.id}</Text>
            </View>
          </View>

          {}
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Ionicons name="document-text-outline" size={16} color="#00F5C4" />
              <Text style={styles.reportTitle}>FULL REPORT</Text>
            </View>
            <Text style={styles.reportText}>
              {incident.fullReport || incident.summary || 'No report content available.'}
            </Text>
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
  reportCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1A2035',
  },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportTitle: { color: '#3A4560', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  reportText: { color: '#C8D4E8', fontSize: 13, lineHeight: 22 },
});