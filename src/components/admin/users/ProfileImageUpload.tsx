import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  uploading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  error?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageChange,
  uploading = false,
  className = '',
  size = 'md',
  required = false,
  error
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      icon: 16
    },
    md: {
      container: 'w-24 h-24',
      icon: 20
    },
    lg: {
      container: 'w-32 h-32',
      icon: 24
    }
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Profile Image
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex items-start space-x-4">
        {/* Image Preview Container */}
        <div className={`${currentSize.container} border-2 border-dashed rounded-full overflow-hidden flex items-center justify-center bg-gray-50 relative group ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${uploading ? 'opacity-50' : ''}`}>
          
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt="Profile Preview" 
                className="w-full h-full object-cover" 
              />
              {/* Remove button overlay */}
              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Remove image"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={currentSize.icon} />
              <span className="text-xs mt-1">No image</span>
            </div>
          )}
          
          {/* Upload overlay for empty state */}
          {!currentImage && !uploading && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-50 bg-opacity-50 transition-opacity duration-200">
              <Upload size={currentSize.icon - 4} className="text-blue-600" />
            </div>
          )}
        </div>

        {/* File Input and Info */}
        <div className="flex-1">
          <div className="mb-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className={`block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                file:transition-colors file:duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${uploading ? 'file:opacity-50 file:cursor-not-allowed' : 'file:cursor-pointer'}
                ${error ? 'file:bg-red-50 file:text-red-700 hover:file:bg-red-100' : ''}`}
            />
          </div>
          
          {/* Upload guidelines */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Upload a profile picture (max 5MB)</p>
            <p>Supported formats: JPG, PNG, GIF</p>
            <p>Recommended: Square image, at least 200x200px</p>
          </div>
          
          {/* Current image info */}
          {currentImage && (
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Image uploaded successfully
            </div>
          )}
          
          {/* Upload progress indicator */}
          {uploading && (
            <div className="mt-2 text-xs text-blue-600 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Uploading image...
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-2 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
