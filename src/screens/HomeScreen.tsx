import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const quickActions = [
    {
      title: '新增專案',
      subtitle: '創建新的影視專案',
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
      onPress: () => console.log('新增專案'),
    },
    {
      title: '營運記錄',
      subtitle: '記錄日常營運碳排放',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
      onPress: () => console.log('營運記錄'),
    },
    {
      title: '設備管理',
      subtitle: '管理拍攝設備資料',
      icon: 'camera' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      onPress: () => console.log('設備管理'),
    },
    {
      title: '快速記錄',
      subtitle: '快速記錄碳排放數據',
      icon: 'flash' as keyof typeof Ionicons.glyphMap,
      color: '#ef4444',
      onPress: () => console.log('快速記錄'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 歡迎區域 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>歡迎使用 CarbonLens</Text>
          <Text style={styles.welcomeSubtitle}>
            專業的影視製作碳足跡管理系統
          </Text>
        </View>

        {/* 快速操作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 統計摘要 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>本月統計</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>活躍專案</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>245</Text>
              <Text style={styles.statLabel}>記錄總數</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1.2t</Text>
              <Text style={styles.statLabel}>CO₂ 排放</Text>
            </View>
          </View>
        </View>

        {/* 最近活動 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近活動</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Ionicons name="folder" size={20} color="#10b981" />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>新專案「夢想之城」</Text>
                <Text style={styles.activityTime}>2小時前</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="flash" size={20} color="#3b82f6" />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>新增運輸記錄</Text>
                <Text style={styles.activityTime}>5小時前</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="analytics" size={20} color="#f59e0b" />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>生成月度報告</Text>
                <Text style={styles.activityTime}>1天前</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default HomeScreen; 