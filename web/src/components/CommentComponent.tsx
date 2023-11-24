import { Box, Link } from "@chakra-ui/react";
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
    <Box mb={4}>
      <b>{c.creator.username || "Anonymous"} </b>
      {meId === c.creator.id && (
        <Link
          onClick={() => {
            deleteComment({
              variables: { id: c.id },
              update: (cache) => {
                cache.evict({ id: "Comment:" + c.id });
              },
            });
          }}
        >
          delete
        </Link>
      )}
      <p>{c.text}</p>
    </Box>
  );
};
