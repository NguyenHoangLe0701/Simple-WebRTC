import React from 'react';
import { Users, Shield, User, Activity } from 'lucide-react';

const iconMap = { users: Users, admin: Shield, user: User, activity: Activity };

function StatCard({ title, value, accent = '#8D538B', tint = '#feebf6', icon = 'users' }) {
  const Icon = iconMap[icon] || Users;
  return (
    <div
      className="rounded-2xl border shadow-sm p-5 relative overflow-hidden"
      style={{ borderColor: `${accent}40`, background: `linear-gradient(180deg, ${tint}, #ffffff)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: accent }}>{title}</p>
          <p className="text-4xl font-extrabold" style={{ color: '#472A46' }}>{value}</p>
        </div>
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;


