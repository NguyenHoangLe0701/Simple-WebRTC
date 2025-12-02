import React, { useState, useEffect } from "react";
import { X, Search, ChevronRight, ChevronDown } from "lucide-react";

function SidebarDocs({ currentSection, setCurrentSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [expanded, setExpanded] = useState({
    overview: true,
    tutorials: false,
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

  // Tự động mở section khi chọn một item
  useEffect(() => {
    if (currentSection) {
      if (currentSection.startsWith("tutorial-")) {
        setExpanded((prev) => ({ ...prev, tutorials: true }));
      } else if (currentSection.startsWith("userData")) {
        setExpanded((prev) => ({ ...prev, userData: true }));
      } else if (currentSection === "httpApi") {
        setExpanded((prev) => ({ ...prev, httpApi: true }));
      } else if (currentSection === "reduxActions") {
        setExpanded((prev) => ({ ...prev, reduxActions: true }));
      } else if (currentSection === "reduxStore") {
        setExpanded((prev) => ({ ...prev, reduxStore: true }));
      } else if (currentSection === "components") {
        setExpanded((prev) => ({ ...prev, components: true }));
      } else if (currentSection === "versions") {
        setExpanded((prev) => ({ ...prev, versions: true }));
      } else if (currentSection === "upgrading") {
        setExpanded((prev) => ({ ...prev, upgrading: true }));
      } else if (currentSection === "errors") {
        setExpanded((prev) => ({ ...prev, errors: true }));
      } else if (currentSection === "release") {
        setExpanded((prev) => ({ ...prev, release: true }));
      }
    }
  }, [currentSection]);

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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSection("overview");
                      }}
                      className={`text-base block hover:underline w-full text-left ${
                        currentSection === "overview" ? "text-blue-600 font-semibold" : "text-black"
                      }`}
                    >
                      Getting Started
                    </button>
                  </li>
                  <li className="ml-8">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSection("creating-app");
                      }}
                      className={`text-base block hover:underline w-full text-left ${
                        currentSection === "creating-app" ? "text-blue-600 font-semibold" : "text-black"
                      }`}
                    >
                      Creating a new SimpleWebRTC app
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Tutorials - Học WebRTC Cơ Bản */}
            <li>
              <div className="mt-2">
                <button
                  onClick={() => toggleExpand("tutorials")}
                  aria-expanded={expanded.tutorials}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <span className="flex-none">
                    {expanded.tutorials ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                  </span>
                  <span className="flex-1 text-black font-semibold text-lg">Học WebRTC Cơ Bản</span>
                </button>

                {expanded.tutorials && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-1");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-1" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        1. Cài đặt và Thiết lập môi trường
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-2");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-2" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        2. Thiết lập Redux Store và Provider
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-3");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-3" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        3. Xử lý trạng thái kết nối
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-4");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-4" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        4. Yêu cầu quyền truy cập Media
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-5");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-5" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        5. Tham gia vào Room
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-6");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-6" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        6. Điều khiển Media
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("tutorial-complete");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "tutorial-complete" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Hoàn thành - Tổng kết
                      </button>
                    </li>
                  </ul>
                )}
              </div>
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
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("userData-1");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "userData-1" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        1. Tạo JWT đã ký bằng API Secret
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("userData-2");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "userData-2" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        2. Cấu hình SimpleWebRTC với user data token
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("userData-3");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "userData-3" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        3. Lấy dữ liệu từ peers
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Server-Side HTTP API */}
            <li>
              <div className="mt-2">
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
                  <span className="flex-1 text-black font-semibold text-lg">Server-Side HTTP API</span>
                </button>

                {expanded.httpApi && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("httpApi");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "httpApi" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Tài liệu API
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Redux Actions */}
            <li>
              <div className="mt-2">
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

                {expanded.reduxActions && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Clicking reduxActions, setCurrentSection:", setCurrentSection);
                          if (setCurrentSection) {
                            setCurrentSection("reduxActions");
                          } else {
                            console.error("setCurrentSection is not defined!");
                          }
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "reduxActions" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Tài liệu Actions
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Redux Store */}
            <li>
              <div className="mt-2">
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

                {expanded.reduxStore && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Clicking reduxStore, setCurrentSection:", setCurrentSection);
                          if (setCurrentSection) {
                            setCurrentSection("reduxStore");
                          } else {
                            console.error("setCurrentSection is not defined!");
                          }
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "reduxStore" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Tài liệu Store
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Components */}
            <li>
              <div className="mt-2">
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

                {expanded.components && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("components");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "components" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Tài liệu Components
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* React/Redux Versions */}
            <li>
              <div className="mt-2">
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

                {expanded.versions && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("versions");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "versions" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Yêu cầu phiên bản
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Upgrading */}
            <li>
              <div className="mt-2">
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
                  <span className="flex-1 text-black font-semibold text-lg">Nâng cấp</span>
                </button>

                {expanded.upgrading && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("upgrading");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "upgrading" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Hướng dẫn nâng cấp
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* Error Codes */}
            <li>
              <div className="mt-2">
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
                  <span className="flex-1 text-black font-semibold text-lg">Mã lỗi</span>
                </button>

                {expanded.errors && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("errors");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "errors" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Danh sách mã lỗi
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>

            {/* SDK Release Notes */}
            <li>
              <div className="mt-2">
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

                {expanded.release && (
                  <ul className="mt-2 ml-8 text-sm space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection("release");
                        }}
                        className={`text-base block hover:underline w-full text-left ${
                          currentSection === "release" ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        Lịch sử phiên bản
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default SidebarDocs;
