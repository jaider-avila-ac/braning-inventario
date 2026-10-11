export const Input = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
};