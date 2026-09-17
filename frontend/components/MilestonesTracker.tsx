import React from 'react';
import { Milestone } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Layers, 
  Award, 
  ExternalLink 
} from 'lucide-react';

interface MilestonesTrackerProps {
  milestones: Milestone[];
  onToggleTask: (milestoneId: number, taskId: string) => void;
}

export const MilestonesTracker: React.FC<MilestonesTrackerProps> = ({
  milestones,
  onToggleTask,
}) => {
  const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = milestones.reduce(
    (acc, m) => acc + m.tasks.filter(t => t.completed).length,
    0
  );
  const percentComplete = Math.round((completedTasks / (totalTasks || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              120-Uur Execution Backlog
            </span>
            <span className="text-xs text-slate-400">Van Fundering tot Autonome Launch</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Autonoom Implementatie-Protocol</h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Het exacte stappenplan dat in de LangGraph / CrewAI scheduler is geladen. 
            Elke subtaak is toegekend aan een gespecialiseerde swarm agent.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs text-slate-400">Totale Voortgang</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {completedTasks} / {totalTasks} taken
            </div>
          </div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#1e293b"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#6366f1"
                strokeWidth="5"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * percentComplete) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((m) => {
          const mTotal = m.tasks.length;
          const mDone = m.tasks.filter(t => t.completed).length;
          const isComplete = mDone === mTotal;

          return (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all ${
                isComplete
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    M{m.id}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <p className="text-xs text-slate-400">{m.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {m.hours}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-1 rounded font-semibold ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {mDone}/{mTotal}
                  </span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {m.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(m.id, task.id)}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/20">
                          {task.agent}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
                      </div>
                      <p
                        className={`text-xs mt-1 leading-snug ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
