const API_BASE_URL = 'http://localhost:3000/api';
// const API_BASE_URL = 'https://unsaid-backend.vercel.app/api';
export { API_BASE_URL };

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API calls
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  const data = await response.json();
  console.log('Login response:', data);
  
  // Store the token if it's in the response
  if (data.status === 'success' && data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.data.user._id);
  }
  
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    // Clear all auth-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    return response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // Clear localStorage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    return { status: 'success', message: 'Logged out locally' };
  }
};

// Posts API calls
export const getPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/posts/approved?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const getMyPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/posts/my-posts?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const getPost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const createPost = async (postData) => {
  try {
    // Log what we're sending for debugging
    console.log('Creating post with data:', {
      content: postData.content,
      isAnonymous: postData.isAnonymous,
      spicyLevel: postData.spicyLevel,
      hasImage: !!postData.image
    });
    
    // Use JSON approach instead of FormData for basic text posts
    if (!postData.image) {
      // Create a JSON object with proper types
      const jsonData = {
        content: postData.content,
        isAnonymous: Boolean(postData.isAnonymous),
        spicyLevel: Number(postData.spicyLevel) || 1
      };
      
      console.log('Sending JSON data:', jsonData);
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(jsonData)
      });
      
      const result = await response.json();
      console.log('Create post response:', result);
      return result;
    } 
    // If there's an image, we still need to use FormData
    else {
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('isAnonymous', postData.isAnonymous === true ? true : false);
      formData.append('spicyLevel', Number(postData.spicyLevel) || 1);
      
      // Log file details before appending
      if (postData.image instanceof File) {
        console.log('Appending file to form data:', {
          name: postData.image.name,
          type: postData.image.type,
          size: postData.image.size,
          lastModified: new Date(postData.image.lastModified).toISOString()
        });
      } else {
        console.error('Image is not a valid File object:', postData.image);
      }
      
      // Append image last to ensure other fields are processed first
      formData.append('image', postData.image);
      
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1] instanceof File ? '[File: ' + pair[1].name + ', ' + pair[1].size + ' bytes]' : pair[1]}`);
      }
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: formData
      });
      
      const result = await response.json();
      console.log('Create post response:', result);
      return result;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return { status: 'error', message: error.message };
  }
};

export const likePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const unlikePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/unlike`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const addComment = async (postId, commentData) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    credentials: 'include',
    body: JSON.stringify({ text: commentData }),
  });
  return response.json();
};

export const addCommentReply = async (postId, commentId, replyText) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    credentials: 'include',
    body: JSON.stringify({ text: replyText }),
  });
  return response.json();
};

export const likeComment = async (postId, commentId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const unlikeComment = async (postId, commentId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/unlike`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

// Admin API calls
export const getAllPosts = async (page = 1, limit = 50) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/all?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log some information about the posts received
    if (data.status === 'success' && data.data && data.data.posts) {
      console.log(`Received ${data.data.posts.length} posts`);
      // Log details of posts with images
      const postsWithImages = data.data.posts.filter(p => p.image || p.imageUrl);
      console.log(`Posts with images: ${postsWithImages.length}`);
      postsWithImages.forEach((post, index) => {
        console.log(`Image Post ${index + 1}:`, {
          id: post._id,
          image: post.image,
          imageUrl: post.imageUrl
        });
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    throw error;
  }
};

export const getPostsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/posts/status/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching posts by status:', error);
    throw error;
  }
};

export const updatePostStatus = async (postId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
};

export const searchPosts = async (query) => {
  const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

// Admin API for user management
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    console.log(`Updating user ${userId} role to ${role}`);
    
    // Use the correct endpoints based on the role
    const endpoint = role === 'admin' 
      ? `${API_BASE_URL}/admin/users/${userId}/make-admin`
      : `${API_BASE_URL}/admin/users/${userId}/remove-admin`;
    
    const response = await fetch(endpoint, {
      method: 'PATCH', // Use POST as specified in the backend route
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log("API response data:", data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    // Log the deletion attempt with full details
    console.log(`Attempting to delete user with ID: ${userId}`);
    
    // Try alternative endpoint formats
    const endpoint = `${API_BASE_URL}/admin/users/${userId}`;
    console.log(`Using endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
    });
    
    // Log full response information
    console.log(`Delete user response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('Delete user response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updatePostSpicyLevel = async (postId, spicyLevel) => {
  try {
    console.log(`Updating post ${postId} spicy level to ${spicyLevel}`);
    
    // Ensure spicyLevel is a number
    const numericSpicyLevel = Number(spicyLevel);
    
    if (isNaN(numericSpicyLevel)) {
      throw new Error('Spicy level must be a number');
    }

    // First try with admin endpoint
    try {
      const adminResponse = await fetch(`${API_BASE_URL}/admin/posts/${postId}/spicy-level`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ spicyLevel: numericSpicyLevel }),
      });
      
      if (adminResponse.ok) {
        const data = await adminResponse.json();
        console.log('Admin spicy level update response:', data);
        return data;
      }
      
      console.log(`Admin endpoint failed with status: ${adminResponse.status}. Trying regular endpoint...`);
    } catch (adminError) {
      console.error('Error with admin spicy level endpoint:', adminError);
      console.log('Attempting fallback to regular post endpoint...');
    }

    // Fallback to regular post endpoint
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/spicy-level`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
      body: JSON.stringify({ spicyLevel: numericSpicyLevel }),
    });
    
    const data = await response.json();
    console.log('Fallback spicy level update response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating post spicy level:', error);
    throw error;
  }
};

// Check authentication status
export const checkAuth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    
    // If unauthorized or other error, clear token
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    }
    
    return { status: 'error', message: 'Not authenticated' };
  } catch (error) {
    console.error('Auth check error:', error);
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.log('Auth check timed out, assuming user is not authenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      return { status: 'error', message: 'Request timed out' };
    }
    
    return { status: 'error', message: error.message };
  }
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    console.log('Requesting OTP resend for email:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    console.log('Resend OTP response:', result);
    return result;
  } catch (error) {
    console.error('Error resending OTP:', error);
    return { status: 'error', message: error.message };
  }
}; 