import React, { useState } from 'react';
import '../styles/TagInput.css';

const TagInput = ({ tags, setTags }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && input === '') {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input-container">
      {tags.map((tag, i) => (
        <div className="tag" key={i}>
          {tag}
          <span className="remove-tag" onClick={() => removeTag(i)}>×</span>
        </div>
      ))}
      <input
        type="text"
        value={input}
        placeholder="Enter tags..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default TagInput;