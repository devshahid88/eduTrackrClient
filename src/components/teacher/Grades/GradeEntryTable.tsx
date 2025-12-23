import React from 'react';

const GradeEntryTable = ({ students, grades, onGradeChange, feedbacks, onFeedbackChange }) => {
  console.log('GradeEntryTable rendered with students:', students);
  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-full divide-y divide-gray-200"
        aria-label="Student grades table"
      >
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Submission</th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Grade (0-100)</th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Feedback</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base font-medium text-gray-900">{student.studentName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base text-gray-600">
                  {student.studentsubmittedAt ? new Date(student.studentsubmittedAt).toLocaleDateString() : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-base text-gray-600">
                  {student.submission?.content ? (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{student.submission.content}</p>
                  ) : student.submission?.files?.length > 0 ? (
                    <div className="space-y-1">
                      {student.submission.files.map((file, index) => (
                        <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 block">
                          {file.name || `File ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No submission content</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative group">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grades[student._id] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                        onGradeChange(student._id, value);
                      }
                    }}
                    className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
                      grades[student._id] && (Number(grades[student._id]) < 0 || Number(grades[student._id]) > 100)
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="0-100"
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <textarea
                  value={feedbacks?.[student._id] || ''}
                  onChange={(e) => onFeedbackChange?.(student._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Feedback..."
                  rows={2}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeEntryTable;