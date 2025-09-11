import { Link } from "react-router-dom";

function HeaderDocs() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b bg-white shadow-sm">
      <h1 className="text-xl font-bold text-purple-600">
        simple<span className="text-pink-500">webRTC</span>
      </h1>
      <nav className="space-x-6 text-gray-600">
        <Link to="/docs">Docs</Link>
        <Link to="/consulting">Consulting & Development</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  );
}

export default HeaderDocs;