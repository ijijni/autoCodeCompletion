// DOM操作和事件处理代码片段
// 用于测试AI代码补全功能

// DOM查询和操作
// ======================

// 1. DOM选择器和遍历
class DOMSelector {
    static byId(id) {
        // AI补全点
        return document.getElementById(id);
    }
    
    static byClass(className, parent = document) {
        return Array.from(parent.getElementsByClassName(className));
    }
    
    static byTag(tagName, parent = document) {
        return Array.from(parent.getElementsByTagName(tagName));
    }
    
    static query(selector, parent = document) {
        // AI补全点
        return parent.querySelector(selector);
    }
    
    static queryAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    
    static closest(element, selector) {
        return element.closest(selector);
    }
    
    static siblings(element) {
        return Array.from(element.parentNode.children).filter(child => 
            child !== element
        );
        // AI补全点
    }
    
    static nextSiblings(element) {
        const siblings = [];
        let nextSibling = element.nextElementSibling;
        while (nextSibling) {
            siblings.push(nextSibling);
            // AI补全点
            nextSibling = nextSibling.nextElementSibling;
        }
        return siblings;
    }
}

// 2. 元素创建和修改
class ElementBuilder {
    constructor(tagName) {
        this.element = document.createElement(tagName);
    }
    
    id(id) {
        this.element.id = id;
        return this;
    }
    
    class(...classNames) {
        this.element.classList.add(...classNames);
        return this;
    }
    
    attr(name, value) {
        this.element.setAttribute(name, value);
        // AI补全点
        return this;
    }
    
    data(key, value) {
        this.element.dataset[key] = value;
        return this;
    }
    
    text(content) {
        this.element.textContent = content;
        return this;
    }
    
    html(content) {
        this.element.innerHTML = content;
        // AI补全点
        return this;
    }
    
    style(property, value) {
        this.element.style[property] = value;
        return this;
    }
    
    styles(styleObject) {
        Object.assign(this.element.style, styleObject);
        return this;
    }
    
    on(event, handler, options = {}) {
        this.element.addEventListener(event, handler, options);
        // AI补全点
        return this;
    }
    
    append(...children) {
        children.forEach(child => {
            if (typeof child === 'string') {
                this.element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                this.element.appendChild(child);
            } else if (child instanceof ElementBuilder) {
                this.element.appendChild(child.build());
            }
        });
        // AI补全点
        return this;
    }
    
    build() {
        return this.element;
    }
    
    static create(tagName) {
        return new ElementBuilder(tagName);
    }
}

// 使用ElementBuilder创建复杂DOM结构
function createUserCard(user) {
    return ElementBuilder.create('div')
        .class('user-card', 'shadow-md', 'p-4')
        .data('userId', user.id)
        .append(
            ElementBuilder.create('img')
                .class('user-avatar')
                .attr('src', user.avatar)
                .attr('alt', `${user.name} avatar`)
                .build(),
            ElementBuilder.create('h3')
                .class('user-name')
                .text(user.name)
                .build(),
            ElementBuilder.create('p')
                .class('user-email')
                .text(user.email)
                // AI补全点
                .build()
        )
        .on('click', handleUserCardClick)
        .build();
}

