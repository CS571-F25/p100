import { useParams } from "react-router-dom";

import NY from "./destinations/ny.jsx";
import SD from "./destinations/sd.jsx";
import LA from "./destinations/ca.jsx";

// 如果你以后有更多城市，比如 chi、da、sa，就继续加
// import CHI from "./destinations/chi.jsx";
// import DA from "./destinations/da.jsx";
// import SA from "./destinations/sa.jsx";

const DESTINATION_MAP = {
  ny: NY,
  sd: SD,
  ca: LA,
  // chi: CHI,
  // da: DA,
  // sa: SA,
};

export default function DestinationRouter() {
  const { id } = useParams();
  const Component = DESTINATION_MAP[id];

  if (!Component) {
    return <h1 style={{ padding: 20 }}>Destination not found</h1>;
  }

  return <Component />;
}
