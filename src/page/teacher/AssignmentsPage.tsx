import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import CreateAssignmentModal from "../../components/teacher/assignments/CreateAssignmentModal";
import AssignmentCard from "../../components/teacher/assignments/AssignmentCard";
import AssignmentFilters from "../../components/teacher/assignments/AssignmentFilters";
import Pagination from "../../components/common/Pagination";
import { RootState } from "../../redux/store";

/* ---- types unchanged ---- */

const AssignmentsPage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const teacherId = authState?.user?.id;
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      toast.success("Assignment created");
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
    if (!confirm("Delete this assignment?")) return;

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

  const filteredAssignments = assignments; // keep your existing logic here

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assignment Management
          </h1>
          <p className="text-gray-600">
            Create and manage assignments for your courses
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create Assignment
        </button>
      </div>

      {teacherSchedules.length > 0 && (
        <AssignmentFilters
          filters={filters}
          setFilters={setFilters}
          courses={[]}
          departments={[]}
          courseNameMap={new Map()}
          departmentNameMap={new Map()}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : currentAssignments.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center">
          <p className="text-gray-600">No assignments found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentAssignments.map(a => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                onUpdate={handleUpdateAssignment}
                onDelete={handleDeleteAssignment}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
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
