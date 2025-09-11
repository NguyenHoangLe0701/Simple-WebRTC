import HeaderDocs from "../components/HeaderDocs";
import Sidebar from "../components/Sidebar";
import DocContent from "../components/DocContent";
import Footer from "../components/Footer";

function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderDocs />  {/* dùng header riêng cho docs */}
      <div className="flex flex-1">
        <Sidebar />
        <DocContent />
      </div>
      <Footer />
    </div>
  );
}

export default DocsPage;