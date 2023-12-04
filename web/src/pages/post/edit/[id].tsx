import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withApollo } from "../../../util/withApollo";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../util/createUrqlClient";
import { useGetIntId } from "../../../util/useGetIntId";
import { Wrapper } from "../../../components/Wrapper";
import { PostFormComponent } from "../../../components/PostFormComponent";
import Head from "next/head";

export const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  const [url, setUrl] = useState<string>("");
  const urlCallbackParent = (url: string) => {
    setUrl(url);
  };

  if (loading) {
    return (
      <Layout>
        <Wrapper>
          <div>loading...</div>
        </Wrapper>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Wrapper>
          <Box>could not find post</Box>
        </Wrapper>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Post | Ekko</title>
      </Head>
      <Layout>
        <Wrapper variant="small">
          <Formik
            initialValues={{
              title: data.post.title,
              imgUrl: data.post.imgUrl,
              text: data.post.text,
            }}
            onSubmit={async (values) => {
              values["imgUrl"] = url;
              await updatePost({ variables: { id: intId, ...values } });
              router.back();
            }}
          >
            {({ isSubmitting, values }) => (
              <PostFormComponent
                isSubmitting={isSubmitting}
                values={values}
                buttonText="Update post"
                urlCallbackParent={urlCallbackParent}
              />
            )}
          </Formik>
        </Wrapper>
      </Layout>
    </>
  );
};

export default withApollo({ ssr: false })(EditPost);
