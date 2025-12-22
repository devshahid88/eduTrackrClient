import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

/* ---- interfaces unchanged ---- */

const AssignmentDetailsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const authState = useSelector((state: any) => state.auth);

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!teacherId || !accessToken || !assignmentId) {
        toast.error("Authentication error");
        return;
      }

      try {
        setIsLoading(true);
        const res = await axios.get(`/api/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = res.data.data;
        setAssignment(data);

        const initialGrades: any = {};
        data.submissions?.forEach((s: any) => {
          initialGrades[s.studentId || s._id] = s.grade?.toString() || "";
        });
        setGrades(initialGrades);
      } catch {
        toast.error("Failed to load assignment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, teacherId, accessToken]);

  const handleGradeChange = (studentId: string, grade: string) => {
    const max = assignment?.maxMarks || 100;
    let val = grade === "" ? "" : Math.min(Math.max(+grade || 0, 0), max).toString();
    setGrades(prev => ({ ...prev, [studentId]: val }));
  };

  const submitGrade = async (submissionId: string) => {
    const studentId =
      assignment.submissions.find((s: any) => s._id === submissionId)?.studentId ||
      submissionId;

    const grade = Number(grades[studentId]);
    if (isNaN(grade)) return toast.error("Invalid grade");

    try {
      setIsSubmitting(true);
      await axios.post(
        `/api/assignments/${assignmentId}/grade`,
        { grades: [{ studentId, grade }] },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Grade submitted");
      setAssignment((prev: any) => ({
        ...prev,
        submissions: prev.submissions.map((s: any) =>
          s._id === submissionId ? { ...s, grade } : s
        ),
      }));
    } catch {
      toast.error("Failed to submit grade");
    } finally {
      setIsSubmitting(false);
      setGradingSubmissionId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!assignment) {
    return <div className="text-center py-20">Assignment not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate("/teacher/assignments")}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Assignments
      </button>

      <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
      <p className="text-gray-700 mb-6">{assignment.description}</p>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Student</th>
              <th className="p-3 border">Submitted At</th>
              <th className="p-3 border">Late</th>
              <th className="p-3 border">Grade</th>
              <th className="p-3 border">Content</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignment.submissions?.map((s: any) => {
              const studentId = s.studentId || s._id;
              const editing = gradingSubmissionId === s._id;

              return (
                <tr key={s._id} className="border-t">
                  <td className="p-3 border">{s.studentName}</td>
                  <td className="p-3 border">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                  <td className="p-3 border">{s.isLate ? "Yes" : "No"}</td>
                  <td className="p-3 border">{s.grade ?? "—"}</td>
                  <td className="p-3 border">{s.submissionContent.text}</td>
                  <td className="p-3 border">
                    {editing ? (
                      <>
                        <input
                          type="number"
                          value={grades[studentId]}
                          onChange={e =>
                            handleGradeChange(studentId, e.target.value)
                          }
                          className="border px-2 py-1 w-20 mr-2"
                        />
                        <button
                          disabled={isSubmitting}
                          onClick={() => submitGrade(s._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setGradingSubmissionId(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setGradingSubmissionId(s._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        {s.grade !== undefined ? "Edit Grade" : "Grade"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;
