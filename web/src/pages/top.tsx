import React from "react";
import Home from "../components/Home";
import { withApollo } from "../util/withApollo";

const Top = () => {
  return <Home sort="top" />;
};

export default withApollo({ ssr: true })(Top);
