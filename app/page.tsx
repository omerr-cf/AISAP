import { redirect } from "next/navigation";

// Root → always redirect to the studies list
const Home = () => {
  redirect("/studies");
};

export default Home;
