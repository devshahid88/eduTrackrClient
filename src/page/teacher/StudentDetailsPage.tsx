import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import { RootState } from "../../redux/store";

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const accessToken = authState?.accessToken;

        const studentRes = await axios.get(`/api/students/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const studentData = studentRes.data.data || studentRes.data;
        setStudent(studentData);

        const assignmentsRes = await axios.get(
          `/api/assignments/student/${id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setAssignments(assignmentsRes.data.data || []);

        if (studentData.departmentId) {
          const schedulesRes = await axios.get(
            `/api/schedules/department/${studentData.departmentId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (schedulesRes.data.success) {
            const uniqueCourses: any[] = [];
            const seen = new Set();

            schedulesRes.data.data.forEach((s: any) => {
              if (s.courseId && !seen.has(s.courseId._id)) {
                seen.add(s.courseId._id);
                uniqueCourses.push({
                  ...s.courseId,
                  teacher: s.teacherId?.name || "TBA",
                  time: `${s.startTime} - ${s.endTime}`,
                  room: s.room,
                });
              }
            });

            setCourses(uniqueCourses);
          }
        }
      } catch (err) {
        console.error("Failed to fetch student details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, authState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Student not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Profile</h1>
          <p className="text-gray-600">Academic details and performance</p>
        </div>
        <button
          onClick={() => navigate("/teacher/students")}
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
        >
          ← Back to Students
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border p-6">
          <div className="text-center">
            <img
              className="h-28 w-28 rounded-full mx-auto border"
              src={
                student.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  student.firstname + " " + student.lastname
                )}&background=0D8ABC&color=fff`
              }
              alt="student"
            />
            <h2 className="mt-4 text-xl font-bold">
              {student.firstname} {student.lastname}
            </h2>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </div>

        {/* Courses & Assignments */}
        <div className="xl:col-span-3 space-y-6">
          {/* Courses */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-xl font-semibold mb-4">
              Enrolled Courses ({courses.length})
            </h3>

            {courses.length ? (
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="border rounded-lg p-4 hover:shadow"
                  >
                    <h4 className="font-semibold">{course.name}</h4>
                    <p className="text-sm text-gray-600">
                      Instructor: {course.teacher}
                    </p>
                    {course.room && (
                      <p className="text-sm text-gray-600">
                        Room: {course.room}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses enrolled</p>
            )}
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-xl font-semibold mb-4">
              Assignment History ({assignments.length})
            </h3>

            {assignments.length ? (
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a: any) => (
                    <tr key={a._id} className="border-t">
                      <td className="p-3">{a.title}</td>
                      <td className="p-3">{a.status || "Pending"}</td>
                      <td className="p-3">{a.grade ?? "-"}</td>
                      <td className="p-3">
                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No assignments found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsPage;
