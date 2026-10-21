// Renders the task dashboard and editor using state and handlers from App.
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Field from '../components/Field';
import TaskCard from '../components/TaskCard';
import { colors, styles } from '../theme';
import type { Priority, Task, User } from '../types';

type Filter = 'All' | 'Pending' | 'Completed';
type Sort = 'Deadline' | 'Priority' | 'Newest';

type TasksScreenProps = {
  user: User;
  tasks: Task[];
  visibleTasks: Task[];
  completedCount: number;
  progress: number;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  sort: Sort;
  setSort: (sort: Sort) => void;
  showForm: boolean;
  editingId: string | null;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  scheduledAt: string;
  setScheduledAt: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  category: string;
  setCategory: (value: string) => void;
  busy: boolean;
  onConfirmLogout: () => void;
  onResetForm: () => void;
  onShowForm: () => void;
  onSaveTask: () => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
};

export default function TasksScreen({
  user,
  tasks,
  visibleTasks,
  completedCount,
  progress,
  filter,
  setFilter,
  sort,
  setSort,
  showForm,
  editingId,
  title,
  setTitle,
  description,
  setDescription,
  scheduledAt,
  setScheduledAt,
  deadline,
  setDeadline,
  priority,
  setPriority,
  category,
  setCategory,
  busy,
  onConfirmLogout,
  onResetForm,
  onShowForm,
  onSaveTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TasksScreenProps) {
  // The list header combines the progress summary with task filtering controls.
  const listHeader = (
    <>
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
          <Text style={styles.pageTitle}>
            Hello, {user.name.split(' ')[0] || 'there'} 👋
          </Text>
          <Text style={styles.muted}>Let's make progress today.</Text>
        </View>
      </View>
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>YOUR PROGRESS</Text>
            <Text style={styles.summaryBig}>
              {progress}% <Text style={styles.summarySmall}>completed</Text>
            </Text>
          </View>
          <View style={styles.summaryIcon}>
            <Text style={{ fontSize: 22, color: 'white' }}>✓</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` as `${number}%` },
            ]}
          />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{tasks.length} total tasks</Text>
          <Text style={styles.statText}>{completedCount} completed</Text>
          <Text style={styles.statText}>
            {tasks.length - completedCount} left
          </Text>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Your tasks</Text>
          <Text style={styles.muted}>{visibleTasks.length} tasks showing</Text>
        </View>
        <TouchableOpacity onPress={onShowForm} style={styles.addButton}>
          <Text style={styles.addButtonText}>＋ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pills}>
        {(['All', 'Pending', 'Completed'] as const).map(value => (
          <TouchableOpacity
            key={value}
            onPress={() => setFilter(value)}
            style={[styles.pill, filter === value && styles.pillSelected]}
          >
            <Text
              style={[
                styles.pillText,
                filter === value && styles.pillTextSelected,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sortRow}>
        <Text style={styles.label}>SORT BY</Text>
        {(['Deadline', 'Priority', 'Newest'] as const).map(value => (
          <TouchableOpacity key={value} onPress={() => setSort(value)}>
            <Text
              style={[styles.sortOption, sort === value && styles.sortActive]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  // Explain the empty state differently when the completed filter is active.
  const emptyContent = (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 25 }}>✦</Text>
      </View>
      <Text style={styles.emptyTitle}>A little room to breathe</Text>
      <Text style={styles.muted}>
        {filter === 'Completed'
          ? 'Completed tasks will appear here.'
          : 'Nothing on your list yet. Add your first task.'}
      </Text>
      <TouchableOpacity onPress={onShowForm}>
        <Text style={styles.emptyAction}>＋ Create a task</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandSmall}>
            To-Do <Text style={{ color: colors.purple }}>✦</Text>
          </Text>
          <Text style={styles.muted}>Make today count.</Text>
        </View>
        <TouchableOpacity onPress={onConfirmLogout} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.name || user.email).slice(0, 1).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
      {showForm ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formPage}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={onResetForm}>
              <Text style={styles.backLink}>‹ Back to tasks</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>
              {editingId ? 'Edit task' : 'Create task'}
            </Text>
            <Text style={styles.muted}>Give your next step a clear shape.</Text>
            <View style={styles.formCard}>
              <Field
                label="TASK TITLE *"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Finish project report"
              />
              <Field
                label="DESCRIPTION"
                value={description}
                onChangeText={setDescription}
                placeholder="Add a few details…"
                multiline
              />
              <Field
                label="START DATE & TIME (optional)"
                value={scheduledAt}
                onChangeText={setScheduledAt}
                placeholder="2026-10-21T17:30"
              />
              <Text style={styles.hint}>Use YYYY-MM-DDTHH:mm format.</Text>
              <Field
                label="DEADLINE (optional)"
                value={deadline}
                onChangeText={setDeadline}
                placeholder="2026-10-22T18:00"
              />
              <Text style={styles.label}>PRIORITY</Text>
              <View style={styles.pills}>
                {(['Low', 'Medium', 'High'] as Priority[]).map(value => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setPriority(value)}
                    style={[
                      styles.pill,
                      priority === value && styles.pillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        priority === value && styles.pillTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field
                label="CATEGORY"
                value={category}
                onChangeText={setCategory}
                placeholder="Personal, Study, Work…"
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onSaveTask}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryText}>
                    {editingId ? 'Save changes' : 'Add task'} →
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onResetForm}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={visibleTasks}
          keyExtractor={task => task._id}
          renderItem={({ item: task }) => (
            <TaskCard
              task={task}
              onToggle={() => onToggleTask(task)}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          )}
          contentContainerStyle={styles.dashboard}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyContent}
          ListFooterComponent={
            <Text style={styles.bottomNote}>SMALL STEPS ADD UP ✦</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
