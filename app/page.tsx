import Link from "next/link";

const Home = () => {
  return (
    <div>
      <div>HomePage</div>
      <Link href="/dashboard/home"> Dashboard</Link>
    </div>
  );
};

export default Home;
