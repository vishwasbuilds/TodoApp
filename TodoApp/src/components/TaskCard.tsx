// Displays a task and forwards completion, edit, and delete actions to its parent.
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors, styles } from '../theme';
import type { Task } from '../types';

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  // Use the same priority color for the marker and label.
  const priorityColor =
    task.priority === 'High'
      ? colors.red
      : task.priority === 'Medium'
      ? colors.orange
      : colors.green;
  // Show a readable deadline, or a fallback when none has been set.
  const dateText = task.deadline
    ? new Date(task.deadline).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No deadline';

  return (
    <View style={[styles.taskCard, task.completed && { opacity: 0.72 }]}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
      >
        <Text style={styles.checkText}>{task.completed ? '✓' : ''}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View style={styles.taskTop}>
          <Text
            numberOfLines={2}
            style={[styles.taskTitle, task.completed && styles.completedTitle]}
          >
            {task.title}
          </Text>
          <View
            style={[styles.priorityDot, { backgroundColor: priorityColor }]}
          />
        </View>
        {!!task.description && (
          <Text numberOfLines={2} style={styles.taskDescription}>
            {task.description}
          </Text>
        )}
        <View style={styles.taskMeta}>
          <Text style={styles.metaText}>◷ {dateText}</Text>
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {task.priority}
          </Text>
        </View>
        <View style={styles.taskBottom}>
          <Text style={styles.categoryTag}>{task.category || 'Personal'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text style={[styles.actionText, { color: colors.red }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
