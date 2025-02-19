/* eslint-disable no-unused-vars */
// NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li><NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink></li>
                <li><NavLink to="/products" activeClassName="active">Products</NavLink></li>
                <li><NavLink to="/warehouses" activeClassName="active">Warehouses</NavLink></li>
                <li><NavLink to="/reports" activeClassName="active">Reports</NavLink></li>
            </ul>
            <div className="logout-button">
                <NavLink to="/login" onClick={() => localStorage.removeItem("token")}>Logout</NavLink>
            </div>
        </nav>
    );
};

export default NavBar;