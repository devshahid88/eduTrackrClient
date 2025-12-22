import React, { useState, useEffect, FormEvent } from "react";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

interface User {
  _id: string;
  id?: string;
  role: "student" | "teacher" | "admin";
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

interface Concern {
  _id: string;
  title: string;
  description: string;
  raisedBy: User;
  role: "student" | "teacher";
  status: "Pending" | "In Progress" | "Solved" | "Rejected";
  feedback?: string;
  createdAt: string;
}

const TeacherConcernPage: React.FC = () => {
  const authState = useSelector((state: { auth: AuthState }) => state.auth);

  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newConcern, setNewConcern] = useState({ title: "", description: "" });

  const userId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  /* ---------------- FETCH CONCERNS ---------------- */

  useEffect(() => {
    const fetchConcerns = async () => {
      if (!userId || !accessToken) return;

      try {
        setIsLoading(true);
        const res = await axios.get(`/api/concerns/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setConcerns(res.data.data || []);
      } catch {
        toast.error("Failed to load concerns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerns();
  }, [userId, accessToken]);

  /* ---------------- CREATE CONCERN ---------------- */

  const handleRaiseConcern = async (e: FormEvent) => {
    e.preventDefault();

    if (!newConcern.title || !newConcern.description) {
      toast.error("Fill in title and description");
      return;
    }

    try {
      const res = await axios.post(
        "/api/concerns",
        {
          title: newConcern.title,
          description: newConcern.description,
          raisedBy: userId,
          role: "teacher",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setConcerns(prev => [...prev, res.data.data]);
      setNewConcern({ title: "", description: "" });
      toast.success("Concern raised successfully");
    } catch {
      toast.error("Failed to raise concern");
    }
  };

  const statusStyle = (status: Concern["status"]) => {
    switch (status) {
      case "Solved":
        return "border-l-green-500 bg-green-50";
      case "Pending":
        return "border-l-yellow-500 bg-yellow-50";
      case "In Progress":
        return "border-l-blue-500 bg-blue-50";
      case "Rejected":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-2">My Concerns</h1>
      <p className="text-gray-600 mb-6">
        Raise and track your concerns here.
      </p>

      {/* Raise Concern */}
      <div className="bg-white rounded-xl shadow border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Raise a New Concern</h2>

        <form onSubmit={handleRaiseConcern} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
            value={newConcern.title}
            onChange={e =>
              setNewConcern({ ...newConcern, title: e.target.value })
            }
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Describe your concern"
            value={newConcern.description}
            onChange={e =>
              setNewConcern({ ...newConcern, description: e.target.value })
            }
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Raise Concern
          </button>
        </form>
      </div>

      {/* Concerns List */}
      {isLoading ? (
        <div className="text-center py-10">Loading concerns…</div>
      ) : concerns.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No concerns raised yet
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          {concerns.map(c => (
            <div
              key={c._id}
              className={`border-l-4 p-4 rounded-r ${statusStyle(c.status)}`}
            >
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-gray-600 mt-1">{c.description}</p>

              <div className="text-sm text-gray-500 mt-2 flex justify-between">
                <span>Status: {c.status}</span>
                <span>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              {c.feedback && (
                <p className="text-sm mt-2">
                  <strong>Feedback:</strong> {c.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherConcernPage;
