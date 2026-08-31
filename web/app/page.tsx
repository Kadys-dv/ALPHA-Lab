import dynamic from "next/dynamic";
const AlphaBuildersApp = dynamic(() => import("@/components/AlphaBuildersApp"), { ssr: false });
export default function Home(){ return <AlphaBuildersApp/>; }
