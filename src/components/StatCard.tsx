/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label: string;
  };
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-lg border border-slate-200 p-3.5 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-300 relative overflow-hidden group min-h-[118px] sm:min-h-[132px]">
      {/* Decorative vertical bar mirroring banking UI */}
      <div className="absolute top-0 bottom-0 left-0 w-[4px] transition-all duration-300" style={{ backgroundColor: iconColor }} />

      <div className="flex-1 min-w-0 pl-2 pr-8 sm:pr-0">
        <p className="text-[9.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wide text-slate-500 leading-snug">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-banking-blue transition-colors font-display">
          {value}
        </h3>
        
        {trend && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
            <span className={`text-[9.5px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded leading-none ${
              trend.isPositive === undefined 
                ? 'bg-slate-100 text-slate-600'
                : trend.isPositive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {trend.value}
            </span>
            <span className="text-[9.5px] sm:text-[11px] text-slate-500 font-semibold leading-tight">
              {trend.label}
            </span>
          </div>
        )}
      </div>

      <div className={`absolute right-3 top-3 sm:static w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 shadow-sm ${iconBg}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
      </div>
    </div>
  );
}
