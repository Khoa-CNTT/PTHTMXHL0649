import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
// import { formatDistance } from "date-fns";
// import { vi } from "date-fns/locale";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Post header */}
      <div className="flex items-center p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue text-white font-bold">
              {post.author.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <Link
            to={`/profile/${post.author.id}`}
            className="font-medium text-gray-900 hover:underline"
          >
            {post.author.name}
          </Link>
          <div className="text-xs text-gray-500">
            {/* {formatDistance(new Date(post.createdAt), new Date(), {
              addSuffix: true,
              locale: vi,
            })} */}
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        <Link to={`/post/${post.id}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
          <p className="text-gray-700">{post.content}</p>
        </Link>
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button
          className="flex items-center gap-1 text-gray-500 hover:text-blue transition-colors"
          onClick={handleLike}
        >
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>{likeCount}</span>
        </button>
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1 text-gray-500 hover:text-blue transition-colors"
        >
          <FaComment />
          <span>{post.comments}</span>
        </Link>
        <button className="flex items-center gap-1 text-gray-500 hover:text-blue transition-colors">
          <FaShare />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
