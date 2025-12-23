
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ConcernTable from '../../components/admin/concerns/ConcernTable';
import AddConcernModal from '../../components/admin/concerns/AddConcernModal';
import EditConcernModal from '../../components/admin/concerns/EditConcernModal';
import ViewConcernModal from '../../components/admin/concerns/ViewConcernModal';
import Pagination from '../../components/admin/users/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { MdSupportAgent, MdPersonSearch, MdHistory, MdFilterList } from 'react-icons/md';

import { User } from '../../types/common';
import { Concern, ConcernStatus } from '../../types/features/concern-management';

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | null;

const AdminConcernPage: React.FC = () => {
  const authState = useSelector((state: { auth: AuthState }) => state.auth);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [concernsPerPage, setConcernsPerPage] = useState<number>(10);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConcerns = async () => {
      const accessToken = authState?.accessToken;
      if (!accessToken) {
        toast.error('Identity verification required.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse<Concern[]>>('/api/concerns', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          console.log('Concerns telemetry received:', response.data.data);
          setConcerns(response.data.data);
          setError(null);
        } else {
          setError('Data retrieval protocol failed.');
        }
      } catch (error: any) {
        setError(`Uplink failure: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerns();
  }, [authState]);

  const handleEdit = (concern: Concern) => {
    setSelectedConcern(concern);
    setModalType('edit');
  };

  const handleView = (concern: Concern) => {
    setSelectedConcern(concern);
    setModalType('view');
  };

  const handleCloseModal = () => {
    setSelectedConcern(null);
    setModalType(null);
  };

  const handleSaveConcern = async (concernData: Partial<Concern>) => {
    const accessToken = authState?.accessToken;
    try {
      const concernId = concernData._id || concernData.id;
      if (concernId) {
        // Merge with existing full object if available to satisfy PUT requirements
        const existingConcern = concerns.find(c => (c._id === concernId || c.id === concernId));
        const payload = existingConcern ? { ...existingConcern, ...concernData } : concernData;

        const response = await axios.put<ApiResponse<Concern>>(
          `/api/concerns/${concernId}`,
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (response.data.success) {
          setConcerns(concerns.map((c) => (c._id === concernId || c.id === concernId) ? response.data.data : c));
          toast.success('Protocol updated successfully.');
        }
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Update Request Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Protocol synchronization failure.';
      toast.error(`Update Failed: ${errorMessage}`);
    }
  };

  const filteredConcerns = concerns.filter(
    (concern) => {
      const sTitle = (concern.title || '').toLowerCase();
      const sType = (concern.type || '').toLowerCase();
      const sStatus = (concern.status || '').toLowerCase();
      const sCreatedBy = (concern.createdBy?.username || '').toLowerCase();
      const sSearch = searchTerm.toLowerCase();

      return sTitle.includes(sSearch) || 
             sType.includes(sSearch) || 
             sStatus.includes(sSearch) || 
             sCreatedBy.includes(sSearch);
    }
  );

  const indexOfLastConcern = currentPage * concernsPerPage;
  const indexOfFirstConcern = indexOfLastConcern - concernsPerPage;
  const currentConcerns = filteredConcerns.slice(indexOfFirstConcern, indexOfLastConcern);
  const totalPages = Math.ceil(filteredConcerns.length / concernsPerPage);

  const stats = {
    total: concerns.length,
    pending: concerns.filter(c => (c.status || '').toLowerCase() === 'pending').length,
    resolved: concerns.filter(c => ['solved', 'resolved'].includes((c.status || '').toLowerCase())).length,
    inProgress: concerns.filter(c => (c.status || '').toLowerCase() === 'in_progress').length,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Branded Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-2xl text-rose-400 shadow-2xl shadow-rose-500/20">
                 <MdSupportAgent className="w-6 h-6" />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Support Intelligence</span>
                 <div className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black border border-rose-100">Live Hub</div>
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Concern Management</h1>
              <p className="text-gray-400 font-bold mt-2">Monitor system health, academic grievances, and administrative protocols.</p>
           </div>
        </div>

        {/* Support Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Logs', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
             { label: 'Unresolved', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
             { label: 'In Pipeline', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Finalized', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           ].map((stat, i) => (
             <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[120px] transition-transform hover:scale-105 duration-300`}>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
             </div>
           ))}
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:max-w-md group">
           <MdPersonSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-rose-500 transition-colors" />
           <input
             type="text"
             placeholder="Search by identity, status, or title..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-6 py-4 bg-white border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner"
           />
        </div>

        <div className="flex items-center gap-4">
           {error && (
             <div className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-xl border border-rose-100 animate-pulse">
                Uplink Error: {error}
             </div>
           )}
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Density:</span>
              <select
                value={concernsPerPage}
                onChange={(e) => setConcernsPerPage(Number(e.target.value))}
                className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-black focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-2">
        {isLoading ? (
          <div className="bg-white rounded-[2.5rem] p-32 flex flex-col items-center justify-center gap-6 shadow-sm border border-gray-100">
             <div className="animate-spin h-16 w-16 border-[5px] border-rose-600/10 border-t-rose-600 rounded-full" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing Intelligence Pipeline...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <ConcernTable
              concerns={currentConcerns}
              onEdit={handleEdit}
              onView={handleView}
            />
            
            {filteredConcerns.length > 0 && (
              <div className="flex justify-center pb-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredConcerns.length}
                  itemsPerPage={concernsPerPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {modalType === 'edit' && selectedConcern && (
        <EditConcernModal concern={selectedConcern} onClose={handleCloseModal} onSave={handleSaveConcern} />
      )}
      {modalType === 'view' && selectedConcern && (
        <ViewConcernModal concern={selectedConcern} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminConcernPage;
