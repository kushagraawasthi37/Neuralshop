import Header from "./Header"

const MainLayout = ({ children }) => {
  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
      <main className="pt-20">
        {children}
      </main>
    </div>
  )
}

export default MainLayout