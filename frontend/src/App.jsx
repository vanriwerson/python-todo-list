import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import './App.css';

const BASE_URL = "http://localhost:8000";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");

  // Função para buscar os todos
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      setTodos(response.data);
      console.log("Todos fetched:", response.data); // Log dos dados recebidos
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Carregar os todos ao montar o componente
  useEffect(() => {
    fetchTodos();
  }, []);

  // Função para adicionar um todo
  const addTodo = async () => {
    if (newTodo.trim() === "") {
      alert("Description cannot be empty");
      return;
    }
    const todo = { id: Date.now(), description: newTodo, completed: false };
    try {
      await axios.post(`${BASE_URL}/todos`, todo);
      setNewTodo("");
      console.log("Todo added:", todo); // Log do todo adicionado
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Função para atualizar um todo
  const updateTodo = async (id, updatedTodo) => {
    console.log("Updating todo:", id, updatedTodo); // Log dos dados a serem enviados
    try {
      await axios.put(`${BASE_URL}/todos/${id}`, updatedTodo);
      console.log("Fetch todos after update");
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Função para deletar um todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${id}`);
      console.log("Todo deleted:", id); // Log do todo removido
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Função para alternar a conclusão de uma tarefa
  const toggleCompletion = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
      const updatedTodo = { 
        id: todo.id, 
        description: todo.description, 
        completed: !todo.completed 
      };
      await updateTodo(id, updatedTodo);
    }
  };

  // Função para iniciar a edição de uma tarefa
  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditedDescription(todo.description);
  };

  // Função para salvar a edição de uma tarefa
  const saveEdit = useCallback(async (id) => {
    if (editedDescription.trim() === "") {
      alert("Description cannot be empty");
      return;
    }
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
      const updatedTodo = { 
        id: todo.id, 
        description: editedDescription, 
        completed: todo.completed 
      };
      await updateTodo(todo.id, updatedTodo);
      setEditingTodoId(null); // Fechar o campo de edição após a atualização
      setEditedDescription("");
    }
  }, [editedDescription, todos]);

  // Função para lidar com o clique fora do campo de edição
  const handleClickOutside = (event) => {
    if (event.target.tagName !== 'INPUT' && editingTodoId !== null) {
      saveEdit(editingTodoId);
    }
  };

  // Função para salvar a edição ao pressionar Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && editingTodoId !== null) {
      saveEdit(editingTodoId);
    }
  };

  // Adiciona um todo ao pressionar Enter no campo de input
  const handleNewTodoKeyPress = (event) => {
    if (event.key === 'Enter') {
      addTodo();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [editingTodoId, handleClickOutside, handleKeyPress]);

  return (
    <div className="container">
      <h1>Todo List</h1>
      <div className="input-container">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleNewTodoKeyPress}
          placeholder="Enter a new task"
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.completed ? "completed" : ""}
          >
            {editingTodoId === todo.id ? (
              <div className="edit-container">
                <input 
                  type="text"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </div>
            ) : (
              <span 
                onClick={() => toggleCompletion(todo.id)}
                onDoubleClick={() => startEditing(todo)}
              >
                {todo.description}
              </span>
            )}
            <button onClick={() => deleteTodo(todo.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
