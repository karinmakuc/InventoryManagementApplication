import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "./NavBar";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] =
        useState(
            {
                name: "",
                price: ""
            }
        );
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    //Get all products
    const fetchProducts = async () => {
        try {
            const response = await axios.get("https://localhost:7290/api/products");
            console.log("Fetched Products:", response.data);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Function to handle adding a new product
    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.name || !newProduct.price) {
            alert("Please provide both name and price for the product.");
            return;
        }

        try {
            const response = await axios.post("https://localhost:7290/api/products", {
                name: newProduct.name,
                price: parseFloat(newProduct.price),
            });
            console.log(response);

            //Update the local product list without re-fetching
            setProducts((prevProducts) => [...prevProducts, response.data]);

            //Clear the form
            setNewProduct({ name: "", price: "" });

            //Close the modal
            closePopup();

            alert("Product added successfully!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product.");
        }
    };

    //Handle opening and closing of the modal
    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);

    //Edit a product
    const handleEdit = async (id) => {
        const newName = prompt("Enter new product name:");
        const newPrice = prompt("Enter new product price:");

        if (newName && newPrice) {
            try {
                await axios.put(`https://localhost:7290/api/products/${id}`, {
                    id,
                    name: newName,
                    price: parseFloat(newPrice),
                });

                alert("Product updated successfully!");

                //Update product without fetching
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.id === id ? { ...product, name: newName, price: parseFloat(newPrice) } : product
                    )
                );
            } catch (error) {
                console.error("Error updating product:", error);
                alert("Failed to update product.");
            }
        }
    };

    //Delete a warehouse
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`https://localhost:7290/api/products/${id}`);
                alert("Product deleted successfully!");
                setProducts(products.filter((product) => product.id !== id));// Remove from UI
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    return (
        <div className="page">
            <div className="dashboard-container">
                <NavBar />

                <button onClick={openPopup} className="open-popup-button">
                    ADD NEW PRODUCT
                </button>

                {isPopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <button onClick={closePopup} className="close-popup-button">
                                X
                            </button>
                            <form onSubmit={handleAddProduct} className="product-form">
                                <label>Product</label>
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={newProduct.name}
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, name: e.target.value })
                                    }
                                    required
                                    className="product-input"
                                />
                                <label>Price (€)</label>
                                <input
                                    type="number"
                                    placeholder="Product Price"
                                    value={newProduct.price}
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, price: e.target.value })
                                    }
                                    required
                                    className="product-input"
                                />
                                <button type="submit" className="submit-button">
                                    Add Product
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="center-table">
                    <table className="products-table">
                        <thead>
                            <tr>
                                {/* <th>ID db</th> */}
                                {/* <th>ID row</th> */}
                                <th>Name</th>
                                <th>Price (&euro;)</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        {/* <td>{product.id}</td> */}
                                        {/* <td>{index + 1}</td> */}
                                        <td>{product.name}</td>
                                        <td>{product.price} &euro;</td>
                                        <td>
                                            <button
                                                onClick={() => handleEdit(product.id)}
                                                className="edit-button-custom"
                                            >
                                                🖊️
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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
                                        No products found.
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

export default Products;