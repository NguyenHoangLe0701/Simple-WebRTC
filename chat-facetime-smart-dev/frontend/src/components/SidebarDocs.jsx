import React, { useState } from "react";
import { X, Search, ChevronRight, ChevronDown } from "lucide-react";

function SidebarDocs() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [expanded, setExpanded] = useState({
    overview: true,
    userData: false,
    httpApi: false,
    reduxActions: false,
    reduxStore: false,
    components: false,
    versions: false,
    upgrading: false,
    errors: false,
    release: false,
  });

  const toggleSidebar = () => setIsOpen(!isOpen);
  const clearSearch = () => setSearch("");
  const toggleExpand = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="relative">
      {/* Toggle button - chỉ hiện trên mobile */}
      <button
        onClick={toggleSidebar}
        className="p-2 md:hidden fixed top-4 left-4 z-50 bg-white rounded shadow"
        aria-label="Menu"
      >
        <div className="flex flex-col space-y-1">
          <span className="block h-0.5 w-6 bg-gray-600" />
          <span className="block h-0.5 w-6 bg-gray-600" />
          <span className="block h-0.5 w-6 bg-gray-600" />
        </div>
      </button>

      {/* Sidebar: fixed bên dưới header (top = chiều cao header) */}
      <aside
        className={`
          fixed top-[104px] left-0 h-[calc(100vh-104px)] w-72 bg-white shadow-lg z-40
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search"
              aria-label="Search text"
              className="w-full rounded-md border pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <ul className="space-y-2 text-gray-700">

            {/* Overview (ví dụ có subitems) */}
            <li>
              <button
                onClick={() => toggleExpand("overview")}
                aria-expanded={expanded.overview}
                className="flex items-start gap-3 w-full text-left"
              >
                {/* chevron bên trái */}
                <span className="flex-none mt-1">
                  {expanded.overview ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>

                <span className="flex-1">
                  <div className={expanded.overview ? "text-primary font-semibold text-lg" : "font-medium"}>
                    Overview
                  </div>
                </span>
              </button>

              {expanded.overview && (
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="ml-8">
                    <a href="#/?id=getting-started" className="text-black text-base block hover:underline">Getting Started</a>
                  </li>
                  <li className="ml-8">
                    <a href="#/?id=creating-a-new-simplewebrtc-app" className="text-black text-base block hover:underline">Creating a new SimpleWebRTC app</a>
                  </li>
                </ul>
              )}
            </li>

            {/* User Data Integration */}
            <li>
              <div className="mt-2">
                <button
                  onClick={() => toggleExpand("userData")}
                  aria-expanded={expanded.userData}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <span className="flex-none">
                    {expanded.userData ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                  </span>
                  <span className="flex-1 text-black font-semibold text-lg">User Data Integration</span>
                </button>

                {expanded.userData && (
                  <ul className="mt-2 ml-8 text-sm">
                    <li><a href="#/User_Data" className=" text-base block hover:underline ">Docs</a></li>
                  </ul>
                )}
              </div>
            </li>

            {/* Server-Side HTTP API */}
            <li>
              <button
                onClick={() => toggleExpand("httpApi")}
                aria-expanded={expanded.httpApi}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.httpApi ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1text-black font-semibold text-lg">Server-Side HTTP API</span>
              </button>
            </li>

            {/* Redux Actions */}
            <li>
              <button
                onClick={() => toggleExpand("reduxActions")}
                aria-expanded={expanded.reduxActions}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.reduxActions ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">Redux Actions</span>
              </button>
            </li>

            {/* Redux Store */}
            <li>
              <button
                onClick={() => toggleExpand("reduxStore")}
                aria-expanded={expanded.reduxStore}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.reduxStore ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">Redux Store</span>
              </button>
            </li>

            {/* Components */}
            <li>
              <button
                onClick={() => toggleExpand("components")}
                aria-expanded={expanded.components}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.components ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">Components</span>
              </button>
            </li>

            {/* React/Redux Versions */}
            <li>
              <button
                onClick={() => toggleExpand("versions")}
                aria-expanded={expanded.versions}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.versions ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">React/Redux Versions</span>
              </button>
            </li>

            {/* Upgrading */}
            <li>
              <button
                onClick={() => toggleExpand("upgrading")}
                aria-expanded={expanded.upgrading}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.upgrading ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">Upgrading</span>
              </button>
            </li>

            {/* Error Codes */}
            <li>
              <button
                onClick={() => toggleExpand("errors")}
                aria-expanded={expanded.errors}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.errors ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">Error Codes</span>
              </button>
            </li>

            {/* SDK Release Notes */}
            <li>
              <button
                onClick={() => toggleExpand("release")}
                aria-expanded={expanded.release}
                className="flex items-center gap-3 w-full text-left"
              >
                <span className="flex-none">
                  {expanded.release ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-black font-semibold text-lg">SDK Release Notes</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default SidebarDocs;
