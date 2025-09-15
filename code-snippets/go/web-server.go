// Go Web服务器代码片段

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
)

// User 用户模型
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Age       *int      `json:"age"`
	Active    bool      `json:"active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserRequest 用户请求结构
type UserRequest struct {
	Name  string `json:"name" validate:"required"`
	Email string `json:"email" validate:"required,email"`
	Age   *int   `json:"age" validate:"omitempty,min=0,max=150"`
}

// UserResponse 用户响应结构
type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Age       *int      `json:"age"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
}

// PagedResponse 分页响应
type PagedResponse struct {
	Data       interface{} `json:"data"`
	TotalCount int64       `json:"total_count"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// UserService 用户服务
type UserService struct {
	db *gorm.DB
}

// NewUserService 创建用户服务
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// GetUsers 获取用户列表
func (s *UserService) GetUsers(ctx context.Context, page, pageSize int, search string) (*PagedResponse, error) {
	var users []User
	var totalCount int64

	query := s.db.WithContext(ctx).Model(&User{})

	if search != "" {
		// AI补全点：搜索条件实现
		
	}

	// 获取总数
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// 转换为响应格式
	userResponses := make([]UserResponse, len(users))
	for i, user := range users {
		// AI补全点：用户数据转换
		
	}

	totalPages := int((totalCount + int64(pageSize) - 1) / int64(pageSize))

	return &PagedResponse{
		Data:       userResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(ctx context.Context, id uint) (*User, error) {
	var user User
	if err := s.db.WithContext(ctx).First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// AI补全点：用户数据后处理
	

	return &user, nil
}

// CreateUser 创建用户
func (s *UserService) CreateUser(ctx context.Context, req *UserRequest) (*User, error) {
	// 检查邮箱是否已存在
	var existingUser User
	if err := s.db.WithContext(ctx).Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("email already exists")
	}

	user := &User{
		Name:  req.Name,
		Email: req.Email,
		Age:   req.Age,
	}

	// AI补全点：创建前的验证和处理
	

	if err := s.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// AI补全点：创建后的处理
	

	return user, nil
}

// UpdateUser 更新用户
func (s *UserService) UpdateUser(ctx context.Context, id uint, req *UserRequest) (*User, error) {
	var user User
	if err := s.db.WithContext(ctx).First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// 更新字段
	user.Name = req.Name
	user.Email = req.Email
	user.Age = req.Age

	// AI补全点：更新前的验证
	

	if err := s.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// AI补全点：更新后的处理
	

	return &user, nil
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(ctx context.Context, id uint) error {
	result := s.db.WithContext(ctx).Delete(&User{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete user: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	// AI补全点：删除后的清理工作
	

	return nil
}

// UserHandler 用户处理器
type UserHandler struct {
	userService *UserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(userService *UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetUsers 获取用户列表处理器
func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	// 解析查询参数
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")
	search := r.URL.Query().Get("search")

	page := 1
	pageSize := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// AI补全点：参数验证
	

	ctx := r.Context()
	result, err := h.userService.GetUsers(ctx, page, pageSize, search)
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, "Failed to get users", err.Error())
		return
	}

	h.sendJSONResponse(w, http.StatusOK, result)
}

// GetUser 获取单个用户处理器
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	ctx := r.Context()
	user, err := h.userService.GetUserByID(ctx, uint(id))
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user", err.Error())
		return
	}

	if user == nil {
		h.sendErrorResponse(w, http.StatusNotFound, "User not found", "")
		return
	}

	// AI补全点：用户响应数据处理
	

	h.sendJSONResponse(w, http.StatusOK, user)
}

// CreateUser 创建用户处理器
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// AI补全点：请求验证
	

	ctx := r.Context()
	user, err := h.userService.CreateUser(ctx, &req)
	if err != nil {
		if err.Error() == "email already exists" {
			h.sendErrorResponse(w, http.StatusConflict, "Email already exists", "")
			return
		}
		h.sendErrorResponse(w, http.StatusInternalServerError, "Failed to create user", err.Error())
		return
	}

	h.sendJSONResponse(w, http.StatusCreated, user)
}

// UpdateUser 更新用户处理器
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// AI补全点：更新请求验证
	

	ctx := r.Context()
	user, err := h.userService.UpdateUser(ctx, uint(id), &req)
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, "Failed to update user", err.Error())
		return
	}

	if user == nil {
		h.sendErrorResponse(w, http.StatusNotFound, "User not found", "")
		return
	}

	h.sendJSONResponse(w, http.StatusOK, user)
}

// DeleteUser 删除用户处理器
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	ctx := r.Context()
	if err := h.userService.DeleteUser(ctx, uint(id)); err != nil {
		if err.Error() == "user not found" {
			h.sendErrorResponse(w, http.StatusNotFound, "User not found", "")
			return
		}
		h.sendErrorResponse(w, http.StatusInternalServerError, "Failed to delete user", err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// 辅助方法
func (h *UserHandler) sendJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func (h *UserHandler) sendErrorResponse(w http.ResponseWriter, statusCode int, message, details string) {
	errorResp := ErrorResponse{
		Error:   message,
		Message: details,
		Code:    statusCode,
	}
	h.sendJSONResponse(w, statusCode, errorResp)
}

// 主函数
func main() {
	// 数据库连接
	dsn := "host=localhost user=postgres password=password dbname=userdb port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 自动迁移
	if err := db.AutoMigrate(&User{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 创建服务和处理器
	userService := NewUserService(db)
	userHandler := NewUserHandler(userService)

	// 设置路由
	r := mux.NewRouter()
	api := r.PathPrefix("/api").Subrouter()

	// 用户路由
	api.HandleFunc("/users", userHandler.GetUsers).Methods("GET")
	api.HandleFunc("/users", userHandler.CreateUser).Methods("POST")
	api.HandleFunc("/users/{id}", userHandler.GetUser).Methods("GET")
	api.HandleFunc("/users/{id}", userHandler.UpdateUser).Methods("PUT")
	api.HandleFunc("/users/{id}", userHandler.DeleteUser).Methods("DELETE")

	// AI补全点：中间件设置
	

	// 启动服务器
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	
	// AI补全点：服务器配置和启动
	
}
