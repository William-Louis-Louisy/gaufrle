import { useState } from "react";
import Loading from "../components/Navigation/Loading";

function Homepage() {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-64px)]"></div>
  );
}

export default Homepage;
