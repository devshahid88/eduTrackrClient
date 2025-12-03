// src/components/admin/Header.jsx
import React from 'react';
import CommonHeader from '../../common/Header';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  return <CommonHeader role="admin"/>;
  // return <CommonHeader role="admin" onToggleSidebar={onToggleSidebar} isSidebarOpen={isSidebarOpen} />;
};

export default Header;
