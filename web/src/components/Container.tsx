import { Box, useColorMode } from "@chakra-ui/react";
import React from "react";

export const Container = (props: any) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.900" };

  const color = { light: "black", dark: "white" };
  return (
    <Box
      minHeight="100vh"
      bg={bgColor[colorMode]}
      color={color[colorMode]}
      {...props}
    />
  );
};
