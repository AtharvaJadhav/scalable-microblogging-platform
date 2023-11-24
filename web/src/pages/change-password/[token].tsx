import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../../generated/graphql";
import { createUrqlClient } from "../../util/createUrqlClient";
import { toErrorMap } from "../../util/toErrorMap";
import NextLink from "next/link";
import { withApollo } from "../../util/withApollo";
import Head from "next/head";

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <>
      <Head>
        <title>Change Password | LiReddit</title>
      </Head>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              variables: {
                newPassword: values.newPassword,
                token:
                  typeof router.query.token === "string"
                    ? router.query.token
                    : "",
              },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.changePassword.user,
                  },
                });
              },
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              } else {
                setErrors(errorMap);
              }
            } else if (response.data?.changePassword.user) {
              // worked
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box pt={4}>
                <InputField
                  name="newPassword"
                  placeholder="New Password"
                  label="New Password"
                  type="password"
                />
              </Box>
              {tokenError ? (
                <Flex>
                  <Box mr={2} color="red">
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>Click here to get a new one</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                Change password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
