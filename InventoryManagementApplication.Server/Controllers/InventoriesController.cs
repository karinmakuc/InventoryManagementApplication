using InventoryManagementApplication.Server.Data;
using InventoryManagementApplication.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagementApplication.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        
        // GET: api/inventories -> get list inventory data with product and warehouse info
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Inventory>>> GetInventories()
        {
            // Ensure product and warehouse details are included
            var inventories = await _context.Inventories
                .Include(i => i.Product) 
                .Include(i => i.Warehouse)
                .Select(i => new {
                    i.Id,
                    i.ProductId,
                    i.Quantity,
                    ProductName = i.Product.Name,
                    ProductPrice = i.Product.Price,
                    WarehouseName = i.Warehouse.Name,
                    i.WarehouseId
                })
                .ToListAsync();

            return Ok(inventories);
        }


        // GET: api/inventories/{id} -> gets a specific inventory item by id -> includes product, warehouse info
        [HttpGet("{id}")]
        public async Task<ActionResult<Inventory>> GetInventory(int id)
        {
            var inventory = await _context.Inventories
                .Include(i => i.Product)
                .Include(i => i.Warehouse)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
            {
                return NotFound();
            }
            return inventory;
        }


        // POST: api/inventories -> add a new inventory to the db
        [HttpPost]
        public async Task<ActionResult<Inventory>> PostInventory([FromBody] Inventory inventory)
        {
            // Ensure Product and Warehouse exist before adding inventory
            var product = await _context.Products.FindAsync(inventory.ProductId);
            var warehouse = await _context.Warehouses.FindAsync(inventory.WarehouseId);

            if (product == null)
            {
                return BadRequest(new { errors = new { Product = new[] { "Invalid Product ID." } } });
            }

            if (warehouse == null)
            {
                return BadRequest(new { errors = new { Warehouse = new[] { "Invalid Warehouse ID." } } });
            }

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventory);
        }

        
        //check if inventory with id exists
        private bool InventoryExists(int id)
        {
            return _context.Inventories.Any(e => e.Id == id);
        }

        
        // PUT: api/inventories/{id} -> update/edit an existing inventory item 
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInventory(int id, Inventory inventory)
        {
            if (id != inventory.Id)
            {
                return BadRequest();
            }

            // Get the product and warehouse to include their details
            var product = await _context.Products.FindAsync(inventory.ProductId);
            var warehouse = await _context.Warehouses.FindAsync(inventory.WarehouseId);

            if (product == null || warehouse == null)
            {
                return NotFound();
            }

            // Update the inventory
            _context.Entry(inventory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // After successfully updating, return the updated inventory with product and warehouse names
            var updatedInventory = new
            {
                inventory.Id,
                inventory.ProductId,
                inventory.Quantity,
                ProductName = product.Name,
                ProductPrice = product.Price,
                WarehouseName = warehouse.Name,
                inventory.WarehouseId
            };

            return Ok(updatedInventory);
        }

        
        // DELETE: api/inventories/{id} -> delete a specific inventory item by id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventory(int id)
        {
            var inventory = await _context.Inventories.FindAsync(id);
            if (inventory == null)
            {
                return NotFound();
            }

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
