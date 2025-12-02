import HeaderDocs from "../components/HeaderDocs";
import React, { useState } from "react";
import SidebarDocs from "../components/SidebarDocs";
import DocsContent from "../components/DocContent";

function DocsPage() {
  const [currentSection, setCurrentSection] = useState("overview");

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderDocs />
      <SidebarDocs 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection} 
      />
      <DocsContent currentSection={currentSection} />
    </div>
  );
}

export default DocsPage;