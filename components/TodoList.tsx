
import React, { useState } from 'react';
import { Todo } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon } from './Icons';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string, category: Todo['category']) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const CATEGORIES: { id: Todo['category']; label: string; color: string }[] = [
  { id: 'personal', label: 'Personal', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'urgent', label: 'Urgent', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'shopping', label: 'Shopping', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
];

const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Todo['category']>('personal');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(newTodoText, selectedCategory);
      setNewTodoText('');
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </span>
                Tasks & Goals
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your daily priorities.</p>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAdd} className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
            <input 
                type="text" 
                value={newTodoText} 
                onChange={(e) => setNewTodoText(e.target.value)} 
                placeholder="What needs to be done?"
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${selectedCategory === cat.id ? `${cat.color} border-current ring-2 ring-offset-1 dark:ring-offset-gray-800 ring-gray-200` : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <button 
                    type="submit" 
                    disabled={!newTodoText.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" /> Add Task
                </button>
            </div>
        </div>
      </form>

      {/* Todo List */}
      <div className="space-y-6">
          {CATEGORIES.map(cat => {
              const categoryTodos = todos.filter(t => t.category === cat.id);
              if (categoryTodos.length === 0) return null;

              return (
                  <div key={cat.id} className="animate-fade-in">
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">{cat.label}</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                          {categoryTodos.map(todo => (
                              <div key={todo.id} className="group flex items-center p-4 border-b last:border-none border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                  <button 
                                    onClick={() => onToggleTodo(todo.id)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}
                                  >
                                      {todo.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                  </button>
                                  <span className={`flex-grow text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                                      {todo.text}
                                  </span>
                                  <button 
                                    onClick={() => onDeleteTodo(todo.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                      <TrashIcon className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )
          })}
          
          {todos.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                  <p>No tasks yet. Enjoy your day!</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default TodoList;
