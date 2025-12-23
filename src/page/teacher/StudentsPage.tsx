import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import StudentList from "../../components/teacher/Students/StudentList";

const StudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherDepartment, setTeacherDepartment] = useState("");

  useEffect(() => {
    const fetchTeacherAndStudents = async () => {
      try {
        const teacher = JSON.parse(localStorage.getItem("user") || "{}");
        const department = teacher?.departmentName;

        if (!department) return;

        setTeacherDepartment(department);

        const res = await axios.get("/api/students");
        const allStudents = res.data.data || [];

        const filtered = allStudents.filter(
          (s: any) =>
            s.departmentName?.toLowerCase() === department.toLowerCase()
        );

        setStudents(filtered);
      } catch (err) {
        console.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAndStudents();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <StudentList
        students={students}
        loading={loading}
        teacherDepartment={teacherDepartment}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
};

export default StudentsPage;
