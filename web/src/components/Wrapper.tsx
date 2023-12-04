import { Box } from "@chakra-ui/react";
import React from "react";

interface WrapperProps {
  variant?: "small" | "regular";
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      // mt={8}
      mx="auto"
      px={4}
      maxW={variant === "regular" ? "1400px" : "400px"}
      w="70%"
    >
      {children}
    </Box>
  );
};
