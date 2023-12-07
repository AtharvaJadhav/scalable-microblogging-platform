import "../firebaseConfig";
import { Button, Box, Link, Flex, useToast, Image } from "@chakra-ui/react";
import React from "react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../util/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../util/createUrqlClient";
import NextLink from "next/link";
import { withApollo } from "../util/withApollo";
import Head from "next/head";
import { Layout } from "../components/Layout";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login ] = useLoginMutation();
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send the token to your backend using the login mutation
      const response = await login({ variables: { googleToken: token } });
      if (response.data?.login.errors) {
        // Handle errors
        const errorMessage = response.data.login.errors
          .map((err) => err.message)
          .join(", ");
        toast({
          title: "Registration Error",
          description: errorMessage,
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
        console.log(response.data?.login.errors);
      } else {
        // User logged in successfully
        router.push("/");
        setTimeout(() => {
          router.reload();
        }, 200);
      }
    } catch (error) {
      // Handle Errors here
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Ekko</title>
      </Head>
      <Wrapper variant="small">
        <Flex align="center" justify="center" minH="50vh">
          <Formik
            initialValues={{
              usernameOrEmail: "",
              password: "",
              twoFactorToken: "",
            }}
            onSubmit={async (values, { setErrors }) => {
              const response = await login({
                variables: {
                  usernameOrEmail: values.usernameOrEmail,
                  password: values.password,
                  twoFactorToken: values.twoFactorToken,
                },
                update: (cache, { data }) => {
                  cache.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                      __typename: "Query",
                      me: data?.login.user,
                    },
                  });
                  cache.evict({ fieldName: "posts:{}" });
                },
              });
              if (response.data?.login.errors) {
                setErrors(toErrorMap(response.data.login.errors));
              } else if (response.data?.login.user) {
                // If a twoFactorToken was provided, navigate to the home page
                if (values.twoFactorToken) {
                  router.push("/");
                } else {
                  // If no twoFactorToken was provided, navigate to TwoFactorSetup
                  router.push("/TwoFactorSetup");
                }
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box
                  width="400px"
                  mx="auto"
                  mt={8}
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="lg"
                >
                  <Box pt={4}>
                    <InputField
                      name="usernameOrEmail"
                      placeholder="username or email"
                      label="Username or Email"
                    />
                  </Box>
                  <Box pt={4}>
                    <InputField
                      name="password"
                      placeholder="password"
                      label="Password"
                      type="password"
                    />
                  </Box>
                  <Box pt={4}>
                    <InputField
                      name="twoFactorToken"
                      placeholder="Two-Factor Token"
                      label="Two-Factor Token"
                      type="text"
                    />
                  </Box>
                  <Flex mt={2}>
                    <NextLink href="/forgot-password">
                      <Link ml="auto">Forgot password?</Link>
                    </NextLink>
                  </Flex>
                  <Button
                    mt={4}
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}
                  >
                    Log in
                  </Button>
                  <Button
                    mt={4}
                    ml={2}
                    colorScheme="blue"
                    onClick={handleGoogleSignIn}
                  >
                    Sign in with Google
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Flex>
      </Wrapper>
    </>
  );
};

export default withApollo({ ssr: false })(Login);
