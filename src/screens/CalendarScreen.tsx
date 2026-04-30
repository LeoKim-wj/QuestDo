import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/task";

const getDateKey = (dateString: string) => dateString.slice(0, 10);

const formatDateNZ = (dateString: string) => {
  const [year, month, day] = getDateKey(dateString).split("-");
  return `${day}/${month}/${year}`;
};

export default function CalendarScreen() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const isSameWeek = (taskDate: string, selected: string) => {
    const task = new Date(`${getDateKey(taskDate)}T00:00:00`);
    const chosen = new Date(`${selected}T00:00:00`);

    const startOfWeek = new Date(chosen);
    startOfWeek.setDate(chosen.getDate() - chosen.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return task >= startOfWeek && task <= endOfWeek;
  };

  const filteredTasks = tasks.filter((task) => {
    const taskDate = getDateKey(task.dueDate);

    if (viewMode === "day") {
      return taskDate === selectedDate;
    }

    if (viewMode === "week") {
      return isSameWeek(task.dueDate, selectedDate);
    }

    if (viewMode === "month") {
      return taskDate.startsWith(selectedDate.slice(0, 7));
    }

    return true;
  });

  const markedDates = tasks.reduce<Record<string, any>>((marks, task) => {
    const taskDate = getDateKey(task.dueDate);

    marks[taskDate] = {
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

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDate}>Due: {formatDateNZ(item.dueDate)}</Text>
      <Text style={styles.taskDate}>Category: {item.category}</Text>
      {item.description ? (
        <Text style={styles.taskDate}>{item.description}</Text>
      ) : null}
    </View>
  );

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

      <Text style={styles.subtitle}>{viewMode.toUpperCase()} Tasks</Text>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
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
