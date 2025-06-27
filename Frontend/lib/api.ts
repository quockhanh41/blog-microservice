import { toast } from "@/hooks/use-toast";
require("dotenv").config();

// Base URL for the API Gateway
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Log the API URL for debugging
console.log("🔧 Environment Info:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXT_PUBLIC_API_URL from env:", process.env.NEXT_PUBLIC_API_URL);
console.log("Final API_BASE_URL:", API_BASE_URL);
console.log("===================");

// Helper function to get the auth token
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function to get the user ID
const getUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Có lỗi xảy ra");
  }
  return data;
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const userId = getUserId();
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Log API request details
  console.log("🌐 API Request:");
  console.log("Full URL:", fullUrl);
  console.log("Endpoint:", endpoint);
  console.log("Method:", options.method || "GET");
  console.log("Has token:", !!token);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { "x-user-id": userId } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    
    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    console.error("Full URL that failed:", fullUrl);
    if (error instanceof Error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
    throw error;
  }
};

// Auth API endpoints
export const authApi = {
  login: (email: string, password: string) => {
    return apiRequest<{ token: string; user: any }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: (username: string, email: string, password: string) => {
    return apiRequest<{ token: string; user: any }>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  getProfile: () => {
    return apiRequest<any>("/users/profile");
  },

  updateProfile: (profileData: any) => {
    return apiRequest<any>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

// Post API endpoints
export const postApi = {
  createPost: (postData: { title: string; content: string }) => {
    return apiRequest<any>("/posts/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  getPost: (postId: string) => {
    return apiRequest<any>(`/posts/posts/${postId}`);
  },

  updatePost: (postId: string, postData: { title: string; content: string }) => {
    return apiRequest<any>(`/posts/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  deletePost: (postId: string) => {
    return apiRequest<any>(`/posts/posts/${postId}`, {
      method: "DELETE",
    });
  },

  getAllPosts: (params?: { limit?: number; sort?: "asc" | "desc" }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    
    const queryString = queryParams.toString();
    return apiRequest<any[]>(`/posts/all${queryString ? `?${queryString}` : ""}`);
  },

  getUserPosts: (userId: string, params?: { limit?: number; sort?: "asc" | "desc" }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    queryParams.append("user_ids", userId);

    return apiRequest<any[]>(`/posts/posts?${queryParams.toString()}`);
  },

  likePost: (postId: string) => {
    return apiRequest<any>(`/posts/posts/${postId}/like`, {
      method: "POST",
    });
  },

  unlikePost: (postId: string) => {
    return apiRequest<any>(`/posts/posts/${postId}/unlike`, {
      method: "POST",
    });
  },
};

// Feed API endpoints
export const feedApi = {
  getFeed: (params?: { limit?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    
    return apiRequest<{ posts: any[]; hasMore: boolean }>(`/feed/feed?${queryParams.toString()}`);
  },

  invalidateCache: () => {
    return apiRequest<{ message: string }>("/feed/invalidate", {
      method: "POST",
    });
  },
};

// User API endpoints
export const userApi = {
  getUser: (userId: string) => {
    return apiRequest<any>(`/users/users/${userId}`);
  },

  getFollowing: (userId: string) => {
    return apiRequest<string[]>(`/users/users/${userId}/following`);
  },

  getFollowers: (userId: string) => {
    return apiRequest<string[]>(`/users/users/${userId}/followers`);
  },

  followUser: (userId: string) => {
    return apiRequest<{ message: string }>(`/users/users/${userId}/follow`, {
      method: "POST",
    });
  },

  unfollowUser: (userId: string) => {
    return apiRequest<{ message: string }>(`/users/users/${userId}/unfollow`, {
      method: "DELETE",
    });
  },

  searchUsers: (query: string) => {
    return apiRequest<any[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },
};

// Export a default API object that combines all endpoints
const api = {
  auth: authApi,
  posts: postApi,
  feed: feedApi,
  users: userApi,
};

export default api;

// Export helper functions
export { getToken, getUserId };
