const TypingIndicator = ({ name }) => {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__bubble">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </div>
      {name && (
        <span className="typing-indicator__label">{name} is typing...</span>
      )}
    </div>
  );
};

export default TypingIndicator;
