import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import React from "react";
import theme from "../theme";
import { Container } from "../components/Container";
import Head from "next/head";

function MyApp({ Component, pageProps }: any) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Head>
        <title>Ekko</title>
      </Head>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Container>
          <Component {...pageProps} />
        </Container>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default MyApp;
