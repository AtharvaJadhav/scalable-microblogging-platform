import { Box } from "@chakra-ui/react";
import React from "react";
import { NavBar } from "./NavBar";
import { Wrapper } from "./Wrapper";

export type WrapperVariant = "small" | "regular";

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
      <NavBar />
      <Box variant={variant}>{children}</Box>
    </>
  );
};

export default Layout;
