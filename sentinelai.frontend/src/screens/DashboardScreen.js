import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView
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

export default function DashboardScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/incidents`);
      const data = await res.json();
      setIncidents(data);
      setStats({
        total: data.length,
        high: data.filter(i => i.riskLevel === 'High').length,
        medium: data.filter(i => i.riskLevel === 'Medium').length,
        low: data.filter(i => i.riskLevel === 'Low').length,
      });
    } catch (e) {
      console.log('Failed to fetch incidents:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //autorestarts every 10 seconds ni mga ya 
  useEffect(() => {
    fetchIncidents(); 
    const interval = setInterval(fetchIncidents, 10000); 
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5C4" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>SURVEILLANCE SYSTEM</Text>
            <Text style={styles.headerTitle}>SentinelAI</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="TOTAL" value={stats.total} color="#00F5C4" icon="layers" />
          <StatCard label="HIGH" value={stats.high} color="#FF3B5C" icon="warning" />
          <StatCard label="MEDIUM" value={stats.medium} color="#FFB830" icon="alert-circle" />
          <StatCard label="LOW" value={stats.low} color="#00F5C4" icon="checkmark-circle" />
        </View>

        {/* Recent Incidents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT INCIDENTS</Text>
            <TouchableOpacity onPress={fetchIncidents}>
              <Ionicons name="refresh" size={18} color="#00F5C4" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#00F5C4" style={{ marginTop: 40 }} />
          ) : incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={48} color="#3A4560" />
              <Text style={styles.emptyText}>No incidents recorded</Text>
            </View>
          ) : (
            incidents.slice().reverse().map((incident, index) => (
              <IncidentCard
                key={incident.id || index}
                incident={incident}
                formatDate={formatDate}
                onPress={() => navigation.navigate('IncidentDetail', { incidentId: incident.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function IncidentCard({ incident, formatDate, onPress }) {
  const risk = incident.riskLevel || 'Unknown';

  return (
    <TouchableOpacity
      style={[styles.incidentCard, { borderLeftColor: RISK_COLORS[risk] }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.incidentLeft}>
          <View style={[styles.riskBadge, { backgroundColor: RISK_BG[risk], borderColor: RISK_COLORS[risk] + '50' }]}>
            <Text style={[styles.riskText, { color: RISK_COLORS[risk] }]}>{risk}</Text>
          </View>
          <Text style={styles.classification}>{incident.classification || 'Unknown'}</Text>
        </View>
        <View style={styles.incidentRight}>
          <Text style={styles.incidentDate}>{formatDate(incident.createdAt)}</Text>
          <Ionicons name="chevron-forward" size={14} color="#3A4560" />
        </View>
      </View>

      {incident.summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {incident.summary}
        </Text>
      )}

      {incident.videoName && (
        <View style={styles.metaRow}>
          <Ionicons name="videocam-outline" size={12} color="#3A4560" />
          <Text style={styles.metaText}>{incident.videoName}</Text>
        </View>
      )}
    </TouchableOpacity>
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
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#3A4560', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  section: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { color: '#3A4560', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: '#3A4560', fontSize: 14 },
  incidentCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    gap: 8,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  incidentRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  riskBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  riskText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  classification: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },
  incidentDate: { color: '#3A4560', fontSize: 11 },
  summary: { color: '#6B7FA3', fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#3A4560', fontSize: 11 },
});