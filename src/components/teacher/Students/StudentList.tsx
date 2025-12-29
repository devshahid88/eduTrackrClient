import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MdSearch, MdPerson, MdEmail, MdSchool, MdArrowForward } from 'react-icons/md';
import StudentDetails from './StudentDetails';
import { RootState } from '../../../redux/store';

const StudentList = ({ students, loading, teacherDepartment, searchQuery, setSearchQuery }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const authState = useSelector((state: RootState) => state.auth);
  const accessToken = authState?.accessToken;

  const [sortBy, setSortBy] = useState<'name' | 'grade'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.firstname + ' ' + student.lastname).toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.departmentName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || String(student.class) === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = (a.firstname + ' ' + a.lastname).toLowerCase();
      const nameB = (b.firstname + ' ' + b.lastname).toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const gradeA = parseInt(a.class) || 0;
      const gradeB = parseInt(b.class) || 0;
      return sortOrder === 'asc' ? gradeA - gradeB : gradeB - gradeA;
    }
  });

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const currentStudents = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const grades = Array.from(new Set(students.map(s => String(s.class)).filter(g => g !== 'undefined' && g !== 'null'))) as string[];

  const handleViewDetails = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleBack = () => {
    setSelectedStudentId(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 px-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white h-24 rounded-[2.5rem] border border-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {selectedStudentId ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <button
              onClick={handleBack}
              className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
            >
              <MdArrowForward className="rotate-180 text-xl" />
            </button>
            <div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Insight</h1>
               <p className="text-gray-500 font-medium tracking-tight text-sm">Deep dive into performance and records.</p>
            </div>
          </div>
          <StudentDetails studentId={selectedStudentId} accessToken={accessToken} />
        </div>
      ) : (
        <>
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Directory</h1>
              <p className="text-gray-500 font-medium tracking-tight mt-1">Managing {teacherDepartment || "Faculty"} roster.</p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative group">
                 <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <MdSearch className="text-2xl text-gray-300" />
                 </div>
                 <input
                   type="text"
                   placeholder="Search students..."
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setCurrentPage(1);
                   }}
                   className="w-full md:w-64 pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
                 />
              </div>

              <select
                value={filterGrade}
                onChange={(e) => {
                  setFilterGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-[10px] uppercase tracking-widest text-gray-400 outline-none cursor-pointer"
              >
                <option value="all">All Grades</option>
                {grades.sort().map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-') as [any, any];
                  setSortBy(newSort);
                  setSortOrder(newOrder);
                }}
                className="px-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-[10px] uppercase tracking-widest text-gray-400 outline-none cursor-pointer"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="grade-asc">Grade (Low-High)</option>
                <option value="grade-desc">Grade (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Identity</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Level</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentStudents.map((student) => (
                    <tr key={student._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 relative">
                            <img
                              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-gray-50 shadow-sm group-hover:scale-110 transition-transform duration-300"
                              src={student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstname + ' ' + student.lastname)}&background=f1f5f9&color=3b82f6&size=128&bold=true`}
                              alt={student.firstname}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900 leading-none">{student.firstname} {student.lastname}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">ID: {student._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <MdEmail className="text-blue-400 text-lg" />
                            {student.email}
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                            <MdSchool className="text-emerald-400 text-lg" />
                            {student.departmentName}
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                           Grade {student.class || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(student._id)}
                          className="px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center opacity-30">
                            <MdPerson className="text-6xl mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No matching students</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentList;