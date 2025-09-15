/**
 * Kotlin Android开发模式示例
 */

// 模拟Android框架类
interface Context
interface View
interface ViewGroup
interface Bundle
interface Intent

// 数据类和模型
data class User(
    val id: Long,
    val name: String,
    val email: String,
    val avatarUrl: String? = null,
    val isActive: Boolean = true
)

data class Post(
    val id: Long,
    val title: String,
    val content: String,
    val authorId: Long,
    val createdAt: Long = System.currentTimeMillis(),
    val likes: Int = 0
)

// Repository模式
interface UserRepository {
    suspend fun getUser(id: Long): User?
    suspend fun getAllUsers(): List<User>
    suspend fun createUser(user: User): User
    suspend fun updateUser(user: User): User
    suspend fun deleteUser(id: Long): Boolean
}

class UserRepositoryImpl : UserRepository {
    private val users = mutableMapOf<Long, User>()
    private var nextId = 1L
    
    override suspend fun getUser(id: Long): User? {
        // 模拟网络延迟
        kotlinx.coroutines.delay(100)
        return users[id]
    }
    
    override suspend fun getAllUsers(): List<User> {
        kotlinx.coroutines.delay(200)
        return users.values.toList()
    }
    
    override suspend fun createUser(user: User): User {
        kotlinx.coroutines.delay(150)
        val newUser = user.copy(id = nextId++)
        users[newUser.id] = newUser
        return newUser
    }
    
    override suspend fun updateUser(user: User): User {
        kotlinx.coroutines.delay(100)
        users[user.id] = user
        return user
    }
    
    override suspend fun deleteUser(id: Long): Boolean {
        kotlinx.coroutines.delay(100)
        return users.remove(id) != null
    }
}

