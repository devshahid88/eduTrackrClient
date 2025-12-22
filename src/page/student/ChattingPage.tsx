import React from 'react';
import ChatStudent from '../../components/student/chat/ChatStudent';

const ChattingPage: React.FC = () => {

  return (
    <>
      <main className="h-full bg-gray-50">
        <ChatStudent />
      </main>
    </>
  );
};

export default ChattingPage;
