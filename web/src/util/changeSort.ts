export const changeSort = (
  sort: string,
) => {
  let result = "/";
  if (sort === "top") {
    result += "top/";
  }
  return result;
};
