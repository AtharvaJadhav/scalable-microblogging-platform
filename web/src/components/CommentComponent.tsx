import { Box, Text, Link, Flex, Button } from "@chakra-ui/react";
import React from "react";
import {
  CommentSnippetFragment,
  useDeleteCommentMutation,
} from "../generated/graphql";

interface CommentComponentProps {
  c: CommentSnippetFragment;
  meId: number | undefined;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({
  c,
  meId,
}) => {
  const [deleteComment] = useDeleteCommentMutation();
  return (
    <Box mb={4} p={5} shadow="md" borderWidth="1px">
      <Flex align="center">
        <Text fontWeight="bold" mr={2}>
          {c.creator.username || "Anonymous"}:
        </Text>
        {meId === c.creator.id && (
          <Box
            display="flex"
            justifyContent="flex-end"
            flex={1}
            mr={2}
            ml="auto"
          >
            <Button
              onClick={() => {
                deleteComment({
                  variables: { id: c.id },
                  update: (cache) => {
                    cache.evict({ id: "Comment:" + c.id });
                  },
                });
              }}
              colorScheme="red"
              size="xs"
            >
              Delete Comment
            </Button>
          </Box>
        )}
      </Flex>
      <Text mt={4}>{c.text}</Text>
    </Box>
  );
};
