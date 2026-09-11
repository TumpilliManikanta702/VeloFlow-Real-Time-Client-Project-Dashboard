import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Calendar } from 'lucide-react';

interface TaskFilterBarProps {
  showProjectFilter?: boolean;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const currentFrom = searchParams.get('from') || '';
  const currentTo = searchParams.get('to') || '';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleReset = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  const hasFilters = Boolean(currentStatus || currentPriority || currentFrom || currentTo);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl mb-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pl-1">
        <Filter className="w-3.5 h-3.5 text-brand-400" />
        <span>Filters:</span>
      </div>

      <select
        value={currentStatus}
        onChange={(e) => updateParam('status', e.target.value)}
        className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={currentPriority}
        onChange={(e) => updateParam('priority', e.target.value)}
        className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-medium">Due:</span>
        <input
          type="date"
          value={currentFrom}
          onChange={(e) => updateParam('from', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none font-mono"
          title="Due Date From"
          placeholder="From"
        />
        <span className="text-slate-500 text-[11px]">to</span>
        <input
          type="date"
          value={currentTo}
          onChange={(e) => updateParam('to', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none font-mono"
          title="Due Date To"
          placeholder="To"
        />
      </div>

      {hasFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 ml-auto px-2 py-1 rounded hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  );
};
