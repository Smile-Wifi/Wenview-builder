import React, { useState } from 'react';
import type { AppConfig } from '../types.ts';
import { AVAILABLE_PERMISSIONS } from '../utils/validation.ts';
import { ShieldCheck, Search, Info } from 'lucide-react';

interface Step4Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step4Permissions: React.FC<Step4Props> = ({ config, onChange }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const togglePermission = (id: string) => {
    const current = new Set(config.permissions);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onChange({ permissions: Array.from(current) });
  };

  const selectRecommended = () => {
    const recommended = AVAILABLE_PERMISSIONS.filter((p) => p.recommended).map((p) => p.id);
    onChange({ permissions: recommended });
  };

  const selectAll = () => {
    onChange({ permissions: AVAILABLE_PERMISSIONS.map((p) => p.id) });
  };

  const clearAll = () => {
    onChange({ permissions: ['android.permission.INTERNET'] });
  };

  const filtered = AVAILABLE_PERMISSIONS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">04. Android Permissions</h2>
          <p className="text-sm text-slate-400 mt-1">
            Map directly to <code className="text-slate-300">&lt;uses-permission&gt;</code> entries in AndroidManifest.xml.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const current = new Set(config.permissions);
              current.add('android.permission.INTERNET');
              current.add('android.permission.ACCESS_NETWORK_STATE');
              onChange({ permissions: Array.from(current) });
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              config.permissions.includes('android.permission.INTERNET')
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{config.permissions.includes('android.permission.INTERNET') ? '✓ Internet Permission Added' : '+ Add Internet Permission'}</span>
          </button>
          <button
            type="button"
            onClick={selectRecommended}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            Recommended Only
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions by name or identifier..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['all', 'core', 'hardware', 'location', 'storage'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs capitalize rounded-md transition-colors ${
                selectedCategory === cat ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((perm) => {
          const isChecked = config.permissions.includes(perm.id);
          return (
            <div
              key={perm.id}
              onClick={() => togglePermission(perm.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isChecked
                  ? 'border-blue-500/80 bg-blue-500/10'
                  : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by parent onClick
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{perm.name}</span>
                    {perm.id === 'android.permission.INTERNET' && (
                      <span className="text-[11px] text-blue-400 font-mono bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                        Required Core
                      </span>
                    )}
                    {perm.recommended && perm.id !== 'android.permission.INTERNET' && (
                      <span className="text-[11px] text-emerald-400 font-mono">Recommended</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{perm.id}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{perm.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          Selected {config.permissions.length} permissions. On modern Android (6.0+), dangerous permissions like CAMERA and LOCATION will prompt the user at runtime via the WebView.
        </span>
      </div>
    </div>
  );
};
