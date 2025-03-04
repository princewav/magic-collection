import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="text-white min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-screen">
        <h1>Content</h1>
      </div>
    </div>
  );
}

