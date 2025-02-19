using InventoryManagementApplication.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagementApplication.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly int _stockThreshold;

        public ReportsController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _stockThreshold = int.Parse(configuration["AppSettings:StockThreshold"]);  // Read threshold value from settings
        }

        //GET threshhold from settings
        [HttpGet("stock-threshold")]
        public IActionResult GetStockThreshold()
        {
            return Ok(_stockThreshold);  // Return the value directly
        }



        //GET a list of products that are not stored in any warehouse -> no data in inventory
        [HttpGet("products-not-in-warehouse")]
        public async Task<IActionResult> GetProductsNotInAnyWarehouse()
        {
            try
            {
                var productsNotInWarehouse = await _context.Products
                    .Where(product => !_context.Inventories.Any(inventory => inventory.ProductId == product.Id))
                    .ToListAsync();

                return Ok(productsNotInWarehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching products", details = ex.Message });
            }
        }

        //GET a list of products that have stock under [n] -> from settings
        [HttpGet("products-with-low-stock")]
        public async Task<IActionResult> GetProductsWithLowStock()
        {
            try
            {
                var productsWithLowStock = await _context.Inventories
                    .Where(inventory => inventory.Quantity < _stockThreshold)
                    .Select(inventory => new
                    {
                        ProductId = inventory.ProductId,
                        WarehouseId = inventory.WarehouseId,
                        Quantity = inventory.Quantity,
                        ProductName = inventory.Product.Name,
                        WarehouseName = inventory.Warehouse.Name
                    })
                    .ToListAsync();

                return Ok(productsWithLowStock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching low stock products", details = ex.Message });
            }
        }
    }
}