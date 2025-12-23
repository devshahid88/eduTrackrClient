import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  MdArrowBack, 
  MdAssignment, 
  MdCheckCircle, 
  MdFileDownload, 
  MdAccessTime, 
  MdPerson,
  MdGrading,
  MdModeEdit,
  MdSend
} from "react-icons/md";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { RootState } from "../../redux/store";

const AssignmentDetailsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});
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
        const initialFeedbacks: any = {};
        data.submissions?.forEach((s: any) => {
          const id = s.studentId || s._id;
          initialGrades[id] = s.grade?.toString() || "";
          initialFeedbacks[id] = s.feedback || "";
        });
        setGrades(initialGrades);
        setFeedbacks(initialFeedbacks);
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

  const handleFeedbackChange = (studentId: string, feedback: string) => {
    setFeedbacks(prev => ({ ...prev, [studentId]: feedback }));
  };

  const submitGrade = async (submissionId: string) => {
    const submission = assignment.submissions.find((s: any) => s._id === submissionId);
    const studentId = submission?.studentId || submissionId;

    const grade = Number(grades[studentId]);
    const feedback = feedbacks[studentId];
    
    if (isNaN(grade)) return toast.error("Please enter a valid numeric grade");

    try {
      setIsSubmitting(true);
      await axios.post(
        `/api/assignments/${assignmentId}/grade`,
        { 
          grades: [{ 
            studentId, 
            grade,
            feedback
          }] 
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Grade submitted successfully");
      setAssignment((prev: any) => ({
        ...prev,
        submissions: prev.submissions.map((s: any) =>
          s._id === submissionId ? { ...s, grade, feedback } : s
        ),
      }));
      setGradingSubmissionId(null);
    } catch {
      toast.error("Failed to submit grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 animate-pulse font-medium text-sm">Retrieving submission data...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-black text-gray-900">Assignment Not Found</h2>
        <button 
          onClick={() => navigate("/teacher/assignments")}
          className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg"
        >
          Return to List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Navbar/Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-4">
          <button
            onClick={() => navigate("/teacher/assignments")}
            className="group flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-colors"
          >
            <MdArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </button>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-200">
                <MdAssignment />
             </div>
             <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{assignment.title}</h1>
                <p className="text-gray-500 font-medium">Detailed submission overview and grading portal.</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-end">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Max Grade</span>
               <span className="text-2xl font-black text-blue-600 leading-none">{assignment.maxMarks}</span>
            </div>
            <div className="bg-white px-5 py-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-end">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Submissions</span>
               <span className="text-2xl font-black text-emerald-600 leading-none">{assignment.submissions?.length || 0}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left: Assignment Context Card */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-32">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 Assignment Info
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-50 pl-4 py-2 mb-8">
                 "{assignment.description}"
              </p>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <MdAccessTime className="text-lg text-blue-500" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <MdCheckCircle className="text-lg text-emerald-500" />
                    <span>Course: {assignment.courseId?.name || "N/A"}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Submissions Table Wrapper */}
        <div className="lg:col-span-3 space-y-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight px-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 text-sm italic font-serif">S</div>
                Student Submissions
            </h2>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating & Feedback</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assignment.submissions?.map((s: any) => {
                                const studentId = s.studentId || s._id;
                                const isEditing = gradingSubmissionId === s._id;

                                return (
                                    <tr key={s._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                                   {s.studentName?.charAt(0) || <MdPerson />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{s.studentName}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${s.isLate ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {s.isLate ? 'Late Submission' : 'On Time'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="space-y-3">
                                                <p className="text-xs font-medium text-gray-600 line-clamp-2 italic w-48">
                                                   {s.submissionContent?.text ? `"${s.submissionContent.text}"` : "No explanatory text provided."}
                                                </p>
                                                {s.submissionContent?.files?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {s.submissionContent.files.map((file: string, idx: number) => (
                                                            <a 
                                                                key={idx} 
                                                                href={file} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                                                            >
                                                                <MdFileDownload /> File {idx + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            {isEditing ? (
                                                <div className="space-y-4 min-w-[200px]">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={grades[studentId]}
                                                            onChange={e => handleGradeChange(studentId, e.target.value)}
                                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all text-blue-600"
                                                            placeholder="Grade"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">/ {assignment.maxMarks}</span>
                                                    </div>
                                                    <textarea
                                                        value={feedbacks[studentId]}
                                                        onChange={e => handleFeedbackChange(studentId, e.target.value)}
                                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                                                        placeholder="Add professional feedback..."
                                                        rows={2}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-baseline gap-1">
                                                       <span className="text-lg font-black text-gray-900">{s.grade ?? "--"}</span>
                                                       <span className="text-[10px] font-black text-gray-300">/ {assignment.maxMarks}</span>
                                                    </div>
                                                    {s.feedback && (
                                                       <div className="text-[10px] font-bold text-gray-500 line-clamp-2 max-w-[180px] bg-gray-50 rounded-lg p-2 border border-gray-100 italic">
                                                          {s.feedback}
                                                       </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        disabled={isSubmitting}
                                                        onClick={() => submitGrade(s._id)}
                                                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                                        title="Save Grade"
                                                    >
                                                        <MdSend />
                                                    </button>
                                                    <button
                                                        onClick={() => setGradingSubmissionId(null)}
                                                        className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                                                        title="Cancel"
                                                    >
                                                        <MdArrowBack className="rotate-90" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setGradingSubmissionId(s._id)}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                                                >
                                                    <MdModeEdit /> {s.grade !== undefined ? "Update" : "Evaluate"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!assignment.submissions || assignment.submissions.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-25">
                                           <MdGrading className="text-6xl mb-4" />
                                           <p className="text-sm font-black uppercase tracking-widest">No Submissions Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;