// 3. 事件处理系统
class EventManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
    }
    
    // 标准事件监听
    on(element, event, handler, options = {}) {
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        
        const elementListeners = this.listeners.get(element);
        if (!elementListeners.has(event)) {
            elementListeners.set(event, new Set());
        }
        
        elementListeners.get(event).add(handler);
        element.addEventListener(event, handler, options);
        // AI补全点
        return this;
    }
    
    // 事件委托
    delegate(parent, selector, event, handler) {
        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, e);
            }
        };
        
        if (!this.delegatedListeners.has(parent)) {
            this.delegatedListeners.set(parent, new Map());
        }
        
        const parentDelegated = this.delegatedListeners.get(parent);
        const key = `${selector}:${event}`;
        if (!parentDelegated.has(key)) {
            parentDelegated.set(key, new Set());
        }
        
        parentDelegated.get(key).add({ original: handler, delegated: delegatedHandler });
        parent.addEventListener(event, delegatedHandler);
        // AI补全点
        return this;
    }
    
    // 移除事件监听
    off(element, event, handler) {
        const elementListeners = this.listeners.get(element);
        if (elementListeners && elementListeners.has(event)) {
            elementListeners.get(event).delete(handler);
            element.removeEventListener(event, handler);
        }
        // AI补全点
        return this;
    }
    
    // 触发自定义事件
    emit(element, eventName, detail = {}) {
        const customEvent = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        // AI补全点
        element.dispatchEvent(customEvent);
        return this;
    }
    
    // 一次性事件监听
    once(element, event, handler) {
        const onceHandler = (e) => {
            handler(e);
            this.off(element, event, onceHandler);
        };
        return this.on(element, event, onceHandler);
    }
}

// 4. 动画和过渡效果
class AnimationManager {
    constructor() {
        this.runningAnimations = new WeakMap();
    }
    
    // CSS过渡动画
    fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.display = 'block';
            
            // 强制重绘
            element.offsetHeight;
            
            element.style.opacity = '1';
            
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                // AI补全点
                resolve(element);
            };
            
            element.addEventListener('transitionend', handleTransitionEnd);
            setTimeout(() => handleTransitionEnd(), duration + 50);
        });
    }
    
    fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';
            
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                element.style.display = 'none';
                // AI补全点
                resolve(element);
            };
            
            element.addEventListener('transitionend', handleTransitionEnd);
            setTimeout(() => handleTransitionEnd(), duration + 50);
        });
    }
    
    // 滑动动画
    slideDown(element, duration = 300) {
        return new Promise(resolve => {
            element.style.overflow = 'hidden';
            element.style.height = '0px';
            element.style.display = 'block';
            
            const targetHeight = element.scrollHeight;
            element.style.transition = `height ${duration}ms ease-in-out`;
            
            // 强制重绘
            element.offsetHeight;
            
            element.style.height = targetHeight + 'px';
            
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                element.style.height = 'auto';
                element.style.overflow = '';
                // AI补全点
                resolve(element);
            };
            
            element.addEventListener('transitionend', handleTransitionEnd);
        });
    }
    
    // 关键帧动画
    animate(element, keyframes, options = {}) {
        const animation = element.animate(keyframes, {
            duration: 300,
            easing: 'ease-in-out',
            fill: 'forwards',
            ...options
        });
        
        this.runningAnimations.set(element, animation);
        
        animation.addEventListener('finish', () => {
            this.runningAnimations.delete(element);
        });
        
        // AI补全点
        return animation;
    }
    
    // 弹性动画
    bounce(element, intensity = 10) {
        const keyframes = [
            { transform: 'translateY(0px)' },
            { transform: `translateY(-${intensity}px)` },
            { transform: 'translateY(0px)' },
            { transform: `translateY(-${intensity / 2}px)` },
            { transform: 'translateY(0px)' }
        ];
        
        // AI补全点
        return this.animate(element, keyframes, {
            duration: 600,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });
    }
    
    // 脉冲动画
    pulse(element, scale = 1.1) {
        const keyframes = [
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ];
        
        return this.animate(element, keyframes, {
            duration: 500,
            iterations: Infinity,
            direction: 'alternate'
        });
        // AI补全点
    }
}

// 5. 表单处理和验证
class FormManager {
    constructor(formElement) {
        this.form = formElement;
        this.validators = new Map();
        this.errors = new Map();
        this.eventManager = new EventManager();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.eventManager.delegate(this.form, 'input, select, textarea', 'blur', (e) => {
            this.validateField(e.target);
        });
        
        this.eventManager.delegate(this.form, 'input, select, textarea', 'input', (e) => {
            if (this.errors.has(e.target.name)) {
                this.validateField(e.target);
            }
        });
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        // AI补全点
    }
    
