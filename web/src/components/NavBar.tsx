import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../util/isServer";
import { useApolloClient } from "@apollo/client";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({ skip: isServer() });
  let body = null;

  if (loading) {
    // data is loading
  } else if (!data?.me) {
    // you are not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
        <DarkModeSwitch ml={4} />
      </>
    );
  } else {
    // you are logged in
    body = (
      <Flex align="center">
        <NextLink href="/user/[id]" as={`/user/${data.me.id}`}>
          <Link>
            <Box mr={2}>{data.me.username}</Box>
          </Link>
        </NextLink>

        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Log out
        </Button>
        <DarkModeSwitch ml={4} />
      </Flex>
    );
  }
  return (
    <Flex
      zIndex={1}
      position="sticky"
      top={0}
      bg="tomato"
      py={4}
      align="center"
    >
      <Flex maxW={800} align="center" flex={1} px={4} m="auto">
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
