import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";


//helper fucntion to disaply date in  NZ date format
const formatDateNZ = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

type Task = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("2026-04-26");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const tasks: Task[] = [
    { id: "1", title: "Finish calendar screen", dueDate: "2026-04-26", completed: false },
    { id: "2", title: "Team meeting", dueDate: "2026-04-27", completed: false },
    { id: "3", title: "Submit COMP602 work", dueDate: "2026-05-01", completed: false },
  ];

  const isSameWeek = (taskDate: string, selected: string) => {
    const task = new Date(taskDate);
    const chosen = new Date(selected);

    const startOfWeek = new Date(chosen);
    startOfWeek.setDate(chosen.getDate() - chosen.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return task >= startOfWeek && task <= endOfWeek;
  };

  const filteredTasks = tasks.filter((task) => {
    if (viewMode === "day") {
      return task.dueDate === selectedDate;
    }

    if (viewMode === "week") {
      return isSameWeek(task.dueDate, selectedDate);
    }

    if (viewMode === "month") {
      return task.dueDate.startsWith(selectedDate.slice(0, 7));
    }

    return true;
  });

  const markedDates = tasks.reduce((marks: any, task) => {
    marks[task.dueDate] = {
      marked: true,
      dotColor: "purple",
    };
    return marks;
  }, {});

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: "purple",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuestDo Calendar</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => setViewMode("month")}>
          <Text style={styles.buttonText}>Month</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setViewMode("week")}>
          <Text style={styles.buttonText}>Week</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setViewMode("day")}>
          <Text style={styles.buttonText}>Day</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />

      <Text style={styles.subtitle}>
        {viewMode.toUpperCase()} tasks
      </Text>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>⚔️ {item.title}</Text>

            // changed to NZ date 
            <Text style={styles.taskDate}>Due: {formatDateNZ(item.dueDate)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No quests due for this view.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "purple",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  taskCard: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDate: {
    marginTop: 5,
    color: "#555",
  },
  emptyText: {
    marginTop: 20,
    color: "#777",
    textAlign: "center",
  },
});