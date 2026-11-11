import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { ParentScreen, ChildPicker, EmptyState, studentName } from '@/components/parent/ParentScreen';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { fetchParentResults } from '@/services/parent/records';
import { Colors } from '@/constants/colors';

export default function ParentResults() {
  const params = useLocalSearchParams();
  const { children, selectedChild, loading, refreshing, error, reload } = useParentPortal(params.studentId);
  const [results, setResults] = useState([]); const [resultsLoading, setResultsLoading] = useState(false); const [resultsError, setResultsError] = useState('');
  const loadResults = useCallback(async () => { if (!selectedChild?.id) { setResults([]); return; } setResultsLoading(true); setResultsError(''); try { setResults(await fetchParentResults(selectedChild.id)); } catch (err) { console.error('Parent results load error:', err); setResultsError('Could not load academic results. Please try again later.'); } finally { setResultsLoading(false); } }, [selectedChild?.id]);
  useFocusEffect(useCallback(() => { loadResults(); }, [loadResults]));
  const average = results.length ? results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length : null;
  return <ParentScreen title="Academic results" subtitle="Published subject scores" loading={loading} refreshing={refreshing || resultsLoading} error={error || resultsError} onRefresh={async (refresh) => { await reload(refresh); await loadResults(); }}>
    {!selectedChild ? <EmptyState icon="school-outline" title="No linked student" message="Academic results will appear here once a student is linked and teachers have entered results." /> : <>
      <ChildPicker children={children} selectedChild={selectedChild} onSelect={(id) => router.replace({ pathname: '/(parent)/results', params: { studentId: id } })} />
      <View style={styles.summary}><View style={styles.summaryBox}><Text style={styles.summaryLabel}>Subjects available</Text><Text style={styles.summaryValue}>{results.length}</Text></View><View style={styles.summaryBox}><Text style={styles.summaryLabel}>Average score</Text><Text style={styles.summaryValue}>{average == null ? '—' : `${average.toFixed(1)}%`}</Text></View></View>
      <Text style={styles.heading}>{studentName(selectedChild)} · Results</Text>
      {resultsLoading ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Loading results...</Text></View> : results.length === 0 ? <EmptyState icon="document-text-outline" title="No results available yet" message="When your child's teacher records subject results, they will appear on this screen." /> : results.map((result) => {
        const score = Number(result.score); const scoreColor = score >= 80 ? Colors.success : score >= 50 ? Colors.primary : Colors.danger;
        return <View key={result.id} style={styles.resultCard}><View style={styles.resultTop}><View style={styles.subjectIcon}><Text style={styles.subjectInitial}>{String(result.subject || 'S').charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.subject}>{result.subject || 'Subject'}</Text><Text style={styles.meta}>{result.term || 'Term not specified'} · {result.academicYear || 'Academic year not specified'}</Text></View><Text style={[styles.score, { color: scoreColor }]}>{Number.isFinite(score) ? `${score}%` : '—'}</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0))}%`, backgroundColor: scoreColor }]} /></View><Text style={styles.teacher}>Recorded by {result.teacherName || 'teacher'}</Text></View>;
      })}
      <Text style={styles.note}>Results shown are the scores currently saved by the school. Contact the class teacher if you need clarification.</Text>
    </>}
  </ParentScreen>;
}
const styles = StyleSheet.create({ summary: { flexDirection: 'row', gap: 10, marginBottom: 22 }, summaryBox: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, padding: 15 }, summaryLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' }, summaryValue: { color: Colors.primary, fontSize: 22, fontWeight: '900', marginTop: 7 }, heading: { color: Colors.textDark, fontSize: 15, fontWeight: '900', marginBottom: 12 }, resultCard: { padding: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, marginBottom: 10 }, resultTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, subjectIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, subjectInitial: { color: Colors.primary, fontWeight: '900', fontSize: 16 }, subject: { color: Colors.textDark, fontWeight: '900', fontSize: 13 }, meta: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 }, score: { fontSize: 18, fontWeight: '900' }, track: { height: 6, borderRadius: 5, backgroundColor: Colors.border, overflow: 'hidden', marginTop: 13 }, progress: { height: 6, borderRadius: 5 }, teacher: { color: Colors.textMuted, fontSize: 10, marginTop: 9 }, note: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 8 }, loading: { alignItems: 'center', padding: 25 }, muted: { color: Colors.textSecondary, fontSize: 11, marginTop: 8 } });
