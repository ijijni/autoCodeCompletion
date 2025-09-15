// C# .NET Core Web API代码片段

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using AutoMapper;

namespace UserApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserService userService, 
            IMapper mapper, 
            ILogger<UsersController> logger)
        {
            _userService = userService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            try
            {
                var result = await _userService.GetUsersAsync(page, pageSize, search);
                
                var userDtos = _mapper.Map<List<UserDto>>(result.Items);
                
                var pagedResult = new PagedResult<UserDto>
                {
                    Items = userDtos,
                    TotalCount = result.TotalCount,
                    Page = page,
                    PageSize = pageSize
                };

                // AI补全点：分页元数据处理
                

                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                // AI补全点：异常响应处理
                
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                var userDto = _mapper.Map<UserDto>(user);
                
                // AI补全点：用户数据增强
                

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", id);
                // AI补全点：获取用户异常处理
                
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // 检查邮箱是否已存在
                var existingUser = await _userService.GetUserByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return Conflict("Email already exists");
                }

                var user = _mapper.Map<User>(request);
                
                // AI补全点：用户创建前的处理
                

                var createdUser = await _userService.CreateUserAsync(user);
                var userDto = _mapper.Map<UserDto>(createdUser);

                // AI补全点：用户创建后的处理
                

                return CreatedAtAction(
                    nameof(GetUser), 
                    new { id = createdUser.Id }, 
                    userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                // AI补全点：创建用户异常处理
                
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(
            int id, 
            [FromBody] UpdateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                // 更新用户属性
                _mapper.Map(request, existingUser);
                
                // AI补全点：更新验证逻辑
                

                var updatedUser = await _userService.UpdateUserAsync(existingUser);
                var userDto = _mapper.Map<UserDto>(updatedUser);

                // AI补全点：更新后的处理
                

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                // AI补全点：更新异常处理
                
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                // AI补全点：删除前的检查
                

                await _userService.DeleteUserAsync(id);

                // AI补全点：删除后的清理
                

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                // AI补全点：删除异常处理
                
            }
        }
    }

    // 用户服务接口和实现
    public interface IUserService
    {
        Task<PagedResult<User>> GetUsersAsync(int page, int pageSize, string? search);
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task DeleteUserAsync(int id);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<UserService> _logger;

        public UserService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<UserService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<PagedResult<User>> GetUsersAsync(int page, int pageSize, string? search)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                // AI补全点：搜索条件实现
                
            }

            var totalCount = await query.CountAsync();
            
            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<User>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            // AI补全点：创建前的业务逻辑
            

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // AI补全点：创建后的处理
            

            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            // AI补全点：更新前的验证
            

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // AI补全点：更新后的处理
            

            return user;
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await GetUserByIdAsync(id);
            if (user != null)
            {
                // AI补全点：软删除或硬删除逻辑
                

                await _context.SaveChangesAsync();
            }
        }
    }

    // 数据模型
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public int? Age { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // AI补全点：导航属性
        
    }

    // DTO类
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int? Age { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // AI补全点：额外的DTO属性
        
    }

    // 请求类
    public class CreateUserRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Range(0, 150)]
        public int? Age { get; set; }
        
        // AI补全点：额外的创建字段
        
    }

    public class UpdateUserRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
        
        [Range(0, 150)]
        public int? Age { get; set; }
        
        // AI补全点：额外的更新字段
        
    }

    // 分页结果类
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
        
        // AI补全点：额外的分页属性
        
    }
}
