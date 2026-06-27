/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  ShieldAlert, 
  Trash2, 
  Power, 
  ArrowRight,
  Search,
  ExternalLink,
  ChevronDown,
  Lock,
  Compass
} from 'lucide-react';
import { School, SubscriptionPackage } from '../types';

interface SchoolsTableProps {
  schools: School[];
  onToggleStatus: (schoolId: string) => void;
  onEnterWorkspace: (schoolId: string) => void;
}

export default function SchoolsTable({ 
  schools, 
  onToggleStatus, 
  onEnterWorkspace 
}: SchoolsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [packageFilter, setPackageFilter] = useState<string>('ALL');

  // Filter school registries
  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPackage = packageFilter === 'ALL' || school.subscriptionPackage === packageFilter;
    
    return matchesSearch && matchesPackage;
  });

  // Package color picker
  const getPackageBadgeStyles = (pkg: SubscriptionPackage) => {
    switch (pkg) {
      case 'Basic':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Standard':
        return 'bg-blue-50 text-[#1A56DB] border-blue-200';
      case 'Premium':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Enterprise':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded border border-banking-border select-none font-sans overflow-hidden">
      
      {/* Table search controls */}
      <div className="p-4 bg-slate-50 border-b border-banking-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="table-school-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search school name, code, or location..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Selection dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Show:</span>
          <select
            id="table-package-filter"
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none text-slate-700 font-semibold cursor-pointer"
          >
            <option value="ALL">All Schools</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Corporate Ledger Grid */}
      <div className="overflow-x-auto w-full">
        {filteredSchools.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-slate-700">No School Registries Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Your search filters of "{searchTerm}" did not yield any live database matching values.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-banking-border text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4 font-semibold">School</th>
                <th className="py-3 px-4 font-semibold">Code</th>
                <th className="py-3 px-4 font-semibold">Plan</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSchools.map((school) => {
                const isSuspended = school.status === 'Suspended';
                return (
                  <tr 
                    id={`table-row-${school.id}`}
                    key={school.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isSuspended ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Institution Name & Avatar logo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded border flex items-center justify-center font-display font-bold text-xs select-none shadow-inner shrink-0 ${
                          isSuspended 
                            ? 'bg-rose-100 text-rose-800 border-rose-200' 
                            : 'bg-indigo-50 text-[#1A56DB] border-indigo-100'
                        }`}>
                          {school.logo}
                        </div>
                        <div>
                          <div className="font-bold text-slate-930 leading-snug">{school.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{school.adminEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* School Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono bg-[#F1F5F9] border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">
                        {school.code}
                      </span>
                    </td>

                    {/* Subscription Package Badge */}
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getPackageBadgeStyles(school.subscriptionPackage)}`}>
                        {school.subscriptionPackage}
                      </span>
                    </td>

                    {/* Location Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-500 max-w-xs truncate" title={school.location}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{school.location}</span>
                      </div>
                    </td>

                    {/* Dynamic Database Status indicators */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-2.5 w-2.5 relative`}>
                          {!isSuspended && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                          }`} />
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${
                          isSuspended ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {isSuspended ? 'Needs Payment' : 'Active'}
                        </span>
                      </div>
                    </td>

                    {/* Action Panel Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Suspend Freeze Action */}
                        <button
                          id={`school-action-toggle-${school.id}`}
                          onClick={() => {
                            const actionText = isSuspended ? 'activate this school again' : 'pause this school account';
                            if (window.confirm(`Are you sure you want to ${actionText}?`)) {
                              onToggleStatus(school.id);
                            }
                          }}
                          className={`p-1.5 rounded border transition-all cursor-pointer ${
                            isSuspended 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          }`}
                          title={isSuspended ? 'Activate school' : 'Pause school'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Tunnel directly to Tenant Dashboard */}
                        <button
                          id={`school-action-tunnel-${school.id}`}
                          onClick={() => onEnterWorkspace(school.id)}
                          disabled={isSuspended}
                          className={`px-2 py-1.5 rounded border font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                            isSuspended 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'bg-indigo-50 hover:bg-indigo-100 text-[#1A56DB] border-indigo-200'
                          }`}
                          title={isSuspended ? 'This school needs attention first' : 'Open this school dashboard'}
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Catalog Ledger Footer summaries */}
      <div className="p-3 bg-slate-50 border-t border-banking-border text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>ACTIVE SCHOOLS: {filteredSchools.filter(s => s.status === 'Active').length}</span>
        <span>School records protected</span>
      </div>

    </div>
  );
}
