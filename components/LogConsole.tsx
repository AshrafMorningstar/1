import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

const LogConsole: React.FC<Props> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-slate-800 font-mono text-xs overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 font-semibold">System Output</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
            <div className="text-slate-600 italic">Waiting for simulation to start...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-fade-in">
            <span className="text-slate-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className="mt-0.5 shrink-0">{getIcon(log.level)}</span>
            <div className="break-all">
                <span className={`
                    ${log.level === 'error' ? 'text-red-300' : ''}
                    ${log.level === 'success' ? 'text-green-300' : ''}
                    ${log.level === 'warning' ? 'text-yellow-300' : ''}
                    ${log.level === 'info' ? 'text-slate-300' : ''}
                `}>
                {log.message}
                </span>
                {log.details && (
                    <div className="text-slate-500 mt-1 pl-2 border-l border-slate-700">
                        {log.details}
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogConsole;