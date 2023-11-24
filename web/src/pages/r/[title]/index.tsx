import { useRouter } from "next/router";
import React from "react";
import Home from "../../../components/Home";
import { withApollo } from "../../../util/withApollo";

const Index = () => {
  return <Home sort="new" />;
};

export default withApollo({ ssr: true })(Index);
