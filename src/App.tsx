import Home from "./routes/Home";
import Explore from "./routes/Explore";
import Create from "./routes/Create";
import EventDetail from "./routes/EventDetail";
import TicketList from "./routes/TicketList";
import { Route, BrowserRouter, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/event/:address" element={<EventDetail />} />
        <Route path="/event/:address/tickets" element={<TicketList />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
