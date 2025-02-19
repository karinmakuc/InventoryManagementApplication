import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "./NavBar";

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [newWarehouse, setNewWarehouse] =
        useState(
            { name: "" }
        );
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    //Get all warehouses
    const fetchWarehouses = async () => {
        try {
            const response = await axios.get("https://localhost:7290/api/warehouses");
            console.log("Fetched Warehouses:", response.data);
            setWarehouses(response.data);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        }
    };

    //Function to handle adding a new warehouse
    const handleAddWarehouse = async (e) => {
        e.preventDefault();

        if (!newWarehouse.name) {
            alert("Please provide a name for the warehouse.");
            return;
        }

        try {
            const response = await axios.post("https://localhost:7290/api/warehouses", {
                name: newWarehouse.name,
            });
            console.log(response);

            //Update the local warehouse list without re-fetching
            setWarehouses((prevWarehouses) => [...prevWarehouses, response.data]);

            //Clear the form
            setNewWarehouse({ name: "" });

            //Close the modal
            closePopup();

            alert("Warehouse added successfully!");
        } catch (error) {
            console.error("Error adding warehouse:", error);
            alert("Failed to add warehouse.");
        }
    };

    //Handle opening and closing of the modal
    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);

    //Edit a warehouse
    const handleEdit = async (id) => {
        const newName = prompt("Enter new warehouse name:");

        if (newName) {
            try {
                await axios.put(`https://localhost:7290/api/warehouses/${id}`, {
                    id,
                    name: newName,
                });

               

                alert("Warehouse updated successfully!");

                //Update warehouse without fetching
                setWarehouses((prevWarehouses) =>
                    prevWarehouses.map((warehouse) =>
                        warehouse.id === id ? { ...warehouse, name: newName } : warehouse
                    )
                );
            } catch (error) {
                console.error("Error updating warehouse:", error);
                alert("Failed to update warehouse.");
            }
        }
    };

    //Delete a warehouse
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this warehouse?")) {
            try {
                await axios.delete(`https://localhost:7290/api/Warehouses/${id}`);
                alert("Warehouse deleted successfully!");
                setWarehouses(warehouses.filter((warehouse) => warehouse.id !== id));// Remove from UI
            } catch (error) {
                console.error("Error deleting warehouse:", error);
                alert("Failed to delete warehouse.");
            }
        }
    };

    return (
        <div className="page">
            <div className="dashboard-container">
                <NavBar />

                <button onClick={openPopup} className="open-popup-button">
                    ADD NEW WAREHOUSE
                </button>

                {isPopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <button onClick={closePopup} className="close-popup-button">
                                X
                            </button>
                            <form onSubmit={handleAddWarehouse} className="warehouse-form">
                                <label>Warehouse</label>
                                <input
                                    type="text"
                                    placeholder="Warehouse Name"
                                    value={newWarehouse.name}
                                    onChange={(e) =>
                                        setNewWarehouse({ ...newWarehouse, name: e.target.value })
                                    }
                                    required
                                    className="warehouse-input"
                                />
                                <button type="submit" className="submit-button">
                                    Add Warehouse
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="center-table">
                    <table className="warehouses-table">
                        <thead>
                            <tr>
                                {/*<th>ID</th>*/}
                                <th>Name</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.length > 0 ? (
                                warehouses.map((warehouse) => (
                                    <tr key={warehouse.id}>
                                        {/*<td>{warehouse.id}</td>*/}
                                        <td>{warehouse.name}</td>
                                        <td>
                                            <button
                                                onClick={() => handleEdit(warehouse.id)}
                                                className="edit-button-custom"
                                            >
                                                🖊️
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(warehouse.id)}
                                                className="delete-button-custom"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td>
                                        No warehouses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Warehouses;