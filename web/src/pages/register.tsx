import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withApollo } from "../util/withApollo";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { MeDocument, MeQuery, useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../util/createUrqlClient";
import { toErrorMap } from "../util/toErrorMap";
import Head from "next/head";
import { Layout } from "../components/Layout";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  return (
    <Layout>
      <Head>
        <title>Register | Ekko</title>
      </Head>
      <Wrapper variant="small">
      <Flex align="center" justify="center" minH="50vh">
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
              console.log("Registered User - ", response.data?.register.user);
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
                    type="text" // Corrected type from "fuckoff" to "text"
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
              </Box>
            </Form>
          )}
        </Formik>
        </Flex>
      </Wrapper>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Register);
