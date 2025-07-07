import VirtualizedTable from "./components/VirtualTable";
import { BrowserRouter, Route, Routes } from "react-router";
import DragDrop from "./components/DragDrop";
import Header from "./components/Header";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<DragDrop />} />
          <Route path="/table" element={<VirtualizedTable />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
