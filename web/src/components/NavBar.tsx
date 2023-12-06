import React from "react";
import { Box, Link, Flex, Button, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../util/isServer";
import { useApolloClient } from "@apollo/client";
import { DarkModeSwitch } from "./DarkModeSwitch";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({ skip: isServer() });
  let body = null;
  console.log("Data ", data)

  // data is loading
  if (loading) {
    // user not logged in
  } else if (!data?.me) {
    // console.log("In 222")
    // console.log(data)
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>
            <Button>Login</Button>
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={4}>
            <Button>Register</Button>
          </Link>
        </NextLink>
        <DarkModeSwitch ml={4} />
      </>
    );
    // user is logged in
  } else {
    // console.log("In 333")
    // console.log(data)
    body = (
      <Flex align="center">
        <NextLink href="/create-post" as={`/create-post`}>
          <Button mr={4}>Create Post</Button>
        </NextLink>
        <Box mr={2}>
          <NextLink href="/user/[id]" as={`/user/${data.me.id}`}>
            <Button>{data.me.username}</Button>
          </NextLink>
        </Box>
        <Box mr={2}>
          <Button
            onClick={async () => {
              await logout();
              await apolloClient.resetStore();
            }}
            isLoading={logoutFetching}
            color="white"
            bgColor="red"
          >
            Logout
          </Button>
        </Box>
        <DarkModeSwitch ml={4} />
      </Flex>
    );
  }
  return (
    <Flex zIndex={1} position="sticky" top={0} bg="blue" py={4} align="center">
      <Flex maxW={1500} align="center" flex={1} px={4} m="auto">
        <NextLink href="/">
          <Link>
            <Heading>Ekko</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
