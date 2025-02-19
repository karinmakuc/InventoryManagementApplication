/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    //If there is no token, show text and login button
    if (!token) {
        return (
            <div>
                <h2>You do not have permission to see this page.</h2>
                <button onClick={() => navigate('/login')}>Go to Login Page</button>
            </div>
        );
    }

    return children; //If there is a token show protected content
};

export default ProtectedRoute;