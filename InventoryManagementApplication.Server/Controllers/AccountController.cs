using InventoryManagementApplication.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace InventoryManagementApplication.Server.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        //Services
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;

        //Constructor for injecting services
        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration; 
        }

        //Register method
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Register model)
        {
            if (!ModelState.IsValid)
            {
                //Errors
                return BadRequest(ModelState);
            }
            try
            {
                //Create the new user
                var user = new User
                {
                    UserName = model.Username,
                    Email = model.Email,
                };

                //Try creating the user with the provided password
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    // Successfully created the user, return a success response
                    return Ok(new { Message = "User registered successfully" });
                }
                else
                {
                    //Log errors failed registration
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"Error: {error.Description}");
                    }
                    // Return all error messages in the BadRequest response
                    return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
                }
            }
            catch (Exception ex)
            {
                //Log any exception that might have occurred
                Console.WriteLine($"Exception during registration: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }


        //Login method
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            if (!await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return Unauthorized("Invalid username or password.");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
            };

            var secretKey = _configuration["JwtSettings:SecretKey"]; // Fetch secret key from config
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"], // Fetch issuer
                audience: _configuration["JwtSettings:Audience"], // Fetch audience
                claims: claims,
                expires: DateTime.Now.AddDays(Convert.ToInt32(_configuration["JwtSettings:ExpiresInDays"])), // Fetch expiry time
                signingCredentials: creds
            );

            return Ok(new { Token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}