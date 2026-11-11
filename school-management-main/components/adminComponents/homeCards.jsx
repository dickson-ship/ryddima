import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';



export function QuickAction({ icon, title }) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons
          name={icon}
          size={23}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.quickActionText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   ATTENDANCE ITEM
========================================================= */

export function AttendanceItem({ label, value }) {
  return (
    <View style={styles.attendanceItem}>
      <Text style={styles.attendanceItemLabel}>
        {label}
      </Text>

      <Text style={styles.attendanceItemValue}>
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   PAYMENT ITEM
========================================================= */

export function PaymentItem({
  name,
  student,
  amount,
  time,
}) {
  return (
    <View style={styles.paymentItem}>
      <View style={styles.paymentAvatar}>
        <Text style={styles.avatarText}>
          {name.charAt(0)}
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>
          {name}
        </Text>

        <Text style={styles.paymentStudent}>
          {student} • {time}
        </Text>
      </View>

      <View style={styles.paymentRight}>
        <Text style={styles.paymentAmount}>
          {amount}
        </Text>

        <View style={styles.paidBadge}>
          <Text style={styles.paidText}>
            Paid
          </Text>
        </View>
      </View>
    </View>
  );
}

export function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.statTitle}>{title}</Text>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statDescription}>
        {description}
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  /* QUICK ACTIONS */

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  quickAction: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  quickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },

  /* ATTENDANCE */

  attendanceItem: {
    alignItems: "center",
  },

  attendanceItemLabel: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: 4,
  },

  attendanceItemValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },

  /* PAYMENTS */

  paymentsCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 25,
  },

  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  paymentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },

  paymentStudent: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 3,
  },

  paymentRight: {
    alignItems: "flex-end",
  },

  paymentAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },

  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.successLight,
    borderRadius: 6,
  },

  paidText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.success,
  },
   /* STATS */

  statCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statTitle: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 3,
  },

  statDescription: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "500",
  },

});
