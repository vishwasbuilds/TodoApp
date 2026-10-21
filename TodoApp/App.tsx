// Owns app state and coordinates authentication and task API requests.
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './src/services/api';
import AuthScreen from './src/screens/AuthScreen';
import TasksScreen from './src/screens/TasksScreen';
import { colors, styles } from './src/theme';
import type { Priority, Task, User } from './src/types';

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [sort, setSort] = useState<'Deadline' | 'Priority' | 'Newest'>(
    'Deadline',
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Personal');
  const [busy, setBusy] = useState(false);

  // Restore a saved session on launch, then fetch that user's tasks.
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('todo_token');
        const savedUser = await AsyncStorage.getItem('todo_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
          const response = await api.get('/tasks', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          setTasks(response.data.tasks);
        }
      } catch {
        /* A fresh install simply opens the login screen. */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Refreshes the task list after any server-side change.
  async function loadTasks(currentToken = token) {
    const response = await api.get('/tasks', {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    setTasks(response.data.tasks);
  }

  // Creates an account or logs in, persists the session, and loads its tasks.
  async function submitAuth() {
    if (
      !authEmail.trim() ||
      !authPassword.trim() ||
      (authMode === 'register' && !authName.trim())
    ) {
      Alert.alert('Missing details', 'Please complete all required fields.');
      return;
    }

    setAuthBusy(true);
    try {
      const endpoint =
        authMode === 'register' ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, {
        name: authName.trim(),
        email: authEmail.trim().toLowerCase(),
        password: authPassword,
      });

      const { token: newToken, user: newUser } = response.data;
      if (!newToken || !newUser) {
        throw new Error(
          'The server response did not include a token and user.',
        );
      }

      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      await Promise.all([
        AsyncStorage.setItem('todo_token', newToken),
        AsyncStorage.setItem('todo_user', JSON.stringify(newUser)),
      ]);
      setToken(newToken);
      setUser(newUser);
      setAuthPassword('');

      // Authentication has succeeded. Loading tasks is a separate request,
      // so a task-loading failure should not be reported as a login failure.
      try {
        const tasksResponse = await api.get('/tasks', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        setTasks(
          Array.isArray(tasksResponse.data?.tasks)
            ? tasksResponse.data.tasks
            : [],
        );
      } catch (taskError: any) {
        console.log(
          'Task loading failed:',
          taskError?.response?.status,
          taskError?.response?.data || taskError?.message,
        );
        setTasks([]);
        Alert.alert(
          'Signed in successfully',
          'Your account is ready, but tasks could not be loaded. Check the task API route and backend logs.',
        );
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message;
      const message = serverMessage || e?.message || 'Unknown error';
      console.log(
        'Authentication request failed:',
        status,
        e?.response?.data || message,
      );
      Alert.alert(
        'Unable to continue',
        status
          ? `Request failed (${status}): ${message}`
          : `Could not complete the authentication request: ${message}`,
      );
    } finally {
      setAuthBusy(false);
    }
  }

  // Clears persisted credentials and returns the app to the signed-out state.
  async function logout() {
    await Promise.all([
      AsyncStorage.removeItem('todo_token'),
      AsyncStorage.removeItem('todo_user'),
    ]);
    delete api.defaults.headers.common.Authorization;
    setToken('');
    setUser(null);
    setTasks([]);
    setShowForm(false);
  }

  // Requests confirmation before removing the current session.
  function confirmLogout() {
    Alert.alert('Log out?', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  // Resets task form values and exits the create/edit form.
  function resetForm() {
    setTitle('');
    setDescription('');
    setScheduledAt('');
    setDeadline('');
    setPriority('Medium');
    setCategory('Personal');
    setEditingId(null);
    setShowForm(false);
  }

  // Copies the selected task into the form so it can be edited.
  function startEdit(task: Task) {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setScheduledAt(task.scheduledAt ? task.scheduledAt.slice(0, 16) : '');
    setDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
    setPriority(task.priority);
    setCategory(task.category || 'Personal');
    setShowForm(true);
  }

  // Validates and sends the form as either a create or update request.
  async function saveTask() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Enter a task title.');
      return;
    }
    setBusy(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      category: category.trim() || 'Personal',
    };
    try {
      if (editingId) await api.put(`/tasks/${editingId}`, payload);
      else await api.post('/tasks', payload);
      await loadTasks();
      resetForm();
    } catch (e: any) {
      Alert.alert(
        'Could not save task',
        e?.response?.data?.message ||
          'Check the API connection and date/time values.',
      );
    } finally {
      setBusy(false);
    }
  }

  // Updates completion on the server, then reloads the list.
  async function toggleTask(task: Task) {
    try {
      await api.patch(`/tasks/${task._id}/complete`, {
        completed: !task.completed,
      });
      await loadTasks();
    } catch {
      Alert.alert('Error', 'Could not update task status.');
    }
  }

  // Confirms deletion before removing a task from the server.
  function deleteTask(task: Task) {
    Alert.alert('Delete task?', `Delete “${task.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${task._id}`);
            await loadTasks();
          } catch {
            Alert.alert('Error', 'Could not delete task.');
          }
        },
      },
    ]);
  }

  // Derives the displayed list from the current filter and sort selection.
  const visibleTasks = useMemo(() => {
    const result = tasks.filter(
      t =>
        filter === 'All' ||
        (filter === 'Completed' ? t.completed : !t.completed),
    );
    const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
    return [...result].sort((a, b) => {
      if (sort === 'Priority') return rank[a.priority] - rank[b.priority];
      if (sort === 'Newest') return b._id.localeCompare(a._id);
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks, filter, sort]);

  const completedCount = tasks.filter(task => task.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={styles.muted}>Loading To-Do…</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authBusy={authBusy}
        onSubmit={submitAuth}
      />
    );
  }

  return (
    <TasksScreen
      user={user}
      tasks={tasks}
      visibleTasks={visibleTasks}
      completedCount={completedCount}
      progress={progress}
      filter={filter}
      setFilter={setFilter}
      sort={sort}
      setSort={setSort}
      showForm={showForm}
      editingId={editingId}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      scheduledAt={scheduledAt}
      setScheduledAt={setScheduledAt}
      deadline={deadline}
      setDeadline={setDeadline}
      priority={priority}
      setPriority={setPriority}
      category={category}
      setCategory={setCategory}
      busy={busy}
      onConfirmLogout={confirmLogout}
      onResetForm={resetForm}
      onShowForm={() => {
        resetForm();
        setShowForm(true);
      }}
      onSaveTask={saveTask}
      onToggleTask={toggleTask}
      onEditTask={startEdit}
      onDeleteTask={deleteTask}
    />
  );
}
