from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Permitir o frontend local
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos os cabeçalhos
)

# Modelo para a ToDo
class TodoItem(BaseModel):
    id: int
    description: str
    completed: bool

# Banco de dados temporário
todo_list = []

# Função para imprimir o estado da lista
def log_todo_list():
    print("Current Todo List:")
    for todo in todo_list:
        print(f"ID: {todo.id}, Description: {todo.description}, Completed: {todo.completed}")

# Rota para obter todas as tasks
@app.get("/todos")
def get_todos():
    log_todo_list()  # Adicionar log ao obter todos os todos
    return todo_list

# Rota para adicionar uma task
@app.post("/todos")
def add_todo(todo: TodoItem):
    todo_list.append(todo)
    log_todo_list()  # Adicionar log ao adicionar um todo
    return todo

# Rota para editar uma task
@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, updated_todo: TodoItem):
    # Validação dos dados recebidos
    if updated_todo.id != todo_id:
        raise HTTPException(status_code=400, detail="ID mismatch")

    for idx, existing_todo in enumerate(todo_list):
        if existing_todo.id == todo_id:
            todo_list[idx] = updated_todo
            log_todo_list()  # Adicionar log ao atualizar um todo
            return updated_todo

    raise HTTPException(status_code=404, detail="Todo not found")

# Rota para remover uma task
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    global todo_list
    todo_list = [todo for todo in todo_list if todo.id != todo_id]
    log_todo_list()  # Adicionar log ao remover um todo
    return {"message": "Todo deleted"}
