export const changeSort = (
  sort: string,
  subredditTitle: string | undefined
) => {
  let result = "/";
  if (subredditTitle) {
    result += `r/${subredditTitle}/`;
  }
  if (sort === "top") {
    result += "top/";
  }
  return result;
};
