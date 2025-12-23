import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdAdd, MdAssignment, MdFilterList, MdSearch } from "react-icons/md";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import CreateAssignmentModal from "../../components/teacher/assignments/CreateAssignmentModal";
import AssignmentCard from "../../components/teacher/assignments/AssignmentCard";
import AssignmentFilters from "../../components/teacher/assignments/AssignmentFilters";
import Pagination from "../../components/common/Pagination";
import { RootState } from "../../redux/store";

const AssignmentsPage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
    const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    course: "all",
    department: "all",
    status: "all",
    sortBy: "dueDate",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!teacherId || !accessToken) return;

      try {
        const res = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setTeacherSchedules(res.data.data || []);
      } catch {
        toast.error("Failed to load schedules");
      }
    };

    fetchSchedules();
  }, [teacherId, accessToken]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) return;

      try {
        setIsLoading(true);
        const res = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAssignments(res.data.data || []);
      } catch {
        toast.error("Failed to load assignments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId, accessToken]);

  /* ---------------- CRUD ---------------- */

  const handleCreateAssignment = async (formData: FormData) => {
    try {
      const res = await axios.post("/api/assignments", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setAssignments(prev => [res.data.data, ...prev]);
      setIsCreateModalOpen(false);
      toast.success("Assignment created successfully");
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const handleUpdateAssignment = async (id: string, data: any) => {
    try {
      const res = await axios.put(`/api/assignments/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAssignments(prev =>
        prev.map(a => (a._id === id ? res.data.data : a))
      );
      toast.success("Assignment updated");
    } catch {
      toast.error("Failed to update assignment");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment? All associated grades will be lost.")) return;

    try {
      await axios.delete(`/api/assignments/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast.success("Assignment deleted");
    } catch {
      toast.error("Failed to delete assignment");
    }
  };

  /* ---------------- FILTERS + PAGINATION ---------------- */

  const filteredAssignments = assignments.filter(a => {
    // Backend flattens courseId/departmentId to strings in some responses, or keeps objects in others.
    // We check both for robustness.
    const aCourseId = typeof a.courseId === 'object' ? a.courseId._id : a.courseId;
    const aDeptId = typeof a.departmentId === 'object' ? a.departmentId._id : a.departmentId;

    if (filters.course !== 'all' && aCourseId !== filters.course) return false;
    if (filters.department !== 'all' && aDeptId !== filters.department) return false;
    
    if (filters.status !== 'all') {
      const now = new Date();
      const dueDate = new Date(a.dueDate);
      const isExpired = dueDate < now;
      const isDueSoon = !isExpired && (dueDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000);

      if (filters.status === 'active' && isExpired) return false;
      if (filters.status === 'expired' && !isExpired) return false;
      if (filters.status === 'due-soon' && !isDueSoon) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (filters.sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
    if (filters.sortBy === 'submissions') return (b.submissions?.length || 0) - (a.submissions?.length || 0);
    return 0;
  });

  const totalItems = filteredAssignments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /* ---------------- UI ---------------- */

  // Helper for filter lists
  const uniqueCourses = Array.from(new Map(teacherSchedules.filter(s => s.courseId).map(s => [s.courseId._id || s.courseId, s.courseId.name || "Unknown Course"])).entries()).map(([id, name]) => ({ _id: id, name }));
  const uniqueDepts = Array.from(new Map(teacherSchedules.filter(s => s.departmentId).map(s => [s.departmentId._id || s.departmentId, s.departmentId.name || "Unknown Dept"])).entries()).map(([id, name]) => ({ _id: id, name }));

  return (
    <div className="container mx-auto px-4 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Assignment Management</h1>
          <p className="text-gray-500 font-medium mt-1">Design, deploy, and track student performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total</span>
            <span className="text-xl font-black text-blue-600 leading-none">{assignments.length}</span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-transform active:scale-95"
          >
            <MdAdd className="text-xl" />
            Create New
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-2">
         <AssignmentFilters
            filters={filters}
            setFilters={setFilters}
            courses={uniqueCourses}
            departments={uniqueDepts}
          />
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white h-64 rounded-[2.5rem] border border-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : currentAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 px-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            📝
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Assignments Found</h2>
          <p className="text-gray-500 max-w-sm font-medium">
            You haven't created any assignments for these criteria yet. Click "Create New" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {currentAssignments.map(a => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                onUpdate={handleUpdateAssignment}
                onDelete={handleDeleteAssignment}
                className="hover:-translate-y-2 transition-transform duration-300"
              />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateAssignmentModal
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAssignment}
          teacherSchedules={teacherSchedules}
          teacherId={teacherId}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