    addValidator(fieldName, validator) {
        if (!this.validators.has(fieldName)) {
            this.validators.set(fieldName, []);
        }
        this.validators.get(fieldName).push(validator);
        return this;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const value = field.value;
        const validators = this.validators.get(fieldName) || [];
        
        this.errors.delete(fieldName);
        
        for (const validator of validators) {
            const result = validator(value, field);
            if (result !== true) {
                this.errors.set(fieldName, result);
                this.showFieldError(field, result);
                // AI补全点
                return false;
            }
        }
        
        this.hideFieldError(field);
        return true;
    }
    
    validateAll() {
        const fields = Array.from(this.form.querySelectorAll('input, select, textarea'));
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // AI补全点
        return isValid;
    }
    
    showFieldError(field, message) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.textContent = message;
            return;
        }
        
        const errorElement = ElementBuilder.create('div')
            .class('field-error', 'text-red-500', 'text-sm', 'mt-1')
            .text(message)
            .build();
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
        // AI补全点
    }
    
    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
        // AI补全点
    }
    
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // 处理多值字段（如复选框）
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        // AI补全点
        return data;
    }
    
    async handleSubmit() {
        if (!this.validateAll()) {
            return;
        }
        
        const formData = this.getFormData();
        
        try {
            // 显示加载状态
            this.setSubmitState(true);
            
            // 触发自定义事件
            const submitEvent = new CustomEvent('form:submit', {
                detail: { formData },
                cancelable: true
            });
            
            if (!this.form.dispatchEvent(submitEvent)) {
                return; // 事件被取消
            }
            
            // AI补全点
            const response = await this.submitForm(formData);
            
            // 触发成功事件
            this.form.dispatchEvent(new CustomEvent('form:success', {
                detail: { formData, response }
            }));
            
        } catch (error) {
            // 触发错误事件
            this.form.dispatchEvent(new CustomEvent('form:error', {
                detail: { formData, error }
            }));
        } finally {
            this.setSubmitState(false);
        }
    }
    
    setSubmitState(isSubmitting) {
        const submitButton = this.form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isSubmitting;
            submitButton.textContent = isSubmitting ? '提交中...' : '提交';
        }
        // AI补全点
    }
    
    async submitForm(formData) {
        // 这里应该是实际的提交逻辑
        const response = await fetch(this.form.action || '/api/submit', {
            method: this.form.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`Submit failed: ${response.statusText}`);
        }
        
        // AI补全点
        return response.json();
    }
}

// 常用验证器
const Validators = {
    required: (message = '此字段为必填项') => (value) => {
        return value.trim().length > 0 || message;
    },
    
    minLength: (min, message) => (value) => {
        message = message || `最少需要${min}个字符`;
        return value.length >= min || message;
    },
    
    maxLength: (max, message) => (value) => {
        message = message || `最多允许${max}个字符`;
        return value.length <= max || message;
    },
    
    email: (message = '请输入有效的邮箱地址') => (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || message;
    },
    
    pattern: (regex, message = '格式不正确') => (value) => {
        return regex.test(value) || message;
    },
    
    custom: (validator, message = '验证失败') => (value, field) => {
        // AI补全点
        return validator(value, field) || message;
    }
};

