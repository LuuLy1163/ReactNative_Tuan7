import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';

const Stack = createStackNavigator();

const WelcomeScreen = ({ navigation }) => {
  const [name, setName] = React.useState('');
  return <View style={{...styles.container, paddingTop: 100}}>
    <Text style={styles.title}>MANAGE YOUR{'\n'}TASK</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter your name"
      placeholderTextColor="#999"
      value={name}
      onChangeText={setName}
    />
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('TaskList', { name: name.trim() })}
    >
      <Text style={styles.buttonText}>GET STARTED →</Text>
    </TouchableOpacity>
  </View>
}

const TaskListScreen = ({ navigation, route }) => {
  const [tasks, setTasks] = useState([]);
  const { name } = route.params;
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const fetchTasks = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://67000a364da5bd237552feeb.mockapi.io/todo?name=${query}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

const debouncedSearch = React.useCallback(
    debounce((query) => {
      fetchTasks(query);
    }, 300),
    []
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  React.useEffect(() => {
    fetchTasks()
  }, [])
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" onPress={() =>  navigation.goBack()} size={24} color="black" />
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hi {name}</Text>
            <Text style={styles.subGreeting}>Have agreat day a head</Text>
          </View>
        </View>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#8A2BE2" style={styles.loader} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Ionicons name="checkbox-outline" size={24} color="#8A2BE2" />
              <Text style={styles.taskTitle}>{item.name}</Text>
              <Ionicons name="pencil" size={24} color="#FF69B4" />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyList}>No tasks found</Text>
          }
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask', {name: name})}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddTaskScreen = ({ navigation, route }) => {
  const [taskName, setTaskName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { name } = route.params;

  const onAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    setIsLoading(true);
    const payload = {
      name: taskName,
      completed: false,
    };

    try {
      const response = await fetch('https://67000a364da5bd237552feeb.mockapi.io/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      await response.json();
      navigation.goBack();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.greeting}>Hi {name}</Text>
      <Text style={styles.subGreeting}>Have agreat day a head</Text>
      <Ionicons name="close" size={24} color="black" onPress={() =>  navigation.goBack()} style={styles.closeIcon} />
    </View>
    <Text style={styles.addJobTitle}>ADD YOUR JOB</Text>
    <TextInput
      style={styles.jobInput}
      placeholder="input your job"
      placeholderTextColor="#999"
      value={taskName}
      onChangeText={setTaskName}
    />
    <TouchableOpacity
      style={styles.finishButton}
      onPress={onAddTask}
      disabled={isLoading}
    >
      {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.finishButtonText}>FINISH →</Text>
        )}
    </TouchableOpacity>
  </View>
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8A2BE2',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 18,
    borderRadius: 6,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00CED1',
    padding: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#00CED1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
  },
  addJobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  jobInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  finishButton: {
    backgroundColor: '#00CED1',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  noteImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});