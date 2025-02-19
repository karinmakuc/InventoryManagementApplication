/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        ppassword: "",
    });

    //Password visibility
    const [passwordVisible, setPasswordVisible] = useState(false);

    //Navigation
    const navigate = useNavigate(); 

    //Updates form data on change in input fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //Toggle password visibility
    const togglePassword = () => {
        setPasswordVisible(!passwordVisible);
    };

    // Submit registration and login
    const handleSubmit = async (e) => {
        e.preventDefault();

        const registrationData = {
            username: formData.username,
            password: formData.password,
            email: formData.email
        };
        try {
            //Make the API request to the backend for registration
            const registrationResponse = await axios.post("https://localhost:7290/api/account/register", registrationData);

            //Make the API request to the backend for login (token or error)
            const loginResponse = await axios.post("https://localhost:7290/api/account/login",
                {
                    username: formData.username,
                    password: formData.password
                }
            );
            //Store the token received from login (if returned in the response)
            if (loginResponse.data.token) {
                localStorage.setItem('token', loginResponse.data.token);
                //Toast success
                toast.success('Registration and login successful!', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    style: {
                        fontSize: '16px',
                        padding: '16px',
                        minWidth: '350px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    },
                    //Custom close button style
                    closeButton: (
                        <span style={{
                            marginLeft: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                        }}>
                            &times;
                        </span>
                    ),
                    //If X is clicked -> redirect instantly
                    onClose: () => {
                        navigate("/dashboard");
                    }
                }); 
                //Navigate to the dashboard after successful login
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2500);
            }
        } catch (error) {
            //Error toast
            toast.error("Registration failed. Please try again.", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
                style: {
                    fontSize: '16px',
                    padding: '16px',
                    minWidth: '350px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                },
                //Custom close button style
                closeButton: (
                    <span style={{
                        marginLeft: '10px',
                        cursor: 'pointer',
                        fontSize: '18px',
                    }}>
                        &times;
                    </span>
                ),
            }); 
        }
    };

    return (
        <div className="page">
            <div className="form-container">
                <h2>Register</h2>
                <form className="login-register-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                    />
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <div className="password-container">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                        <span className="eye-icon" onClick={togglePassword}>
                            {passwordVisible ? '🙈' : '👁️'}
                        </span>
                    </div>
                    <button type="submit">Register and login</button>
                </form>
                <p className="login-register-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
                <ToastContainer />
            </div>
        </div>       
    );
}

export default Register;