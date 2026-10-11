export const Button = ({ 
  text, 
  variant = "primary", 
  icon: Icon, 
  onClick, 
  type = "button",
  title, 
  disabled = false,
  className = ""
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {text}
    </button>
  );
};