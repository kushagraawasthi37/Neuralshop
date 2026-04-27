const Button = ({ children, variant = "primary", ...props }) => {
  const styles = {
    primary: "bg-blue-500 hover:bg-blue-600",
    secondary: "bg-gray-700 hover:bg-gray-600",
    danger: "bg-red-500 hover:bg-red-600",
  }

  return (
    <button className={`${styles[variant]} text-white`} {...props}>
      {children}
    </button>
  )
}

export default Button