/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./NavBar";

function Reports() {
    const [productsNotInWarehouse, setProductsNotInWarehouse] = useState([]);
    const [productsWithLowStock, setProductsWithLowStock] = useState([]);
    const [stockThreshold, setStockThreshold] = useState(null);

    //get threshhold n
    useEffect(() => {
        const fetchStockThreshold = async () => {
            try {
                const response = await axios.get("https://localhost:7290/api/reports/stock-threshold");
                setStockThreshold(response.data);
            } catch (error) {
                console.error("Error fetching stock threshold", error);
            }
        };

        fetchStockThreshold();
    }, []);

    // get products that are not in any warehouse
    useEffect(() => {
        const fetchProductsNotInWarehouse = async () => {
            try {
                const response = await axios.get("https://localhost:7290/api/reports/products-not-in-warehouse");
                setProductsNotInWarehouse(response.data);
            } catch (error) {
                console.error("Error fetching products not in warehouse", error);
            }
        };

        fetchProductsNotInWarehouse();
    }, []);

    // get products with low stock
    useEffect(() => {
        const fetchProductsWithLowStock = async () => {
            try {
                const response = await axios.get("https://localhost:7290/api/Reports/products-with-low-stock");
                setProductsWithLowStock(response.data);
            } catch (error) {
                console.error("Error fetching low stock products", error);
            }
        };

        fetchProductsWithLowStock();
    }, []);

    // Convert productsNotInWarehouse to CSV
    const convertToCSVProductsNotInWarehouse = () => {
        const header = "Product Name\n";
        const rows = productsNotInWarehouse.map((product) => `${product.name}\n`).join("");
        const csvContent = header + rows;

        downloadCSV(csvContent, "products-not-in-warehouse.csv");
    };

    // Convert productsWithLowStock to CSV
    const convertToCSVProductsWithLowStock = () => {
        const header = "Product Name,Warehouse,Quantity\n";
        const rows = productsWithLowStock
            .map((product) => `${product.productName},${product.warehouseName},${product.quantity}\n`)
            .join("");
        const csvContent = header + rows;

        downloadCSV(csvContent, `products-with-low-stock-under-${stockThreshold}.csv`);
    };

    // Function to trigger download of CSV
    const downloadCSV = (csvContent, fileName) => {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    };

    return (
        <div className="page">
            <div className="dashboard-container">
                <NavBar />

                {/* Products Not in Any Warehouse */}
                <h3 className="section-title">PRODUCTS THAT ARE NOT IN ANY WAREHOUSE</h3>
                <div className="center-table">
                
                    <table className="reports-table-out">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {productsNotInWarehouse.length > 0 ? (
                                productsNotInWarehouse.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="1">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                </div>
                <button onClick={convertToCSVProductsNotInWarehouse} className="export-btn">
                    Export to .csv
                </button>
                <hr className="separator" />
                <h3 className="section-title">PRODUCTS WITH STOCK UNDER {stockThreshold !== null && `${stockThreshold}`}</h3>
                {/* Products With Low Stock */}
                <div className="center-table">
                    
                    <table className="reports-table-low">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Warehouse</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsWithLowStock.length > 0 ? (
                                productsWithLowStock.map((product) => (
                                    <tr key={`${product.productId}-${product.warehouseId}`}>
                                        <td>{product.productName}</td>
                                        <td>{product.warehouseName}</td>
                                        <td>{product.quantity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No low stock products</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                </div>
                <button onClick={convertToCSVProductsWithLowStock}>
                    Export to .csv
                </button>
            </div>
        </div>
    );      
}

export default Reports;
