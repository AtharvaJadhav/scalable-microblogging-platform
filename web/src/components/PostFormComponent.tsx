import { Box, Button, FormLabel } from "@chakra-ui/react";
import { Form } from "formik";
import React, { useState } from "react";
import { PostInput } from "../generated/graphql";
import { InputField } from "./InputField";
import PhotosUploaderContainer from "./PhotosUploaderContainer";

interface PostFormComponentProps {
  isSubmitting: boolean;
  values: PostInput;
  buttonText: "Create post" | "Update post";
  urlCallbackParent: (url: string) => void;
}

export const PostFormComponent: React.FC<PostFormComponentProps> = ({
  isSubmitting,
  values,
  buttonText,
  urlCallbackParent,
}) => {
  const [url, setUrl] = useState<string>("");
  const urlCallback = (url: string) => {
    setUrl(url);
    urlCallbackParent(url);
  };
  return (
    <Form>
      <Box mt={4}>
        <InputField name="title" placeholder="title" label="Title" />
      </Box>
      <Box mt={4}>
        <FormLabel>Image (optional)</FormLabel>
        <PhotosUploaderContainer name="imgUrl" urlCallback={urlCallback} />
      </Box>
      <Box mt={4}>
        <InputField textarea name="text" placeholder="text..." label="Body" />
      </Box>
      <Button
        mt={4}
        type="submit"
        colorScheme="teal"
        isLoading={isSubmitting}
        disabled={values.title.length === 0 || values.text.length === 0}
      >
        {buttonText}
      </Button>
    </Form>
  );
};
