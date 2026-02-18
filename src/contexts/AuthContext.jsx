import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* New: User Cache for optimized login */
  const [userCache, setUserCache] = useState(null);

  // Check for existing user session on mount AND pre-fetch users
  useEffect(() => {
    const storedUser = localStorage.getItem('mis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Pre-fetch users if not logged in
      preloadUsers();
    }
    setLoading(false);
  }, []);

  const preloadUsers = async () => {
    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (scriptUrl) {
        const response = await fetch(`${scriptUrl}?sheet=Master`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setUserCache(result.data);
          console.log("Users pre-loaded for fast login");
        }
      }
    } catch (err) {
      console.warn("User pre-load failed:", err);
    }
  };

  // Login function
  const login = async (username, password) => {
    setLoading(true);

    try {
      let usersData = userCache;

      // If cache missed or failed, fetch now
      if (!usersData) {
        const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        if (!scriptUrl) {
          console.error("VITE_APPS_SCRIPT_URL is not defined in .env");
          setLoading(false);
          return false;
        }
        // Fetch users (Master tab)
        const response = await fetch(`${scriptUrl}?sheet=Master`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          usersData = result.data;
          setUserCache(usersData); // Cache for next time
        }
      }

      if (usersData) {
        // Data structure: [Name, Email, Dept, Designation, Profile, ID, Pass]
        // Indices:        0     1      2     3            4        5   6

        // Find matching user (skip header row if it exists, but strict match handles it)
        const userRow = usersData.find(row =>
          String(row[5]).trim() === username && String(row[6]).trim() === password
        );

        if (userRow) {
          // Determine role based on designation
          const designation = String(userRow[3]).toLowerCase();
          const role = (designation.includes('admin') || designation.includes('manager')) ? 'admin' : 'user';

          const verifiedUser = {
            id: userRow[5],
            name: userRow[0],
            role: role,
            image: userRow[4] || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
            email: userRow[1],
            department: userRow[2],
            designation: userRow[3]
          };

          setUser(verifiedUser);
          localStorage.setItem('mis_user', JSON.stringify(verifiedUser));
          setLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }

    // If we get here, login failed
    setLoading(false);
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('mis_user');
    setUser(null);
    navigate('/login');
    // Re-fetch users for next login
    preloadUsers();
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}