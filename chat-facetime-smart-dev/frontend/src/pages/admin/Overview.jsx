import React from 'react';
import StatCard from '../../components/admin/StatCard';

function Overview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng người dùng" value={0} accent="#8D538B" tint="#feebf6" icon="users" />
        <StatCard title="Người dùng thường" value={0} accent="#00b0eb" tint="#e5f9ff" icon="user" />
        <StatCard title="Quản trị viên" value={0} accent="#714270" tint="#f5ecf5" icon="admin" />
        <StatCard title="Hoạt động hôm nay" value={'1,234'} accent="#00b0eb" tint="#e5f9ff" icon="activity" />
      </div>

      <div className="bg-white rounded-2xl shadow border p-6" style={{borderColor:'rgba(141,83,139,0.25)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color:'#472A46'}}>Hoạt động gần đây</h3>
        <div className="text-gray-500">Chưa có dữ liệu</div>
      </div>
    </div>
  );
}

export default Overview;


