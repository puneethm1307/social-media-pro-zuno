/**
 * Create post button that opens a modal for creating a new post.
 */

'use client';

import { useState } from 'react';
import { uploadImage, getMediaUrl } from '@/lib/media-api';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      const mediaUrls: string[] = [];

      // Upload files
      for (const file of files) {
        const uploadResult = await uploadImage(file);
        mediaUrls.push(uploadResult.file_key);
      }

      // Create post
      await api.post('/posts', {
        caption,
        mediaUrls,
      });

      // Reset form and close modal
      setCaption('');
      setFiles([]);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Create Post
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Post</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  maxLength={2000}
                  required
                />
              </div>

              <div>
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-1">
                  Images (up to 10)
                </label>
                <input
                  id="files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {files.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative aspect-square bg-gray-200 rounded">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !caption.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