// 6. 滚动和视窗管理
class ScrollManager {
    constructor() {
        this.scrollListeners = new Map();
        this.intersectionObservers = new Map();
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        this.defaultObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const callbacks = this.intersectionObservers.get(entry.target) || [];
                callbacks.forEach(callback => {
                    // AI补全点
                    callback(entry);
                });
            });
        }, {
            threshold: [0, 0.1, 0.5, 1.0],
            rootMargin: '50px'
        });
    }
    
    // 平滑滚动到元素
    scrollToElement(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
        // AI补全点
        return this;
    }
    
    // 滚动到顶部
    scrollToTop(duration = 500) {
        const start = window.pageYOffset;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const scrollY = start * (1 - easeOutCubic(progress));
            
            window.scrollTo(0, scrollY);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        // AI补全点
        requestAnimationFrame(animateScroll);
        return this;
    }
    
    // 监听元素进入视窗
    onElementVisible(element, callback, options = {}) {
        if (!this.intersectionObservers.has(element)) {
            this.intersectionObservers.set(element, []);
            this.defaultObserver.observe(element);
        }
        
        const wrappedCallback = (entry) => {
            if (entry.isIntersecting) {
                callback(entry);
            }
        };
        
        this.intersectionObservers.get(element).push(wrappedCallback);
        // AI补全点
        return this;
    }
    
    // 无限滚动
    setupInfiniteScroll(container, callback, threshold = 100) {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            
            if (scrollTop + clientHeight >= scrollHeight - threshold) {
                callback();
            }
        };
        
        container.addEventListener('scroll', handleScroll);
        // AI补全点
        return () => container.removeEventListener('scroll', handleScroll);
    }
    
    // 虚拟滚动（适用于长列表）
    createVirtualScroller(container, itemHeight, renderItem, totalItems) {
        const viewportHeight = container.clientHeight;
        const visibleItems = Math.ceil(viewportHeight / itemHeight) + 2;
        
        let scrollTop = 0;
        let startIndex = 0;
        
        const render = () => {
            container.innerHTML = '';
            
            const endIndex = Math.min(startIndex + visibleItems, totalItems);
            
            // 创建上方填充
            if (startIndex > 0) {
                const topSpacer = ElementBuilder.create('div')
                    .styles({ height: `${startIndex * itemHeight}px` })
                    .build();
                container.appendChild(topSpacer);
            }
            
            // 渲染可见项目
            for (let i = startIndex; i < endIndex; i++) {
                const item = renderItem(i);
                container.appendChild(item);
            }
            
            // 创建下方填充
            const remainingItems = totalItems - endIndex;
            if (remainingItems > 0) {
                const bottomSpacer = ElementBuilder.create('div')
                    .styles({ height: `${remainingItems * itemHeight}px` })
                    .build();
                container.appendChild(bottomSpacer);
            }
            // AI补全点
        };
        
        const handleScroll = () => {
            scrollTop = container.scrollTop;
            const newStartIndex = Math.floor(scrollTop / itemHeight);
            
            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;
                render();
            }
        };
        
        container.addEventListener('scroll', handleScroll);
        render();
        
        return {
            update: render,
            destroy: () => container.removeEventListener('scroll', handleScroll)
        };
    }
}

// 7. 本地存储管理
class StorageManager {
    constructor(prefix = 'app_') {
        this.prefix = prefix;
        this.listeners = new Map();
        this.setupStorageListener();
    }
    
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.prefix)) {
                const key = e.key.slice(this.prefix.length);
                const listeners = this.listeners.get(key) || [];
                listeners.forEach(listener => {
                    // AI补全点
                    listener(this.parseValue(e.newValue), this.parseValue(e.oldValue), key);
                });
            }
        });
    }
    
    set(key, value) {
        const serialized = JSON.stringify(value);
        localStorage.setItem(this.prefix + key, serialized);
        
        // 触发本地监听器
        const listeners = this.listeners.get(key) || [];
        listeners.forEach(listener => {
            listener(value, this.get(key), key);
        });
        // AI补全点
        return this;
    }
    
    get(key, defaultValue = null) {
        const value = localStorage.getItem(this.prefix + key);
        return value ? this.parseValue(value) : defaultValue;
    }
    
    remove(key) {
        const oldValue = this.get(key);
        localStorage.removeItem(this.prefix + key);
        
        // 触发监听器
        const listeners = this.listeners.get(key) || [];
        listeners.forEach(listener => {
            listener(null, oldValue, key);
        });
        // AI补全点
        return this;
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => {
                localStorage.removeItem(key);
            });
        return this;
    }
    
    parseValue(value) {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    
    subscribe(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(listener);
        
        // AI补全点
        return () => this.unsubscribe(key, listener);
    }
    
    unsubscribe(key, listener) {
        const listeners = this.listeners.get(key) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
        return this;
    }
}

