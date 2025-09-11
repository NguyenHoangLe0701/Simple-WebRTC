import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-bold text-purple-600">Simple WebRTC</h1>
      <nav className="space-x-6">
        <a href="#" className="text-gray-600 hover:text-purple-600">Pricing</a>
        <a href="#" className="text-gray-600 hover:text-purple-600">FAQ</a>
        <a href="#" className="text-gray-600 hover:text-purple-600">Docs</a>
        <a href="#" className="text-gray-600 hover:text-purple-600">Consulting</a>
        <a href="#" className="text-gray-600 hover:text-purple-600">Newsletter</a>
        <a href="#" className="text-gray-600 hover:text-purple-600">Contact</a>
        <Link to="/login" className="text-gray-600 hover:text-purple-600">Login</Link>
      </nav>
    </header>
  );
}

export default Header;