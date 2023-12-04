import { Box, Heading, Stack } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import PostPreview from "../../components/PostPreview";
import { Wrapper } from "../../components/Wrapper";
import {
  useUserByIdQuery,
  usePostsFromUserQuery,
} from "../../generated/graphql";
import { withApollo } from "../../util/withApollo";

export const User = ({}) => {
  const router = useRouter();
  const { id } = router.query;

  // Should be 1 query, really
  const { data: userData } = useUserByIdQuery({
    variables: {
      userId: parseInt(id as string) as never,
    },
  });
  const { data, error, loading } = usePostsFromUserQuery({
    variables: {
      userId: parseInt(id as string) as never,
    },
  });

  if (!loading && !data) {
    return (
      <div>
        <div>{error?.message}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <div>loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {userData?.userById?.username
            ? userData.userById.username + " | "
            : ""}
          Ekko
        </title>
      </Head>
      <Layout>
        <Wrapper>
          <Box my={4}>
            <Heading>
              Posts by <b>{userData?.userById?.username}</b>
            </Heading>
          </Box>
          <Box>
            {!data && loading ? (
              <div>loading...</div>
            ) : (
              <Stack spacing={8}>
                {data!.postsFromUser.length === 0 ? (
                  <div>this user has no posts yet</div>
                ) : (
                  data!.postsFromUser.map((p) =>
                    !p ? null : <PostPreview p={p} key={p.id} />
                  )
                )}
              </Stack>
            )}
          </Box>
        </Wrapper>
      </Layout>
    </>
  );
};

export default withApollo({ ssr: true })(User); 