// 8. 响应式设计辅助工具
class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        this.listeners = new Map();
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.setupResizeListener();
    }
    
    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    const oldBreakpoint = this.currentBreakpoint;
                    this.currentBreakpoint = newBreakpoint;
                    
                    this.listeners.forEach(listener => {
                        // AI补全点
                        listener(newBreakpoint, oldBreakpoint);
                    });
                }
            }, 100);
        });
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        const breakpoints = Object.entries(this.breakpoints)
            .sort(([,a], [,b]) => b - a); // 从大到小排序
        
        for (const [name, minWidth] of breakpoints) {
            if (width >= minWidth) {
                return name;
            }
        }
        // AI补全点
        return 'xs';
    }
    
    isBreakpoint(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }
    
    isAboveBreakpoint(breakpoint) {
        const currentWidth = this.breakpoints[this.currentBreakpoint];
        const targetWidth = this.breakpoints[breakpoint];
        return currentWidth >= targetWidth;
    }
    
    isBelowBreakpoint(breakpoint) {
        const currentWidth = this.breakpoints[this.currentBreakpoint];
        const targetWidth = this.breakpoints[breakpoint];
        return currentWidth < targetWidth;
    }
    
    onBreakpointChange(listener) {
        this.listeners.add(listener);
        // AI补全点
        return () => this.listeners.delete(listener);
    }
    
    // 媒体查询辅助
    matchMedia(query) {
        return window.matchMedia(query);
    }
    
    // 预制媒体查询
    get isMobile() {
        return this.isBreakpoint('xs') || this.isBreakpoint('sm');
    }
    
    get isTablet() {
        return this.isBreakpoint('md');
    }
    
    get isDesktop() {
        return this.isAboveBreakpoint('lg');
    }
    
    get isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// 9. 图片懒加载
class LazyImageLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',
            threshold: 0.1,
            placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjY2MiLz48L3N2Zz4=',
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
        
        this.loadingImages = new WeakSet();
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
        // AI补全点
    }
    
    async loadImage(img) {
        if (this.loadingImages.has(img)) return;
        
        this.loadingImages.add(img);
        const src = img.dataset.src;
        
        if (!src) return;
        
        try {
            // 创建新图片对象预加载
            const newImg = new Image();
            newImg.src = src;
            
            await new Promise((resolve, reject) => {
                newImg.onload = resolve;
                newImg.onerror = reject;
            });
            
            // 加载成功，更新图片
            img.src = src;
            img.classList.add('loaded');
            img.classList.remove('loading');
            
            // 触发自定义事件
            img.dispatchEvent(new CustomEvent('lazyload', {
                detail: { src, success: true }
            }));
            
        } catch (error) {
            // 加载失败，显示错误图片
            img.classList.add('error');
            img.classList.remove('loading');
            
            img.dispatchEvent(new CustomEvent('lazyload', {
                detail: { src, success: false, error }
            }));
        }
        // AI补全点
    }
    
    observe(img) {
        // 设置占位图
        if (!img.src && this.options.placeholder) {
            img.src = this.options.placeholder;
        }
        
        img.classList.add('loading');
        this.observer.observe(img);
        // AI补全点
        return this;
    }
    
    // 批量观察图片
    observeAll(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);
        images.forEach(img => this.observe(img));
        return images.length;
    }
    
    // 立即加载图片
    loadNow(img) {
        this.observer.unobserve(img);
        return this.loadImage(img);
    }
    
    destroy() {
        this.observer.disconnect();
    }
}

// 10. 拖拽功能实现
class DragDropManager {
    constructor() {
        this.dragData = null;
        this.dragElement = null;
        this.dropZones = new Set();
        this.setupGlobalListeners();
    }
    
