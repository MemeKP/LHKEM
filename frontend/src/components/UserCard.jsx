import { Mail, User, Trash2, Edit } from 'lucide-react';

const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <div className="card hover:scale-105 transform transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit user"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(user._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete user"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
