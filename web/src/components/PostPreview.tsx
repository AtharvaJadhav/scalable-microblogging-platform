import {
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import EditDeletePostButtons from "./EditDeletePostButtons";
import UpdootSection from "./UpdootSection";

interface PostPreviewProps {
  p: PostSnippetFragment;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  p,
}) => {
  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <UpdootSection post={p} />
      <Box flex={1}>
        <NextLink href="/post/[id]" as={`/post/${p.id}`}>
          <Link>
            <Heading fontSize="xl">{p.title}</Heading>
          </Link>
        </NextLink>
        <Text>
          posted by{" "}
          <NextLink href="/user/[id]" as={`/user/${p.creator.id}`}>
            <Link>{p.creator.username}</Link>
          </NextLink>
        </Text>
        <Flex align="center">
          {p.imgUrl ? (
            <Center flex={1}>
              <Image src={p.imgUrl} alt="Post image" mt={4} />
            </Center>
          ) : (
            <Text flex={1} mt={4}>
              {p.textSnippet}
            </Text>
          )}
          <Box ml={4}>
            <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default PostPreview;