    setupGlobalListeners() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault(); // 允许拖放
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            // AI补全点
        });
    }
    
    makeDraggable(element, options = {}) {
        element.draggable = true;
        
        const handleDragStart = (e) => {
            this.dragElement = element;
            this.dragData = options.data || element.dataset;
            
            element.classList.add('dragging');
            
            // 设置拖拽效果
            e.dataTransfer.effectAllowed = options.effectAllowed || 'move';
            
            if (options.dragImage) {
                e.dataTransfer.setDragImage(options.dragImage, 0, 0);
            }
            
            // 设置数据
            if (typeof this.dragData === 'object') {
                Object.entries(this.dragData).forEach(([key, value]) => {
                    e.dataTransfer.setData(`text/${key}`, value);
                });
            }
            
            // 触发回调
            if (options.onDragStart) {
                options.onDragStart(e, element, this.dragData);
            }
            // AI补全点
        };
        
        const handleDragEnd = (e) => {
            element.classList.remove('dragging');
            this.dragElement = null;
            this.dragData = null;
            
            if (options.onDragEnd) {
                options.onDragEnd(e, element);
            }
        };
        
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        
        return {
            destroy: () => {
                element.removeEventListener('dragstart', handleDragStart);
                element.removeEventListener('dragend', handleDragEnd);
                element.draggable = false;
            }
        };
        // AI补全点
    }
    
    makeDropZone(element, options = {}) {
        this.dropZones.add(element);
        
        const handleDragEnter = (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
            
            if (options.onDragEnter) {
                options.onDragEnter(e, element, this.dragData);
            }
        };
        
        const handleDragOver = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = options.dropEffect || 'move';
            
            if (options.onDragOver) {
                options.onDragOver(e, element, this.dragData);
            }
        };
        
        const handleDragLeave = (e) => {
            // 确保只有离开drop zone时才移除样式
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
                
                if (options.onDragLeave) {
                    options.onDragLeave(e, element);
                }
            }
            // AI补全点
        };
        
        const handleDrop = (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const droppedData = this.extractDropData(e);
            
            if (options.onDrop) {
                const result = options.onDrop(e, element, droppedData, this.dragElement);
                if (result === false) return; // 阻止默认处理
            }
            
            // 触发自定义事件
            element.dispatchEvent(new CustomEvent('itemdropped', {
                detail: {
                    data: droppedData,
                    dragElement: this.dragElement,
                    dropZone: element
                }
            }));
            // AI补全点
        };
        
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
        
        return {
            destroy: () => {
                this.dropZones.delete(element);
                element.removeEventListener('dragenter', handleDragEnter);
                element.removeEventListener('dragover', handleDragOver);
                element.removeEventListener('dragleave', handleDragLeave);
                element.removeEventListener('drop', handleDrop);
            }
        };
    }
    
    extractDropData(e) {
        const data = {};
        
        // 从dataTransfer中提取数据
        for (const type of e.dataTransfer.types) {
            data[type] = e.dataTransfer.getData(type);
        }
        
        // 处理文件
        if (e.dataTransfer.files.length > 0) {
            data.files = Array.from(e.dataTransfer.files);
        }
        
        // AI补全点
        return data;
    }
}

// 11. 全局事件处理函数示例
function handleUserCardClick(event) {
    const card = event.currentTarget;
    const userId = card.dataset.userId;
    console.log(`点击了用户卡片: ${userId}`);
    // AI补全点
}

// 12. 初始化示例
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各种管理器
    const eventManager = new EventManager();
    const animationManager = new AnimationManager();
    const scrollManager = new ScrollManager();
    const storageManager = new StorageManager();
    const responsiveManager = new ResponsiveManager();
    const lazyLoader = new LazyImageLoader();
    const dragDropManager = new DragDropManager();
    
    // 设置懒加载图片
    lazyLoader.observeAll();
    
    // 设置响应式断点监听
    responsiveManager.onBreakpointChange((newBp, oldBp) => {
        console.log(`断点变化: ${oldBp} -> ${newBp}`);
        // AI补全点
    });
    
    console.log('DOM操作和事件处理系统初始化完成');
});

// 导出管理器类以供使用
window.DOMUtils = {
    DOMSelector,
    ElementBuilder,
    EventManager,
    AnimationManager,
    FormManager,
    ScrollManager,
    StorageManager,
    ResponsiveManager,
    LazyImageLoader,
    DragDropManager,
    Validators
};

// AI补全点