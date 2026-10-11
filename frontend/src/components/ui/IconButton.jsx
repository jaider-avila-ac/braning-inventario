export const IconButton = ({ 
  icon: Icon, 
  onClick, 
  title, 
  variant = "default",
  disabled = false,
  className = ""
}) => {
  const variants = {
    default: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
    primary: "text-blue-600 hover:bg-blue-50",
    success: "text-green-600 hover:bg-green-50",
    danger: "text-red-600 hover:bg-red-50",
    warning: "text-yellow-600 hover:bg-yellow-50",
    info: "text-cyan-600 hover:bg-cyan-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {Icon && <Icon size={18} />}
    </button>
  );
};