/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from './components//NavBar';
import Products from './components/Products';
import Warehouses from './components/Warehouses';
import Reports from './components/Reports';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Startup page */}
                    <Route path="/" element={<LoginPage />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/*Protect dashboard without token -> url access */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                    <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;