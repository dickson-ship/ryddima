import { View, Text, StyleSheet,TouchableOpacity} from "react-native";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";


export function Stat({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/* =========================================================
   OVERVIEW TAB
========================================================= */

export function OverviewTab({ parent, id,firstName, otherName, lastName, gender, dateOfBirth, onCallParent, admissionNumber, className, admissionDate, status }) {
  return (
    <>
      {/* PERSONAL */}

      <Section title="Personal Information" icon="person-outline">
        <InfoRow
          label="Full Name"
          value={`${firstName} ${
            otherName
          } ${lastName}`}
        />

        <InfoRow
          label="Gender"
          value={gender}
        />

        <InfoRow
          label="Date of Birth"
          value={dateOfBirth}
        />
      </Section>

      {/* SCHOOL */}

      <Section title="School Information" icon="school-outline">
        <InfoRow
          label="Admission Number"
          value={admissionNumber}
        />

        <InfoRow
          label="Class"
          value={className}
        />

        <InfoRow
          label="Admission Date"
          value={admissionDate}
        />

        <InfoRow
          label="Status"
          value={status}
          valueColor={Colors.success}
        />
      </Section>

      {/* PARENT */}

      <Section
        title="Parent / Guardian"
        icon="people-outline"
      >
        <InfoRow
          label="Name"
          value={parent.name}
        />

        <InfoRow
          label="Phone"
          value={parent.phone}
        />

        <InfoRow
          label="Email"
          value={parent.email}
        />

        <TouchableOpacity
          style={styles.contactButton}
          onPress={onCallParent}
          activeOpacity={0.8}
        >
          <Ionicons
            name="call-outline"
            size={18}
            color={Colors.primary}
          />

          <Text style={styles.contactButtonText}>
            Contact Parent
          </Text>
        </TouchableOpacity>
      </Section>
    </>
  );
}

/* =========================================================
   ACADEMICS TAB
========================================================= */



/* =========================================================
   ATTENDANCE TAB
========================================================= */
export function AttendanceTab({ attendance = [] }) {
  // Calculate totals for this student
  const presentCount = attendance.filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status === "absent"
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === "late"
  ).length;

  // Total attendance days
  const totalDays =
    presentCount +
    absentCount +
    lateCount;

  // Attendance rate
  // Here, late is counted as attended.
  const attendanceRate =
    totalDays > 0
      ? Math.round(
          ((presentCount + lateCount) / totalDays) * 100
        )
      : 0;

  return (
    <>
      <Section
        title="Attendance Overview"
        icon="calendar-outline"
      >
        <View style={styles.attendanceOverview}>
          <Text style={styles.attendancePercentage}>
            {attendanceRate}%
          </Text>

          <Text style={styles.attendanceDescription}>
            Attendance rate this term
          </Text>
        </View>

        <View style={styles.attendanceRow}>
          <AttendanceStat
            label="Present"
            value={String(presentCount)}
          />

          <AttendanceStat
            label="Absent"
            value={String(absentCount)}
          />

          <AttendanceStat
            label="Late"
            value={String(lateCount)}
          />
        </View>
      </Section>

      <Section
        title="Recent Attendance"
        icon="time-outline"
      >
        {attendance.length === 0 ? (
          <Text style={styles.noAttendance}>
            No attendance records found.
          </Text>
        ) : (
          attendance
            .sort(
              (a, b) =>
                new Date(b.date) -
                new Date(a.date)
            )
            .slice(0, 5)
            .map((record) => (
              <AttendanceRecord
                key={record.id}
                date={record.date}
                status={
                  record.status
                    .charAt(0)
                    .toUpperCase() +
                  record.status.slice(1)
                }
              />
            ))
        )}
      </Section>
    </>
  );
}

/* =========================================================
   FEES TAB
========================================================= */

export function FeesTab() {
  return (
    <>
      <Section
        title="Fee Summary"
        icon="wallet-outline"
      >
        <FeeRow
          label="Total Fees"
          value="GH₵ 3,500"
        />

        <FeeRow
          label="Amount Paid"
          value="GH₵ 3,000"
          valueColor={Colors.success}
        />

        <FeeRow
          label="Outstanding"
          value="GH₵ 500"
          valueColor={Colors.danger}
        />
      </Section>

      <Section
        title="Recent Payments"
        icon="card-outline"
      >
        <PaymentRow
          date="28 Aug 2026"
          amount="GH₵ 500"
          status="Successful"
        />

        <PaymentRow
          date="10 Jul 2026"
          amount="GH₵ 1,000"
          status="Successful"
        />

        <PaymentRow
          date="05 Jun 2026"
          amount="GH₵ 1,500"
          status="Successful"
        />
      </Section>
    </>
  );
}

/* =========================================================
   SECTION
========================================================= */

export function Section({ title, icon, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

export function InfoRow({
  label,
  value,
  valueColor,
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          valueColor && {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   SUBJECT ROW
========================================================= */

export function SubjectRow({ subject, score }) {
  return (
    <View style={styles.subjectRow}>
      <Text style={styles.subjectName}>
        {subject}
      </Text>

      <Text style={styles.subjectScore}>
        {score}
      </Text>
    </View>
  );
}

/* =========================================================
   ACTION ROW
========================================================= */

export function ActionRow({ icon, title }) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={20}
        color={Colors.primary}
      />

      <Text style={styles.actionText}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

export function AttendanceStat({ label, value }) {
  return (
    <View style={styles.attendanceStat}>
      <Text style={styles.attendanceStatValue}>
        {value}
      </Text>

      <Text style={styles.attendanceStatLabel}>
        {label}
      </Text>
    </View>
  );
}

export function AttendanceRecord({ date, status }) {
  const isPresent = status === "Present";

  return (
    <View style={styles.attendanceRecord}>
      <View style={styles.recordIcon}>
        <Ionicons
          name={
            isPresent
              ? "checkmark"
              : "close"
          }
          size={16}
          color={
            isPresent
              ? Colors.success
              : Colors.danger
          }
        />
      </View>

      <Text style={styles.recordDate}>
        {date}
      </Text>

      <Text
        style={[
          styles.recordStatus,
          {
            color: isPresent
              ? Colors.success
              : Colors.danger,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

/* =========================================================
   FEES
========================================================= */

export function FeeRow({
  label,
  value,
  valueColor,
}) {
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.feeValue,
          valueColor && {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function PaymentRow({
  date,
  amount,
  status,
}) {
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentIcon}>
        <Ionicons
          name="card-outline"
          size={18}
          color={Colors.primary}
        />
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentDate}>
          {date}
        </Text>

        <Text style={styles.paymentStatus}>
          {status}
        </Text>
      </View>

      <Text style={styles.paymentAmount}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  
  /* STATS */

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
  },

  statCard: {
    width: "32%",
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  statLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginBottom: 3,
  },

  statValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  /* TABS */

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  activeTab: {
    backgroundColor: Colors.primaryLight,
  },

  tabText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
  },

  activeTabText: {
    color: Colors.primary,
    fontWeight: "800",
  },

  /* SECTION */

  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  /* INFO */

  infoRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  infoValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },

  /* CONTACT */

  contactButton: {
    height: 45,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 14,
  },

  contactButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* ACADEMICS */

  subjectRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  subjectName: {
    fontSize: 12,
    color: Colors.text,
  },

  subjectScore: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  actionRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },

  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },

  /* ATTENDANCE */

  attendanceOverview: {
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  attendancePercentage: {
    fontSize: 35,
    fontWeight: "800",
    color: Colors.primary,
  },

  attendanceDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  attendanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
  },

  attendanceStat: {
    alignItems: "center",
  },

  attendanceStatValue: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
  },

  attendanceStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  attendanceRecord: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  recordDate: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
  },

  recordStatus: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* FEES */

  feeRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  feeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  feeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },

  paymentRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  paymentInfo: {
    flex: 1,
  },

  paymentDate: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },

  paymentStatus: {
    fontSize: 10,
    color: Colors.success,
    marginTop: 3,
  },

  paymentAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
});