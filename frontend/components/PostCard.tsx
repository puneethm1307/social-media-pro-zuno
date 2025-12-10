/**
 * Post card component displaying a single post.
 */

'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/media-api';
import Image from 'next/image';

interface Post {
  _id: string;
  authorId: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  caption: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            {post.authorId.avatar ? (
              <Image
                src={post.authorId.avatar}
                alt={post.authorId.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <span className="text-gray-600 font-semibold">
                {post.authorId.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.authorId.displayName || post.authorId.username}
            </p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <p className="text-gray-900 mb-4">{post.caption}</p>

        {post.mediaUrls.length > 0 && (
          <div className="mb-4 space-y-2">
            {post.mediaUrls.map((url, index) => (
              <div key={index} className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={getMediaUrl(url)}
                  alt={`Post media ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