// UseCase模式
class GetUserUseCase(private val repository: UserRepository) {
    suspend operator fun invoke(userId: Long): Result<User> {
        return try {
            val user = repository.getUser(userId)
            if (user != null) {
                Result.success(user)
            } else {
                Result.failure(Exception("用户不存在"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class GetAllUsersUseCase(private val repository: UserRepository) {
    suspend operator fun invoke(): Result<List<User>> {
        return try {
            val users = repository.getAllUsers()
            Result.success(users)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class CreateUserUseCase(private val repository: UserRepository) {
    suspend operator fun invoke(name: String, email: String): Result<User> {
        return try {
            if (name.isBlank() || email.isBlank()) {
                return Result.failure(Exception("姓名和邮箱不能为空"))
            }
            
            val user = User(0, name, email)
            val createdUser = repository.createUser(user)
            Result.success(createdUser)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// ViewModel模式
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val exception: Throwable) : UiState<Nothing>()
}

class UserListViewModel(
    private val getAllUsersUseCase: GetAllUsersUseCase,
    private val createUserUseCase: CreateUserUseCase
) {
    private val _uiState = kotlinx.coroutines.flow.MutableStateFlow<UiState<List<User>>>(UiState.Loading)
    val uiState: kotlinx.coroutines.flow.StateFlow<UiState<List<User>>> = _uiState.asStateFlow()
    
    private val _events = kotlinx.coroutines.flow.MutableSharedFlow<UserListEvent>()
    val events: kotlinx.coroutines.flow.SharedFlow<UserListEvent> = _events.asSharedFlow()
    
    fun loadUsers() {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            _uiState.value = UiState.Loading
            
            getAllUsersUseCase().fold(
                onSuccess = { users ->
                    _uiState.value = UiState.Success(users)
                },
                onFailure = { exception ->
                    _uiState.value = UiState.Error(exception)
                    _events.emit(UserListEvent.ShowError("加载用户失败: ${exception.message}"))
                }
            )
        }
    }
    
    fun createUser(name: String, email: String) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            createUserUseCase(name, email).fold(
                onSuccess = { user ->
                    _events.emit(UserListEvent.UserCreated(user))
                    loadUsers() // 重新加载列表
                },
                onFailure = { exception ->
                    _events.emit(UserListEvent.ShowError("创建用户失败: ${exception.message}"))
                }
            )
        }
    }
}

sealed class UserListEvent {
    data class UserCreated(val user: User) : UserListEvent()
    data class ShowError(val message: String) : UserListEvent()
}

// Adapter模式
abstract class BaseAdapter<T, VH : BaseViewHolder<T>> {
    protected val items = mutableListOf<T>()
    
    abstract fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH
    abstract fun onBindViewHolder(holder: VH, position: Int)
    
    fun getItemCount(): Int = items.size
    
    fun submitList(newItems: List<T>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
    
    fun getItem(position: Int): T = items[position]
    
    private fun notifyDataSetChanged() {
        println("适配器数据已更新，共 ${items.size} 项")
    }
}

abstract class BaseViewHolder<T>(itemView: View) {
    abstract fun bind(item: T)
}

class UserAdapter : BaseAdapter<User, UserViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        // 在真实Android中，这里会inflate布局
        return UserViewHolder(MockView())
    }
    
    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

class UserViewHolder(itemView: View) : BaseViewHolder<User>(itemView) {
    override fun bind(item: User) {
        println("绑定用户视图: ${item.name} (${item.email})")
        // 在真实Android中，这里会设置TextView、ImageView等
    }
}

// 模拟View类
class MockView : View

// Fragment模式
abstract class BaseFragment {
    abstract fun onCreate(savedInstanceState: Bundle?)
    abstract fun onCreateView(): View?
    abstract fun onViewCreated(view: View, savedInstanceState: Bundle?)
    abstract fun onDestroy()
    
    protected fun requireContext(): Context = MockContext()
}

class UserListFragment : BaseFragment() {
    private lateinit var viewModel: UserListViewModel
    private lateinit var adapter: UserAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        println("UserListFragment onCreate")
        
        // 初始化依赖
        val repository = UserRepositoryImpl()
        val getAllUsersUseCase = GetAllUsersUseCase(repository)
        val createUserUseCase = CreateUserUseCase(repository)
        viewModel = UserListViewModel(getAllUsersUseCase, createUserUseCase)
        
        adapter = UserAdapter()
    }
    
    override fun onCreateView(): View? {
        println("UserListFragment onCreateView")
        return MockView()
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        println("UserListFragment onViewCreated")
        
        // 观察ViewModel状态
        observeViewModel()
        
        // 加载数据
        viewModel.loadUsers()
    }
    
    override fun onDestroy() {
        println("UserListFragment onDestroy")
    }
    
    private fun observeViewModel() {
        // 在真实Android中，这里会使用lifecycleScope
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main).launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is UiState.Loading -> {
                        println("显示加载状态")
                    }
                    is UiState.Success -> {
                        println("显示用户列表: ${state.data.size} 个用户")
                        adapter.submitList(state.data)
                    }
                    is UiState.Error -> {
                        println("显示错误: ${state.exception.message}")
                    }
                }
            }
        }
        
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main).launch {
            viewModel.events.collect { event ->
                when (event) {
                    is UserListEvent.UserCreated -> {
                        println("用户创建成功: ${event.user.name}")
                    }
                    is UserListEvent.ShowError -> {
                        println("显示错误消息: ${event.message}")
                    }
                }
            }
        }
    }
    
    fun createUser(name: String, email: String) {
        viewModel.createUser(name, email)
    }
}

// 模拟Context类
class MockContext : Context

// 依赖注入模式
interface DependencyContainer {
    fun <T> get(clazz: Class<T>): T
    fun <T> register(clazz: Class<T>, instance: T)
}

class SimpleDependencyContainer : DependencyContainer {
    private val dependencies = mutableMapOf<Class<*>, Any>()
    
    @Suppress("UNCHECKED_CAST")
    override fun <T> get(clazz: Class<T>): T {
        return dependencies[clazz] as? T 
            ?: throw IllegalArgumentException("依赖 ${clazz.simpleName} 未注册")
    }
    
    override fun <T> register(clazz: Class<T>, instance: T) {
        dependencies[clazz] = instance as Any
    }
}

// 扩展函数用于简化依赖注入
inline fun <reified T> DependencyContainer.get(): T = get(T::class.java)
inline fun <reified T> DependencyContainer.register(instance: T) = register(T::class.java, instance)

// 应用程序类
class Application {
    val container = SimpleDependencyContainer()
    
    fun onCreate() {
        println("应用程序启动")
        setupDependencies()
    }
    
