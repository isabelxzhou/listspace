import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

function SortableTask({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-4 rounded-lg transition-all duration-200 ${
        isDragging ? 'rotate-2 scale-105' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-white/50 text-xs cursor-grab hover:text-white/70 transition-colors duration-200" {...attributes} {...listeners}>
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
            <div className="w-0.5 h-0.5 bg-current rounded-sm"></div>
          </div>
        </div>
        <button
          onClick={() => onToggle(task.id)}
          className="w-4 h-4 border border-white/30 hover:border-white/50 transition-colors duration-200 flex items-center justify-center group bg-transparent"
        >
          <div className="w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </button>
        <span className="text-white flex-1 text-sm font-normal">{task.text}</span>
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'hi', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');

  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Static Stars Background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xs">

          {/* Add Task Form */}
          <form onSubmit={addTask} className="mb-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder=""
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-transparent text-sm"
                />
                <button
                  type="submit"
                  className="w-6 h-6 flex items-center justify-center text-white/80 text-lg font-light hover:bg-white/5 hover:text-white rounded transition-colors duration-200 bg-transparent"
                >
                  +
                </button>
              </div>
            </div>
          </form>

          {/* Tasks List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTask key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

        </div>
      </div>
    </div>
  );
}

export default App;

