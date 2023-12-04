import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Select,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import { Layout } from "../components/Layout";
import PostPreview from "./PostPreview";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { changeSort } from "../util/changeSort";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { isServer } from "../util/isServer";
// import Image from "next/image";
import { Image } from "@chakra-ui/react";
import { Wrapper } from "./Wrapper";
import Head from "next/head";

interface HomeProps {
  sort: "top" | "new";
}

interface SortSpecificVariablesOptions {
  offset?: number;
  cursor?: string;
}

interface VariablesOptions {
  subredditTitle?: string;
}

const Home: React.FC<HomeProps> = ({ sort }) => {
  const router = useRouter();

  let { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      sort: sort,
      cursor: null
    },
    notifyOnNetworkStatusChange: true,
  });

  const { data: meData } = useMeQuery({ skip: isServer() });

  return (
    <>
      <Head>
        <title>Ekko</title>
      </Head>

      <Layout>
        <Wrapper>
          <Box my={4}>
            <Heading>
              <b>Posts</b>
            </Heading>
          </Box>
          {data && (
            <Flex align="center" mb={4}>
              <Box mr={4}>Sort by:</Box>
              <Box>
                <Select
                  placeholder="Select option"
                  w={100}
                  onChange={(event) => {
                    const newRoute = changeSort(
                      event.target.value,
                    );
                    window.location.href = newRoute;
                  }}
                  value={sort}
                  mr={4}
                >
                  <option value="new">New</option>
                  <option value="top">Top</option>
                </Select>
              </Box>
            </Flex>
          )}
          {!data && loading ? (
            <div>loading...</div>
          ) : !loading && !data ? (
            <div>
              <div>{error?.message}</div>
            </div>
          ) : (
            <Stack spacing={8}>
              {data!.posts.posts.length === 0 ? (
                <div>
                  There are no posts yet. Click{" "}
                  <NextLink
                    href="/create-post"
                    as={`/create-post`}
                  >
                    <Link>here</Link>
                  </NextLink>{" "}
                  to create one!
                </div>
              ) : (
                data!.posts.posts.map((p) =>
                  !p ? null : (
                    <PostPreview
                      p={p}
                      key={p.id}
                    />
                  )
                )
              )}
            </Stack>
          )}
          {data && data.posts.hasMore ? (
            <Flex>
              <Button
                onClick={() => {
                  let sortSpecificVariables: SortSpecificVariablesOptions = {};
                  if (sort === "top") {
                    sortSpecificVariables.offset = data!.posts.offset + 15;
                  } else {
                    sortSpecificVariables.cursor =
                      data!.posts.posts[data!.posts.posts.length - 1].createdAt;
                  }
                  fetchMore({
                    variables: {
                      limit: variables?.limit,
                      sort: sort,
                      ...sortSpecificVariables,
                    },
                  });
                }}
                isLoading={loading}
                m="auto"
                my={8}
              >
                load more
              </Button>
            </Flex>
          ) : null}
        </Wrapper>
      </Layout>
    </>
  );
};

export default Home;
