"use client";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Navigation() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">MyApp</div>
      <ul className="flex space-x-4">
        <li>
          <a href="/" className="hover:underline">
            Home
          </a>
        </li>
        <li>
          <a href="/about" className="hover:underline">
            About
          </a>
        </li>
        <li>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </li>
        {!user && (
          <>
            <li>
              <a href="/login" className="hover:underline">
                Login
              </a>
            </li>
            <li>
              <a href="/register" className="hover:underline">
                Register
              </a>
            </li>
          </>
        )}
        {user && (
          <li>
            <button
              onClick={logout}
              className="hover:underline bg-red-500 px-3 py-1 rounded text-white"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
