import { Button, Box, Link, Flex } from "@chakra-ui/react";
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

export const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Layout>
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
              </Box>
            </Form>
          )}
        </Formik>
        </Flex>
      </Wrapper>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Login);
