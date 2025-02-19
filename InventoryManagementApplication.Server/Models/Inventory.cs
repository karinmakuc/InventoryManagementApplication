using System.ComponentModel.DataAnnotations;

namespace InventoryManagementApplication.Server.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        [Required]
        public int ProductId { get; set; }
        [Required] 
        public int WarehouseId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public Product? Product { get; set; }
        public Warehouse? Warehouse { get; set; }
    }
}