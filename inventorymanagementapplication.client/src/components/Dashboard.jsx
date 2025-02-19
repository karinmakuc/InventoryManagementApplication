/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";

/*Dashboard = Inventories*/
function Dashboard() {
    const [inventories, setInventories] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editInventory, setEditInventory] = useState({
        productId: "",
        warehouseId: "",
        quantity: "",
        productPrice: "",
    });

    const [newInventory, setNewInventory] = useState({
        productId: "",
        warehouseId: "",
        quantity: "",
        productPrice: "",
    });

    const [selectedWarehouseIds, setSelectedWarehouseIds] = useState("all");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");


    // Load existing inventory from database on page load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const inventoryResponse = await axios.get("https://localhost:7290/api/inventories");
                const productsResponse = await axios.get("https://localhost:7290/api/products");
                const warehousesResponse = await axios.get("https://localhost:7290/api/warehouses");

                setInventories(inventoryResponse.data);
                setProducts(productsResponse.data);
                setWarehouses(warehousesResponse.data);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    //Warehouses
    useEffect(() => {
        //Fetch warehouse data 
        const fetchWarehouses = async () => {
            const response = await fetch('/api/warehouses');
            const data = await response.json();
            setWarehouses(data);

            // Pre-select all warehouses on load (select all warehouses initially)
            setSelectedWarehouseIds(data.map(warehouse => warehouse.id));
        };
        fetchWarehouses();
    }, []);

    

    // Filter inventories based on selected warehouse and search query
    const filteredInventories = inventories.filter((inventory) => {
        const matchesWarehouse =
            selectedWarehouseIds === "all" ||
            inventory.warehouseId === Number(selectedWarehouseIds);

        const matchesSearchQuery =
            inventory.productName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesWarehouse && matchesSearchQuery;
    });

    const handleWarehouseChange = (e) => {
        const warehouseId = e.target.value;
        setSelectedWarehouseIds(warehouseId); //Update the selected warehouse
    };

    // Get the selected warehouse object (to update dropdown text dynamically)
    const selectedWarehouse = selectedWarehouseIds === "all" ? { name: "Select All" } : warehouses.find(warehouse => warehouse.id === Number(selectedWarehouseIds));


    // HandleProductChange for "Add Inventory"
    const handleProductChangeForAdd = (e) => {
        const selectedProductId = e.target.value;
        const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

        if (selectedProduct) {
            // Update newInventory with the selected product's details for adding inventory
            setNewInventory({
                ...newInventory,
                productId: selectedProductId,
                productPrice: selectedProduct.price, // Update price based on selected product
            });
        }
    };

    // Separate handleProductChange for "Edit Inventory"
    const handleProductChangeForEdit = (e) => {
        const selectedProductId = e.target.value;
        const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

        if (selectedProduct) {
            // Update editInventory with the selected product's details for editing inventory
            setEditInventory({
                ...editInventory,
                productId: selectedProductId,
                productPrice: selectedProduct.price, //Update price based on selected product
            });
        }
    };

    // Handle product selection & auto-fill price for editing inventory
    useEffect(() => {
        if (isEditing && editInventory && editInventory.productId) {
            const selectedProduct = products.find((p) => p.id === editInventory.productId);
            if (selectedProduct) {
                setEditInventory({
                    ...editInventory,
                    productPrice: selectedProduct.price
                });
            }
        }
    }, [isEditing, editInventory.productId, products]);

    //Adding a new inventory item
    const handleAddInventory = async (e) => {
        e.preventDefault();

        // Convert inputs to numbers
        const inventoryData = {
            productId: Number(newInventory.productId),
            warehouseId: Number(newInventory.warehouseId),
            quantity: Number(newInventory.quantity),
        };

        console.log("Submitting Inventory:", inventoryData);

        try {
            const response = await axios.post("https://localhost:7290/api/inventories", inventoryData);

            console.log("Added inventory:", response.data);

            const addedInventory = {
                ...response.data,
                productName: products.find((product) => product.id === response.data.productId)?.name,
                warehouseName: warehouses.find((warehouse) => warehouse.id === response.data.warehouseId)?.name,
                productPrice: products.find((product) => product.id === response.data.productId)?.price,
            };

            // Update the state with the new inventory
            setInventories([...inventories, addedInventory]);

            setNewInventory({ productId: "", warehouseId: "", quantity: "" });
            closePopup();
            alert("Inventory added successfully!");
        } catch (error) {
            console.error("Error adding inventory:", error.response?.data || error.message);
            alert(`Error: ${JSON.stringify(error.response?.data.errors || error.message)}`);
        }
    };

    
    // Function to handle Update (editing an inventory)
    const handleUpdate = async (e) => {
        e.preventDefault();

        // Ensure all required fields are valid before updating
        if (
            !editInventory.productId ||
            !editInventory.warehouseId ||
            !editInventory.quantity ||
            !editInventory.productPrice
        ) {
            alert("Please complete all fields before updating.");
            return; // Prevent update if validation fails
        }

        try {
            // Send PUT request to update the inventory
            const updatedInventory = { ...editInventory };

            const response = await axios.put(`https://localhost:7290/api/inventories/${editInventory.id}`, updatedInventory);

            console.log('Updated Inventory:', response.data);

            // After successfully updating, get the updated product and warehouse details from the response
            const updatedProduct = products.find(
                (product) => product.id === response.data.productId
            );
            const updatedWarehouse = warehouses.find(
                (warehouse) => warehouse.id === response.data.warehouseId
            );

            // Manually update the productName and warehouseName to show changes
            const updatedInventoryWithNames = {
                ...response.data,
                productName: updatedProduct ? updatedProduct.name : "Unknown",
                warehouseName: updatedWarehouse ? updatedWarehouse.name : "Unknown",
                productPrice: updatedProduct ? updatedProduct.price : response.data.productPrice,
            };

            // Update inventories state with the new inventory details
            setInventories((prevInventories) =>
                prevInventories.map((inventory) =>
                    inventory.id === updatedInventoryWithNames.id ? updatedInventoryWithNames : inventory
                )
            );

            // After successfully updating, reset state and close popup
            setIsEditing(false);
            setEditInventory({
                productId: "",
                warehouseId: "",
                quantity: "",
                productPrice: "",
            });

            closePopup();
            alert("Inventory updated successfully!");
        } catch (error) {
            console.error("Error updating inventory:", error);
            alert("Failed to update inventory.");
        }
    };


    // Function to handle Delete
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this inventory item?');
        if (confirmDelete) {
            try {
                await axios.delete(`https://localhost:7290/api/inventories/${id}`);
                setInventories(inventories.filter((inventory) => inventory.id !== id));
                alert('Inventory item deleted successfully!');
            } catch (error) {
                console.error('Error deleting inventory:', error);
                alert('Failed to delete inventory.');
            }
        }
    };

    

    // Function to open the popup for adding inventory
    const openAddPopup = () => {
        setIsEditing(false);
        setIsPopupOpen(true);
    };

    // Function to open the popup for editing inventory
    const openEditPopup = (inventory) => {
        setIsEditing(true);
        setEditInventory(inventory);
        setIsPopupOpen(true);
    };

    // Function to close the popup and reset form state
    const closePopup = () => {
        setIsPopupOpen(false);
        setEditInventory({
            productId: "",
            warehouseId: "",
            quantity: "",
            productPrice: "",
        });
        setIsEditing(false);
    };

    return (
        <div className="page">
            <div className="dashboard-container">
                <NavBar />
                <button onClick={openAddPopup} className="open-popup-button">ADD NEW INVENTORY</button>

                {isPopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <button onClick={closePopup} className="close-popup-button">X</button>
                            {isEditing && editInventory && Object.keys(editInventory).length > 0 ? (
                                // Edit form
                                <form onSubmit={handleUpdate} className="inventory-form">
                                    <label>Product</label>
                                    <select
                                        className="select-input"
                                        value={editInventory.productId}
                                        onChange={handleProductChangeForEdit}
                                    >
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label>Price (€)</label>
                                    <input
                                        type="number"
                                        value={editInventory.productPrice}
                                        className="inventory-input"
                                        disabled
                                    />
                                    <label>Warehouse</label>
                                    <select
                                        value={editInventory.warehouseId}
                                        onChange={(e) => setEditInventory({ ...editInventory, warehouseId: e.target.value })}
                                        required
                                        className="select-input"
                                    >
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                        ))}
                                    </select>
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        value={editInventory.quantity}
                                        onChange={(e) => setEditInventory({ ...editInventory, quantity: e.target.value })}
                                        required
                                        className="inventory-input"
                                    />
                                    <button type="submit" className="submit-button">Update Inventory</button>
                                </form>
                            ) : (
                                // Add Inventory form
                                <form onSubmit={handleAddInventory} className="inventory-form">
                                    <label>Product</label>
                                        <select value={newInventory.productId} onChange={handleProductChangeForAdd} required className="inventory-input">
                                        <option value="">Select a Product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                    <label>Price (€)</label>
                                        <input type="number" value={newInventory.productPrice} disabled className="inventory-input" />
                                    <label>Warehouse</label>
                                    <select value={newInventory.warehouseId} onChange={(e) =>
                                        setNewInventory({ ...newInventory, warehouseId: e.target.value })
                                    } required
                                            className="inventory-input"
                                        >
                                        <option value="">Select a Warehouse</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                        ))}
                                    </select>
                                    <label>Quantity</label>
                                    <input type="number" placeholder="Quantity" value={newInventory.quantity}
                                        onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                                            required
                                            className="inventory-input"
                                        />
                                    <button type="submit" className="submit-button">Add Inventory</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/*Inventory Table*/}
                <div className="center-table">
                    <table className="inventories-table">
                        <thead>
                            <tr>
                                <th>Product Name
                                    <input
                                        type="text"
                                        placeholder="Search by product name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="dropdown-style"
                                    />
                                </th>
                                <th>Warehouse Name
                                    <select
                                        id="warehouse-select"
                                        value={selectedWarehouseIds}
                                        onChange={handleWarehouseChange}
                                        className="dropdown-style"
                                    >
                                        <option value="all">SELECT ALL</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th>Price (€)</th>
                                <th>Quantity</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventories.length > 0 ? (
                                filteredInventories.map((inventory) => {
                                    return (
                                        <tr key={inventory.id}>
                                            <td>{inventory.productName || "Unknown"}</td>
                                            <td>{inventory.warehouseName || "Unknown"}</td>
                                            <td>{inventory.productPrice ? `${inventory.productPrice} €` : "N/A"}</td>
                                            <td>{inventory.quantity}</td>
                                            <td>
                                                <button onClick={() => openEditPopup(inventory)} className="edit-button-custom">🖊️</button>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(inventory.id)} className="delete-button-custom">🗑️</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6">No inventory records found for the selected warehouse.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;