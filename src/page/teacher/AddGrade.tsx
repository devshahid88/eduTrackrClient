import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import AssignmentSelector from "../../components/teacher/Grades/AssignmentSelector";
import GradeEntryTable from "../../components/teacher/Grades/GradeEntryTable";
import { RootState } from "../../redux/store";

const AddGrade: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);

  const teacherId = authState?.user?.id;
  const accessToken = authState?.accessToken;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({});
  const [feedbacks, setFeedbacks] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  /* ---------------- FETCH ASSIGNMENTS ---------------- */

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) return;

      try {
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

  /* ---------------- HANDLERS ---------------- */

  const handleAssignmentSelect = (assignmentId: string) => {
    if (!assignmentId) {
      setSelectedAssignment(null);
      setStudents([]);
      setGrades({});
      setFeedbacks({});
      return;
    }

    setIsLoadingStudents(true);
    const assignment = assignments.find(a => a._id === assignmentId);
    setSelectedAssignment(assignment);

    const subs =
      assignment?.submissions?.map((s: any) => ({
        _id: s.studentId,
        studentName: s.studentName || "Unknown",
        submission: s.submissionContent,
        studentsubmittedAt: s.submittedAt, // Added for GradeEntryTable
      })) || [];

    setStudents(subs);

    const initialGrades: any = {};
    const initialFeedbacks: any = {};
    subs.forEach((s: any) => {
      const sub = assignment.submissions.find((x: any) => x.studentId === s._id);
      initialGrades[s._id] = sub?.grade?.toString() || "";
      initialFeedbacks[s._id] = sub?.feedback || "";
    });

    setGrades(initialGrades);
    setFeedbacks(initialFeedbacks);
    setIsLoadingStudents(false);
  };

  const handleGradeChange = (studentId: string, grade: string) => {
    const val = grade === "" ? "" : Math.min(100, Math.max(0, +grade || 0));
    setGrades((p: any) => ({ ...p, [studentId]: val }));
  };

  const handleFeedbackChange = (studentId: string, feedback: string) => {
    setFeedbacks((p: any) => ({ ...p, [studentId]: feedback }));
  };

  const handleSubmitGrades = async () => {
    if (!selectedAssignment) return toast.error("Select an assignment");

    const gradesToSubmit = Object.entries(grades)
      .filter(([_, g]) => g !== "")
      .map(([studentId, g]) => ({ 
        studentId, 
        grade: Number(g),
        feedback: feedbacks[studentId] || ""
      }));

    if (!gradesToSubmit.length) {
      toast.error("Enter at least one grade");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        `/api/assignments/${selectedAssignment._id}/grade`,
        { grades: gradesToSubmit },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Grades submitted");
    } catch {
      toast.error("Failed to submit grades");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Add Grades</h1>
      <p className="text-gray-600 mb-8">
        Select an assignment and enter grades for submitted students.
      </p>

      <div className="bg-white rounded-xl shadow border p-6 mb-8">
        {isLoading ? (
          <div className="text-center py-6">Loading assignments…</div>
        ) : (
          <AssignmentSelector
            assignments={assignments}
            selectedAssignment={selectedAssignment}
            onSelect={handleAssignmentSelect}
            isLoading={isLoading}
          />
        )}
      </div>

      {selectedAssignment && (
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {selectedAssignment.title}
          </h2>

          {isLoadingStudents ? (
            <div className="text-center py-6">Loading students…</div>
          ) : students.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No submissions yet
            </div>
          ) : (
            <>
              <GradeEntryTable
                students={students}
                grades={grades}
                onGradeChange={handleGradeChange}
                feedbacks={feedbacks}
                onFeedbackChange={handleFeedbackChange}
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmitGrades}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting…" : "Submit Grades"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddGrade;
