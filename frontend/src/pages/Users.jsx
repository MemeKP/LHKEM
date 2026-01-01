import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';
import UserCard from '../components/UserCard';
import UserForm from '../components/UserForm';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await userService.createUser(userData);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const updateData = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await userService.updateUser(selectedUser._id, updateData);
      setShowForm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage your application users</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first user</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create User
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        )}

        {showForm && (
          <UserForm
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
