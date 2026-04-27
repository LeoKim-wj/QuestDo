import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

export default function TaskListScreen() {
  const router = useRouter();
  const { tasks, addTask, deleteTask, toggleTaskCompleted } = useTasks();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 24, marginBottom: 20, color: "black" }}>
        Task List
      </Text>

      <Button
        title="Add Sample Task"
        onPress={() =>
          addTask({
            id: Date.now().toString(),
            title: "New Task",
            completed: false,
          })
        }
      />

      {tasks.map((task) => (
        <View
          key={task.id}
          style={{
            marginTop: 15,
            padding: 10,
            borderWidth: 1,
            borderColor: "gray",
          }}
        >
          <Text style={{ color: "black", fontSize: 18 }}>{task.title}</Text>
          <Text style={{ color: "black" }}>
            {task.completed ? "Completed" : "Incomplete"}
          </Text>

          <Button
            title="Edit"
            onPress={() =>
              router.push({
                pathname: "/edit",
                params: { taskId: task.id },
              })
            }
          />

          <Button
            title="Check / Uncheck"
            onPress={() => toggleTaskCompleted(task.id)}
          />

          <Button title="Delete" onPress={() => deleteTask(task.id)} />
        </View>
      ))}
    </View>
  );
}