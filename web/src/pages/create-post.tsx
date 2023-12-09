import { Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../util/useIsAuth";
import { withApollo } from "../util/withApollo";
import Layout from "../components/Layout";
import { Wrapper } from "../components/Wrapper";
import { PostFormComponent } from "../components/PostFormComponent";
import Head from "next/head";
import { PostInput } from "../generated/graphql";

export const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [createPost] = useCreatePostMutation();

  const [url, setUrl] = useState<string>("");
  const [postError, setPostError] = useState<string | null>(null);

  const urlCallbackParent = (url: string) => {
    setUrl(url);
  };

  const submitPost = async (values:PostInput) => {
    try {
      values["imgUrl"] = url;
      const { errors } = await createPost({
        variables: { input: values },
        update: (cache) => {
          cache.evict({ fieldName: "posts:{}" });
        },
      });

      if (!errors) {
        router.push("/");
      } else {
        setPostError("An error occurred while creating the post.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setPostError(error.message);
      } else {
        setPostError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <Head>
        <title>Create Post | Ekko</title>
      </Head>
      <Layout>
        <Wrapper variant="small">
          <Formik
            initialValues={{
              title: "",
              imgUrl: "",
              text: "",
            }}
            onSubmit={submitPost}
          >
            {({ isSubmitting, values }) => (
              <PostFormComponent
                isSubmitting={isSubmitting}
                values={values}
                buttonText="Create post"
                urlCallbackParent={urlCallbackParent}
                errorMessage={postError}
              />
            )}
          </Formik>
        </Wrapper>
      </Layout>
    </>
  );
};

export default withApollo({ ssr: false })(CreatePost);
