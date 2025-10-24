import React from 'react';
import { FaTwitter, FaFacebook, FaLink, FaWhatsapp } from 'react-icons/fa';

const ShareButtons = ({ title, url, description }) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} - ${description}`);
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      <div className="flex space-x-2">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
          aria-label="Share on Twitter"
        >
          <FaTwitter className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
          aria-label="Share on Facebook"
        >
          <FaFacebook className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp className="w-4 h-4" />
        </a>
        <button
          onClick={copyToClipboard}
          className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Copy link"
        >
          <FaLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
