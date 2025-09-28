import HeaderDocs from "../components/HeaderDocs";
// import SidebarDocs from "../components/SidebarDocs";
// import ContentDocs from "../components/ContentDocs";
import React from "react";
import SidebarDocs from "../components/SidebarDocs";
import DocsContent from "../components/DocContent";

function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderDocs />
      <SidebarDocs />
      <DocsContent />
    </div>
  );
}

export default DocsPage;