    private fun setupDependencies() {
        // 注册依赖
        container.register<UserRepository>(UserRepositoryImpl())
        container.register(GetAllUsersUseCase(container.get()))
        container.register(CreateUserUseCase(container.get()))
    }
}

// 工具类和扩展函数
object ViewUtils {
    fun View.visible() {
        println("设置视图可见")
    }
    
    fun View.gone() {
        println("设置视图隐藏")
    }
    
    fun View.onClick(action: () -> Unit) {
        println("设置点击监听器")
        // 模拟点击
        action()
    }
}

// 数据绑定模式
class UserItemBinding {
    var user: User? = null
        set(value) {
            field = value
            value?.let { bindUser(it) }
        }
    
    private fun bindUser(user: User) {
        println("数据绑定: 显示用户 ${user.name}")
        // 在真实Android中，这里会更新UI元素
    }
}

// 导航模式
sealed class Screen {
    object UserList : Screen()
    data class UserDetail(val userId: Long) : Screen()
    object CreateUser : Screen()
}

class Navigator {
    private val backStack = mutableListOf<Screen>()
    
    fun navigateTo(screen: Screen) {
        backStack.add(screen)
        println("导航到: ${screen::class.simpleName}")
    }
    
    fun navigateBack(): Boolean {
        return if (backStack.size > 1) {
            backStack.removeLastOrNull()
            val currentScreen = backStack.lastOrNull()
            println("返回到: ${currentScreen?.let { it::class.simpleName } ?: "无"}")
            true
        } else {
            false
        }
    }
    
    fun getCurrentScreen(): Screen? = backStack.lastOrNull()
}

// 权限处理模式
enum class Permission {
    CAMERA,
    LOCATION,
    STORAGE
}

class PermissionManager {
    private val grantedPermissions = mutableSetOf<Permission>()
    
    fun requestPermission(permission: Permission, callback: (Boolean) -> Unit) {
        println("请求权限: ${permission.name}")
        
        // 模拟用户授权
        val granted = kotlin.random.Random.nextBoolean()
        if (granted) {
            grantedPermissions.add(permission)
        }
        
        println("权限 ${permission.name} ${if (granted) "已授权" else "被拒绝"}")
        callback(granted)
    }
    
    fun hasPermission(permission: Permission): Boolean {
        return grantedPermissions.contains(permission)
    }
}

// 主函数演示
suspend fun main() {
    println("=== Kotlin Android开发模式示例 ===")
    
    // 1. 应用程序启动
    val app = Application()
    app.onCreate()
    
    // 2. Fragment生命周期
    println("\n=== Fragment生命周期 ===")
    val fragment = UserListFragment()
    fragment.onCreate(null)
    fragment.onCreateView()
    fragment.onViewCreated(MockView(), null)
    
    // 等待异步操作完成
    kotlinx.coroutines.delay(500)
    
    // 3. 创建用户
    println("\n=== 创建用户 ===")
    fragment.createUser("张三", "zhangsan@example.com")
    fragment.createUser("李四", "lisi@example.com")
    
    kotlinx.coroutines.delay(500)
    
    // 4. 导航示例
    println("\n=== 导航示例 ===")
    val navigator = Navigator()
    navigator.navigateTo(Screen.UserList)
    navigator.navigateTo(Screen.UserDetail(1))
    navigator.navigateTo(Screen.CreateUser)
    navigator.navigateBack()
    navigator.navigateBack()
    
    // 5. 权限管理
    println("\n=== 权限管理 ===")
    val permissionManager = PermissionManager()
    permissionManager.requestPermission(Permission.CAMERA) { granted ->
        if (granted) {
            println("可以使用相机功能")
        } else {
            println("无法使用相机功能")
        }
    }
    
    // 6. 数据绑定
    println("\n=== 数据绑定 ===")
    val binding = UserItemBinding()
    binding.user = User(1, "王五", "wangwu@example.com")
    
    // 7. 视图工具
    println("\n=== 视图工具 ===")
    val view = MockView()
    with(ViewUtils) {
        view.visible()
        view.onClick {
            println("视图被点击")
        }
    }
    
    fragment.onDestroy()
    
    println("\n所有Android开发模式示例完成!")
}
