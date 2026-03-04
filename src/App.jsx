import "./assets/css/main.css";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Navbar from "./components/layout/Navbar";
import ScrollToTopButton from "./components/ui/ScrollToTopButton";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRouter />
      <ScrollToTopButton />
    </BrowserRouter>
  );
}

export default App;