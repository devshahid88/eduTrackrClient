import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../../api/axiosInstance';

const StudentDetails = ({ studentId, accessToken }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);
  const [studentSchedules, setStudentSchedules] = useState<any>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedAssignments: 0,
    gradedAssignments: 0,
    totalMarks: 0,
    totalGrade: 0,
    averageGrade: 0
  });

useEffect(() => {
  const fetchStudentDetails = async () => {
    try {
      // Fetch student details
      const response = await axios.get(`/api/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const studentData = response.data.data || response.data;
      console.log('Student Data:', studentData);
      setStudent(studentData);

      // Fetch student's courses through department schedules
      let uniqueCourses:any = [];
      let courseIds = new Set();
      if (studentData.departmentId) {
        try {
          const schedulesResponse = await axios.get(
            `/api/schedules/department/${studentData.departmentId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (schedulesResponse.data.success) {
            const schedules = schedulesResponse.data.data;
            setStudentSchedules(schedules);

            // Extract unique courses from schedules
            schedules.forEach((schedule) => {
              if (schedule.courseId?._id && !courseIds.has(schedule.courseId._id)) {
                courseIds.add(schedule.courseId._id);
                uniqueCourses.push({
                  _id: schedule.courseId._id,
                  code:schedule.courseId.code,
                  name: schedule.courseId.name || 'Unknown Course',
                  teacher: schedule.teacherId?.username || 'TBA',
                  day: schedule.day,
                  time: `${schedule.startTime} - ${schedule.endTime}`,
                  room: schedule.room,
                });
              }
            });
            setCourses(uniqueCourses);
            console.log('Course IDs:', Array.from(courseIds));
          }
        } catch (error) {
          console.error('Error fetching schedules:', error);
          setCourses([]);
        }
      }

      // Fetch all assignments and filter by department and course
      try {
        const assignmentsResponse = await axios.get('/api/assignments', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const allAssignments = assignmentsResponse.data.data || [];
        console.log('All Assignments:', allAssignments);

        // Filter assignments by department and course
        const filteredAssignments = allAssignments.filter((assignment) => {
          // Ensure assignment has valid departmentId and courseId
          if (!assignment.departmentId || !assignment.courseId) return false;
          // Check if assignment matches student's department and enrolled courses
          const courseId = typeof assignment.courseId === 'object' ? assignment.courseId._id : assignment.courseId;
          return (
            assignment.departmentId === studentData.departmentId &&
            courseIds.has(courseId)
          );
        });
        console.log('Filtered Assignments:', filteredAssignments);

        // Process filtered assignments to include student's submission
        const processedAssignments = filteredAssignments.map((assignment) => {
          const studentSubmission = assignment.submissions?.find(
            (submission) => submission.studentId === studentId
          );

          return {
            _id: assignment._id,
            title: assignment.title,
            course: assignment.courseName || 'N/A', // Use courseName from sample data
            courseId: typeof assignment.courseId === 'object' ? assignment.courseId._id : assignment.courseId,
            teacher: assignment.teacherId?.username || assignment.teacherName  || 'N/A',
            status: studentSubmission ? 'Submitted' : 'Pending',
            grade: studentSubmission?.grade || null,
            feedback: studentSubmission?.feedback || null,
            dueDate: assignment.dueDate,
            submittedDate: studentSubmission?.submittedAt,
            description: assignment.description,
            totalMarks: assignment.maxMarks || 0, // Use maxMarks from sample data
            submissionFile: studentSubmission?.fileUrl,
            assignmentFile: assignment.fileUrl,
            createdAt: assignment.createdAt,
          };
        });

        setAssignments(processedAssignments);

        // Calculate statistics
        const stats = {
          totalAssignments: processedAssignments.length,
          submittedAssignments: processedAssignments.filter((a) => a.status === 'Submitted').length,
          gradedAssignments: processedAssignments.filter((a) => a.grade !== null).length,
          totalMarks: processedAssignments.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0),
          totalGrade: processedAssignments.reduce((acc, curr) => acc + (curr.grade || 0), 0),
          averageGrade: 0,
        };

        // Calculate average grade
        if (stats.totalMarks > 0) {
          stats.averageGrade = Math.round((stats.totalGrade / stats.totalMarks) * 100);
        }

        console.log('Stats:', stats);
        setStats(stats);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchStudentDetails();
}, [studentId, accessToken]);

  if (loading || !student) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-lg text-gray-600">Loading student details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-600 mt-1">Detailed information and academic records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Student Profile Card */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    className="h-28 w-28 rounded-full object-cover border-4 border-blue-100"
                    src={student?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.firstname + ' ' + student?.lastname)}&background=0D8ABC&color=fff&size=256`}
                    alt={`${student?.firstname} ${student?.lastname}`}
                  />
                  <div className="absolute bottom-0 right-0 h-8 w-8 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{student?.firstname} {student?.lastname}</h2>
                <p className="text-sm text-gray-500">Student ID: {student?.username || 'N/A'}</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                  <p className="text-sm text-gray-900 mt-1">{student?.email || 'Not provided'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                  <p className="text-sm text-gray-900 mt-1">{student?.departmentId?.name || student?.departmentName || 'Not assigned'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class Level</label>
                  <p className="text-sm text-gray-900 mt-1">{student?.class || 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Program</label>
                  <p className="text-sm text-gray-900 mt-1">{student?.courses?.[0]?.name || 'Not specified'}</p>
                </div>
                
               
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Academic Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</div>
                  <div className="text-sm text-gray-600">Total Assignments</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.submittedAssignments}</div>
                  <div className="text-sm text-gray-600">Submitted</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.gradedAssignments}</div>
                  <div className="text-sm text-gray-600">Graded</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalGrade || 0} / {stats.totalMarks || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Average: {stats.averageGrade || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Assignment History</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {assignments.length} Assignments
                </span>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                              {assignment.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment.course}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment.teacher}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              assignment.status === 'Submitted'
                                ? 'bg-green-100 text-green-800'
                                : assignment.status === 'Late'
                                ? 'bg-red-100 text-red-800'
                                : assignment.status === 'Graded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment.grade ? (
                              <div>
                                <span className="font-semibold">{assignment.grade}</span>
                                <span className="text-gray-500"> / {assignment.totalMarks}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment.submittedDate ? new Date(assignment.submittedDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                          <p className="mt-1 text-sm text-gray-500">This student hasn't submitted any assignments yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Enrolled Courses</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {courses.length} Courses
                </span>
              </div>
              
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course, index) => (
                    <div key={course._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{course.name}</h4>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            Course Code: {course.code || 'N/A'}
                          </p>
                        </div>
                      
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <span>Instructor: <span className="font-medium text-gray-900">{course.teacher}</span></span>
                        </div>
                        
                        {course.room && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>Room: <span className="font-medium text-gray-900">{course.room}</span></span>
                          </div>
                        )}
                        
                        {course.day && course.time && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Schedule: <span className="font-medium text-gray-900">{course.day}, {course.time}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                  <p className="mt-1 text-sm text-gray-500">This student hasn't been enrolled in any courses yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;