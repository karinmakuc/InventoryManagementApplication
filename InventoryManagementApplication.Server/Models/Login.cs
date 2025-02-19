using System.ComponentModel.DataAnnotations;

namespace InventoryManagementApplication.Server.Models
{
    public class Login
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}