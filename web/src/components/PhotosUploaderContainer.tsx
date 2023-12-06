/**
 * Source:
 * How to Upload Images to Cloudinary With a React App
 * By @Breellz
 * https://medium.com/geekculture/how-to-upload-images-to-cloudinary-with-a-react-app-f0dcc357999c
 */

import React, { useState } from "react";
import { Button } from "@chakra-ui/react";

interface PhotosUploaderContainerProps {
  urlCallback: (url: string) => void;
  name: string;
}

const PhotosUploaderContainer: React.FC<PhotosUploaderContainerProps> = ({
  urlCallback,
  name,
}) => {
  const [image, setImage] = useState<string | Blob>("");
  const [url, setUrl] = useState("");
  const uploadImage = (e: any) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "srfn4ier");
    data.append("cloud_name", "dwrotudo9");
    fetch("https://api.cloudinary.com/v1_1/dwrotudo9/image/upload", {
      method: "post",
      body: data,
    })
      .then((resp) => resp.json())
      .then((data) => {
        urlCallback(data.url);
        setUrl(data.url);
      })
      .catch((err) => console.log(err));
  };
  return (
    <div>
      <div>
        <input
          type="file"
          name={name}
          onChange={(e) => {
            setImage(e.target.files![0] as Blob);
          }}
        ></input>
        <Button onClick={(e) => uploadImage(e)}>Upload</Button>
      </div>
      <div>
        <img src={url} />
      </div>
    </div>
  );
};
export default PhotosUploaderContainer;
