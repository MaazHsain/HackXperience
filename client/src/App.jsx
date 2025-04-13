import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/userDashboard';
import GroupPage from './pages/GroupPage';

const App = () => {
  return (
    <div>
      <ToastContainer/>
        <Routes>
          <Route path = '/' element={<Home/>}/>
          <Route path = '/login' element={<Login/>}/>
          <Route path = '/email-verify' element={<EmailVerify/>}/>
          <Route path = '/reset-password' element={<ResetPassword/>}/>
          <Route path = '/user-dashboard' element={<UserDashboard/>}/>
          <Route path = '/group/:groupId' element={<GroupPage />} />
        </Routes>
    </div>
  )
}

export default App