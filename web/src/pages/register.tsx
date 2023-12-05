import "../firebaseConfig";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withApollo } from "../util/withApollo";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  useRegisterMutation,
  useRegisterWithGoogleMutation,
} from "../generated/graphql";
import { toErrorMap } from "../util/toErrorMap";
import Head from "next/head";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  const [registerWithGoogle] = useRegisterWithGoogleMutation();
  const toast = useToast();

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      // Check if email and username are not null
      const email = result.user.email || ""; // Fallback to empty string if null
      const username = result.user.displayName || "DefaultUsername"; // Provide a default username or handle it differently
      // Send the token to your backend
      const response = await registerWithGoogle({
        variables: {
          options: {
            token,
            email,
            username,
          },
        },
      });
      if (response.data?.registerWithGoogle.errors) {
        // Handle errors
        const errorMessage = response.data.registerWithGoogle.errors
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
      } else {
        // User registered successfully
        router.push("/TwoFactorSetup");
      }
    } catch (error) {
      // Handle Errors here
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Register | Ekko</title>
      </Head>
      <Wrapper variant="small">
        <Flex align="center" justify="center" minH="100vh">
          <Formik
            initialValues={{ email: "", username: "", password: "" }}
            onSubmit={async (values, { setErrors }) => {
              const response = await register({
                variables: { options: values },
                update: (cache, { data }) => {
                  cache.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                      __typename: "Query",
                      me: data?.register.user,
                    },
                  });
                },
              });
              if (response.data?.register.errors) {
                setErrors(toErrorMap(response.data.register.errors));
              } else if (response.data?.register.user) {
                // worked
                router.push("/TwoFactorSetup");
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
                      name="username"
                      placeholder="username"
                      label="Username"
                    />
                  </Box>
                  <Box pt={4}>
                    <InputField
                      name="email"
                      placeholder="email"
                      label="Email"
                      type="text"
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
                  <Button
                    mt={4}
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}
                  >
                    Register
                  </Button>
                  <Button
                    mt={4}
                    ml={2}
                    colorScheme="blue"
                    onClick={handleGoogleSignUp}
                    isLoading={isSubmitting}
                  >
                    Register with Google
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

export default withApollo({ ssr: false })(Register);
