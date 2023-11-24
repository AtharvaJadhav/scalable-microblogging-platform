import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../util/createUrqlClient";
import { withApollo } from "../util/withApollo";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();
  return (
    <>
      <Head>
        <title>LiReddit</title>
      </Head>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            await forgotPassword({ variables: values });
            setComplete(true);
          }}
        >
          {({ isSubmitting }) =>
            complete ? (
              <Box>
                If an account with that emal exists, we sent you an email
              </Box>
            ) : (
              <Form>
                <Box pt={4}>
                  <InputField
                    name="email"
                    placeholder="Email"
                    label="Email"
                    type="email"
                  />
                </Box>

                <Button
                  mt={4}
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  Forgot password
                </Button>
              </Form>
            )
          }
        </Formik>
      </Wrapper>
    </>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
