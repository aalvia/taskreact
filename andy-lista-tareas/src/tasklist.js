import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient, useMutation, useQuery } from 'react-query';

function TaskList() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Redux state para manejar las tareas
  const tasks = useSelector(state => state.tasks);

  // Función para obtener la lista de tareas desde la API
  const { isLoading, isError, data: apiTasks, error } = useQuery('tasks', fetchTasks);

  // React Query mutation para marcar una tarea como completada
  const completeTaskMutation = useMutation(completeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks'); // Invalidar la cache de la lista de tareas
    },
  });

  // React Query mutation para eliminar una tarea
  const deleteTaskMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks'); // Invalidar la cache de la lista de tareas
    },
  });

  // Función para manejar la marcación de una tarea como completada
  function handleCompleteTask(taskId, completed) {
    completeTaskMutation.mutate({ taskId, completed });
  }

  // Función para manejar la eliminación de una tarea
  function handleDeleteTask(taskId) {
    deleteTaskMutation.mutate(taskId);
  }

  // Función para manejar la submisión del formulario de nueva tarea
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return; // No permitir tareas vacías
    try {
      // Enviamos la nueva tarea a la API
      const response = await fetch('http://127.0.0.1:8000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, completed: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      // Refrescamos los datos de la lista de tareas
      queryClient.invalidateQueries('tasks');
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {apiTasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleCompleteTask(task.id, !task.completed)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {/* Formulario para agregar una nueva tarea */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Agregar nueva tarea..."
        />
        <button type="submit">Agregar tarea</button>
      </form>
    </div>
  );
}

// Función para obtener la lista de tareas desde la API
async function fetchTasks() {
  const response = await fetch('http://127.0.0.1:8000/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

// Función para marcar una tarea como completada
async function completeTask({ taskId, completed }) {
  const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    throw new Error('Failed to complete task');
  }
}

// Función para eliminar una tarea
async function deleteTask(taskId) {
  const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

export default TaskList;
